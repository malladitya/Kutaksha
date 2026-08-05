const featureCards = [
  {
    title: 'Unobtrusive Behavior Monitoring',
    text: 'Camera-based motion understanding with on-device/secure processing. No wearables. No routine change for seniors.',
  },
  {
    title: 'Trajectory-First Intelligence',
    text: 'Kutaksha focuses on trend deterioration over days, not only emergency event detection in a single moment.',
  },
  {
    title: 'Personalized Digital Twin',
    text: 'Each patient is compared to their own baseline behavioral pattern, creating highly individualized preventive alerts.',
  },
  {
    title: 'Explainable Preventive Alerts',
    text: 'Risk score shifts are translated to natural-language recommendations for caregivers and care teams.',
  },
];

export default function HomePage({ onNavigate }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 xl:px-10">
      <section className="mb-6 grid gap-4 lg:grid-cols-12">
        <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:col-span-7 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-700">Kutaksha Vision</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Keeping seniors safe, independent, and connected through preventive intelligence.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
            Healthcare systems are often reactive. Kutaksha predicts decline before emergencies by learning each patient&apos;s normal behavior and tracking long-term trajectory shifts with a privacy-preserving digital twin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/demo')}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View Live Demo
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/platform')}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Explore Platform
            </button>
          </div>
        </article>

        <article className="rounded-3xl border border-white/70 bg-gradient-to-br from-white/85 via-amber-50/70 to-teal-50/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-600">Why This Matters</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-2xl font-semibold text-slate-900">1 in 4</p>
              <p className="mt-1 text-xs text-slate-600">will be aged 65+ in many urban populations by 2030.</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-2xl font-semibold text-slate-900">Early Risk</p>
              <p className="mt-1 text-xs text-slate-600">subtle decline appears days before critical events.</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-2xl font-semibold text-slate-900">Privacy-First</p>
              <p className="mt-1 text-xs text-slate-600">no cloud raw video storage in our architecture.</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-2xl font-semibold text-slate-900">BHTE</p>
              <p className="mt-1 text-xs text-slate-600">Behavioral Health Trajectory Engine for forecasting.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="mb-6 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Who We Are</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Preventive AI for eldercare teams and families</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/privacy')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Privacy Principles
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-white/85 p-4">
              <h4 className="text-base font-semibold text-slate-900">{card.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-2 grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Step 1</p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">Learn Baseline</h4>
          <p className="mt-2 text-sm text-slate-700">Build patient-specific digital twin using passive behavioral data.</p>
        </article>
        <article className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Step 2</p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">Track Trajectory</h4>
          <p className="mt-2 text-sm text-slate-700">Continuously measure change in speed, activity, posture, and inactivity.</p>
        </article>
        <article className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Step 3</p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">Alert Early</h4>
          <p className="mt-2 text-sm text-slate-700">Generate explainable preventive risk signals before critical incidents.</p>
        </article>
      </section>
    </div>
  );
}
