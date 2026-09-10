"""Kutaksha RAG assistant.

Extracted from `Kutaksha Rag.ipynb` and adapted to run inside FastAPI:

* no `input()` loop, no notebook-only display calls
* the docs folder comes from `RAG_DOCS_DIR` instead of a hardcoded D:\\ path
* the compiled graph is called `graph`, not `app` (that name is FastAPI's)
* config is validated *before* the heavy imports, so the backend still starts
  when langgraph/faiss/torch are not installed
"""

from __future__ import annotations

import os
import json
import threading
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from app.services.rag_service import RagService, RagUnavailable
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

DEFAULT_DOCS_DIR = Path(__file__).resolve().parents[2] / "docs"
DEFAULT_INDEX_DIR = Path(__file__).resolve().parents[2] / "rag_index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

_service: Optional[RagService] = None
_lock = threading.Lock()


def reset_cache() -> None:
    """Drop the cached service. Used by tests and after re-indexing."""
    global _service
    with _lock:
        _service = None


def docs_dir() -> Path:
    return Path(os.getenv("RAG_DOCS_DIR") or DEFAULT_DOCS_DIR)


def index_dir() -> Path:
    return Path(os.getenv("RAG_INDEX_DIR") or DEFAULT_INDEX_DIR)


def _check_config() -> Path:
    """Validate everything cheap before importing the heavy stack."""
    if not os.getenv("GOOGLE_API_KEY"):
        raise RagUnavailable(
            "GOOGLE_API_KEY is not set. Add it to backend/.env to enable the assistant."
        )

    folder = docs_dir()
    if not folder.exists():
        raise RagUnavailable(
            f"RAG docs folder not found: {folder}. "
            "Create it and add the patient report PDFs."
        )
    if not any(folder.glob("*.pdf")):
        raise RagUnavailable(
            f"No PDF documents found in {folder}. "
            "The assistant needs at least one medical report PDF."
        )
    return folder


def build_rag_service() -> RagService:
    """Return the RAG service, building the graph and indexes on first call."""
    global _service
    if _service is not None:
        return _service

    with _lock:
        if _service is None:
            _check_config()
            try:
                _service = RagService(_build_graph())
            except RagUnavailable:
                raise
            except ImportError as exc:
                raise RagUnavailable(
                    f"RAG dependencies are not installed ({exc}). "
                    "Run: pip install -r requirements-rag.txt"
                ) from exc
    return _service


