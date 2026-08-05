export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 xl:px-10">
      <section className="grid gap-4 lg:grid-cols-12">
        <article className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:col-span-7 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contact</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Bring preventive monitoring to your care ecosystem</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Talk with us about pilots, eldercare center partnerships, hospital integration, and deployment strategy.
          </p>

          <form className="mt-5 grid gap-3 md:grid-cols-2">
            <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500" placeholder="Full Name" />
            <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500" placeholder="Email" />
            <input className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 md:col-span-2" placeholder="Organization" />
            <textarea className="min-h-28 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 md:col-span-2" placeholder="What are you looking to implement?" />
            <button type="button" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 md:col-span-2">
              Send Inquiry
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:col-span-5">
          <h3 className="text-lg font-semibold text-slate-900">Team Contacts</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><span className="font-semibold">Research & Pitch:</span> Ashish</p>
            <p><span className="font-semibold">Backend/API:</span> Aditya</p>
            <p><span className="font-semibold">AI/CV:</span> Krishiv</p>
            <p><span className="font-semibold">Frontend:</span> Manthan</p>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            IEEE Ideathon prototype. Non-diagnostic preventive intelligence for eldercare.
          </div>
        </article>
      </section>
    </div>
  );
}
