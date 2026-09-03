import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, HardHat, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ sidebarLinks, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-2 pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <HardHat className="h-5 w-5 text-secondary" />
        </div>
        <span className="text-lg font-bold text-white">
          Nuru<span className="text-primary">Hub</span>
        </span>
      </div>
      <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wider text-secondary-500">
        {title}
      </p>
      <nav className="flex flex-1 flex-col gap-1">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-secondary'
                  : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-secondary-800 pt-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-300 hover:bg-secondary-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-300 hover:bg-secondary-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-secondary-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col bg-secondary px-4 py-6 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-secondary-900/60" onClick={() => setIsOpen(false)} />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-secondary px-4 py-6">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-secondary-200 bg-white px-4 lg:hidden">
          <span className="text-base font-bold text-secondary-900">{title}</span>
          <button onClick={() => setIsOpen(true)} className="rounded-md p-2 text-secondary-700">
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