def _build_graph():
    """Build the LangGraph pipeline. Heavy imports live here, not at module top."""
    from langchain_community.document_loaders import (
        CSVLoader,
        DirectoryLoader,
        PyMuPDFLoader,
    )
    from langchain_community.vectorstores import FAISS
    from langchain_core.messages import HumanMessage
    from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langgraph.graph import END, START, StateGraph
    from langgraph.graph.message import add_messages
    from pydantic import BaseModel, Field
    from typing_extensions import TypedDict

    folder = docs_dir()
    llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL)

    # ---------------------------------------------------------------- indexes
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    general_path = index_dir() / "general"
    medical_path = index_dir() / "medical"

    if general_path.exists() and medical_path.exists():
        # Locally-built indexes, written by this same code. Safe to deserialize.
        vector_store = FAISS.load_local(
            str(general_path), embeddings, allow_dangerous_deserialization=True
        )
        medical_store = FAISS.load_local(
            str(medical_path), embeddings, allow_dangerous_deserialization=True
        )
    else:
        pdf_docs = DirectoryLoader(
            str(folder), glob="*.pdf", loader_cls=PyMuPDFLoader
        ).load()
        csv_docs = DirectoryLoader(str(folder), glob="*.csv", loader_cls=CSVLoader).load()

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        pdf_chunks = splitter.split_documents(pdf_docs)
        csv_chunks = splitter.split_documents(csv_docs)

        if not pdf_chunks:
            raise RagUnavailable(
                f"No PDF chunks were produced from {folder}. The PDFs may be empty "
                "or image-only (no extractable text)."
            )

        vector_store = FAISS.from_documents(pdf_chunks + csv_chunks, embeddings)
        # Dedicated medical index so large sensor CSVs cannot drown out the reports.
        medical_store = FAISS.from_documents(pdf_chunks, embeddings)

        index_dir().mkdir(parents=True, exist_ok=True)
        vector_store.save_local(str(general_path))
        medical_store.save_local(str(medical_path))

    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    medical_retriever = medical_store.as_retriever(search_kwargs={"k": 5})

    def rag_search(user_query: str, search_type: str = "general") -> str:
        query = (user_query or "").strip()
        if not query:
            return "No query was supplied to RAG."

        active = medical_retriever if search_type == "medical_report" else retriever
        docs = active.invoke(query)
        if not docs:
            return "No relevant information found in the RAG knowledge base."

        results = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "unknown source")
            page = doc.metadata.get("page")
            location = source + (f" | page {page + 1}" if isinstance(page, int) else "")
            results.append(f"RESULT {i}\nSOURCE: {location}\n{doc.page_content}")
        return "\n\n---\n\n".join(results)

    # ------------------------------------------------------------------ state
    class UltimateState(TypedDict, total=False):
        patient_id: str
        patient_name: str
        user_query: str
        user_intent: str
        final_response: str
        medication_data: str
        recieved_documents: list
        retrieved_context: str
        analysis_result: str
        intent_agent: str
        reportanalyzer_agent: str
        messages: list
        chat_history: list
        behavior_context: Dict[str, Any]

    class UserIntent(BaseModel):
        intent: Literal[
            "seeking factual data",
            "seeking reports analyzation",
            "seeking medication analysis",
            "general medical context",
            "doctoral prescription and medical records",
        ]

    class ReportAnalyzerOutput(BaseModel):
        report: str = Field(description="Report generated from the retrieved documents.")
        keyfindings: List[str] = Field(description="Important findings identified.")
        resources: List[str] = Field(description="Sources used to generate the report.")

    class MedicationOutput(BaseModel):
        prescribed_medications: List[str] = Field(description="Medications prescribed.")
        medication_changes: List[str] = Field(description="Changes in medication.")
        key_findings: List[str] = Field(description="Medication-related findings.")
        analysis: str = Field(description="Analysis based only on retrieved documents.")
        sources: List[str] = Field(description="Sources used.")

    report_llm = llm.with_structured_output(ReportAnalyzerOutput)
    medication_llm = llm.with_structured_output(MedicationOutput)
    intent_llm = llm.with_structured_output(UserIntent)

    def behavior_evidence(state: Dict[str, Any]) -> str:
        context = state.get("behavior_context") or {}
        if not context:
            return "No frontend behavior data was supplied for this question."
        return json.dumps(context, ensure_ascii=True, indent=2)

    # ------------------------------------------------------------------ nodes
    def user_query(state: Dict[str, Any]) -> Dict[str, Any]:
        query = (state.get("user_query") or "").strip()
        if not query:
            raise ValueError("No user query was supplied to the chatbot.")
        return {"user_query": query, "messages": [HumanMessage(content=query)]}

    def intent_agent(state: Dict[str, Any]) -> Dict[str, Any]:
        prompt = PromptTemplate(
            template="""
You are a router agent. Your only job is to identify the intent of the
user query and return exactly ONE of the allowed categories.

Allowed categories:
- seeking factual data
- seeking reports analyzation
- seeking medication analysis
- general medical context
- doctoral prescription and medical records

User query:
{user_query}
""",
            input_variables=["user_query"],
        )
        result = intent_llm.invoke(prompt.format(user_query=state["user_query"]))
        return {"user_intent": result.intent, "intent_agent": result.intent}

    def retrieve(state: Dict[str, Any]) -> Dict[str, Any]:
        retrieved = rag_search(state["user_query"], search_type="medical_report")
        return {"retrieved_context": retrieved, "recieved_documents": [retrieved]}

    def report_analysis(state: Dict[str, Any]) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a medical-report and behavior analysis assistant.
