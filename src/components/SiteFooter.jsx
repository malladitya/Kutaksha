export default function SiteFooter({ onNavigate }) {
  return (
    <footer className="mx-auto mt-8 w-full max-w-7xl px-4 pb-8 md:px-6 lg:px-8 xl:px-10">
      <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Kutaksha</p>
            <p className="mt-2 max-w-xl text-sm text-slate-700">
              Privacy-preserving AI digital twin platform for preventive eldercare. Built for early intervention, not diagnosis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['/', '/platform', '/technology', '/privacy', '/demo', '/contact'].map((path) => (
              <button
                key={path}
                type="button"
                onClick={() => onNavigate(path)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
              >
                {path === '/' ? 'Home' : path.replace('/', '').replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
