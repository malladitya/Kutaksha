import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/platform', label: 'Platform' },
  { path: '/technology', label: 'Technology' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/demo', label: 'Live Demo' },
  { path: '/contact', label: 'Contact' },
];

const roleDashboard = {
  patient: { path: '/dashboard/patient', label: 'My Tracking' },
  caretaker: { path: '/dashboard/caretaker', label: 'Care Dashboard' },
  doctor: { path: '/dashboard/doctor', label: 'Patients' },
};

export default function SiteHeader({ currentPath, onNavigate }) {
  const { user, logout, isAuthenticated } = useAuth();
  const dash = user ? roleDashboard[user.role] : null;

  return (
    <header className="sticky top-4 z-40 mx-auto mb-6 w-full max-w-7xl px-4 md:px-6 lg:px-8 xl:px-10">
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => onNavigate('/')} className="text-left">
            <p className="text-[10px] uppercase tracking-[0.25em] text-teal-700">Kutaksha</p>
            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">Preventive Healthcare Digital Twin</h1>
          </button>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const active = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {isAuthenticated && dash && (
              <button
                type="button"
                onClick={() => onNavigate(dash.path)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  currentPath === dash.path ? 'bg-emerald-600 text-white' : 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {dash.label}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] text-slate-500 sm:inline">{user.name} ({user.role})</span>
                <button
                  type="button"
                  onClick={() => { logout(); onNavigate('/login'); }}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  currentPath === '/login' ? 'bg-teal-600 text-white' : 'border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100'
                }`}
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