Answer the user's query using ONLY the retrieved medical report and frontend behavior evidence below.
Give a clear, useful answer with:
1. Key findings
2. Relevant clinical details
3. Relevant behavior trends compared with the supplied baseline, when applicable
4. Source used
Do not invent missing facts, diagnose, or prescribe. Treat behavior metrics as observational signals, not a diagnosis.
If the retrieved text says no relevant information was found, say so.""",
                ),
                (
                    "human",
                    "User Query:\n{user_query}\n\nRetrieved Medical Report:\n{retrieved_information}\n\nFrontend Behavior Evidence:\n{behavior_information}",
                ),
            ]
        )
        result = report_llm.invoke(
            prompt.format_messages(
                user_query=state["user_query"],
                retrieved_information=state.get("retrieved_context", ""),
                behavior_information=behavior_evidence(state),
            )
        )
        answer = (result.report or "").strip() or "No report analysis was generated."
        findings = "\n".join(f"- {x}" for x in result.keyfindings) or "- None extracted."
        sources = "\n".join(f"- {x}" for x in result.resources) or "- Retrieved report"
        return {
            "analysis_result": f"{answer}\n\nKey Findings:\n{findings}\n\nSources:\n{sources}",
            "recieved_documents": result.resources or state.get("recieved_documents", []),
        }

    def medication_analysis(state: Dict[str, Any]) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """Analyze the retrieved medication information and frontend behavior evidence.
Use ONLY the supplied evidence. Do not invent or assume medication information.
Mention behavior context only when it is relevant to the user's question.
Do not prescribe new medication.""",
                ),
                (
                    "human",
                    "User Query:\n{user_query}\n\nRetrieved Information:\n{retrieved_information}\n\nFrontend Behavior Evidence:\n{behavior_information}",
                ),
            ]
        )
        result = medication_llm.invoke(
            prompt.format_messages(
                user_query=state["user_query"],
                retrieved_information=state.get("retrieved_context", ""),
                behavior_information=behavior_evidence(state),
            )
        )
        return {
            "analysis_result": result.analysis,
            "medication_data": result.model_dump_json(),
            "recieved_documents": result.sources or state.get("recieved_documents", []),
        }

    def general_analysis(state: Dict[str, Any]) -> Dict[str, Any]:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a patient medical-record and behavior assistant.
Answer the user's question using the retrieved medical records and frontend behavior evidence below.

Rules:
- Use the retrieved records as the evidence.
- If the requested case/patient is present in the retrieved records, answer from it clearly.
- Do not claim that information is unavailable merely because the intent is 'medical records'.
- Only say information is unavailable when the retrieved context genuinely does not contain it.
- Do not invent patient facts.
- Treat behavior metrics as observational signals and compare them with the supplied baseline when relevant.
- Do not diagnose or prescribe new treatment.
- Keep the answer concise but include the important clinical details and source when available.""",
                ),
                (
                    "human",
                    "User Query:\n{user_query}\n\nRetrieved Medical Records:\n{retrieved_information}\n\nFrontend Behavior Evidence:\n{behavior_information}",
                ),
            ]
        )
        result = llm.invoke(
            prompt.format_messages(
                user_query=state["user_query"],
                retrieved_information=state.get("retrieved_context", ""),
                behavior_information=behavior_evidence(state),
            )
        )
        return {"analysis_result": result.content}

    def analysis_router(state: Dict[str, Any]) -> str:
        if state.get("user_intent") == "seeking reports analyzation":
            return "report_analysis"
        if state.get("user_intent") == "seeking medication analysis":
            return "medication_analysis"
        return "general_analysis"

    # ------------------------------------------------------------------ graph
    workflow = StateGraph(UltimateState)
    workflow.add_node("user_query", user_query)
    workflow.add_node("intent_agent", intent_agent)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("report_analysis", report_analysis)
    workflow.add_node("medication_analysis", medication_analysis)
    workflow.add_node("general_analysis", general_analysis)

    workflow.add_edge(START, "user_query")
    workflow.add_edge("user_query", "intent_agent")
    workflow.add_edge("intent_agent", "retrieve")
    workflow.add_conditional_edges(
        "retrieve",
        analysis_router,
        {
            "report_analysis": "report_analysis",
            "medication_analysis": "medication_analysis",
            "general_analysis": "general_analysis",
        },
    )
    workflow.add_edge("report_analysis", END)
    workflow.add_edge("medication_analysis", END)
    workflow.add_edge("general_analysis", END)

    return workflow.compile()
