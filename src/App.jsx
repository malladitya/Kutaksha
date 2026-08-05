import { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import HomePage from './pages/HomePage';
import PlatformPage from './pages/PlatformPage';
import TechnologyPage from './pages/TechnologyPage';
import PrivacyPage from './pages/PrivacyPage';
import DemoPage from './pages/DemoPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import CaretakerDashboard from './pages/CaretakerDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function getPathname() {
  return window.location.pathname || '/';
}

const PROTECTED_ROUTES = {
  '/dashboard/patient': 'patient',
  '/dashboard/caretaker': 'caretaker',
  '/dashboard/doctor': 'doctor',
};

function AppRoutes() {
  const [path, setPath] = useState(getPathname());
  const { user, loading } = useAuth();

  useEffect(() => {
    const onPopState = () => setPath(getPathname());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (nextPath) => {
    if (!nextPath || nextPath === path) return;
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const requiredRole = PROTECTED_ROUTES[path];
    if (!requiredRole || loading) return;
    if (!user) return;
    if (user.role !== requiredRole) {
      const routes = { patient: '/dashboard/patient', caretaker: '/dashboard/caretaker', doctor: '/dashboard/doctor' };
      navigate(routes[user.role] || '/login');
    }
  }, [path, user, loading]);

  const page = useMemo(() => {
    const requiredRole = PROTECTED_ROUTES[path];
    if (requiredRole) {
      if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading...</div>;
      if (!user) return <LoginPage onNavigate={navigate} />;
      if (user.role !== requiredRole) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Redirecting...</div>;
    }

    switch (path) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/platform':
        return <PlatformPage onNavigate={navigate} />;
      case '/technology':
        return <TechnologyPage onNavigate={navigate} />;
      case '/privacy':
        return <PrivacyPage onNavigate={navigate} />;
      case '/demo':
        return <DemoPage onNavigate={navigate} />;
      case '/contact':
        return <ContactPage onNavigate={navigate} />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/dashboard/patient':
        return <PatientDashboard />;
      case '/dashboard/caretaker':
        return <CaretakerDashboard />;
      case '/dashboard/doctor':
        return <DoctorDashboard />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  }, [path, user, loading]);

  return (
    <div className="site-shell min-h-screen pb-2 text-slate-900">
      <SiteHeader currentPath={path} onNavigate={navigate} />
      <main>{page}</main>
      <SiteFooter onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
