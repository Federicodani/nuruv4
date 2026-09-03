import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, HardHat, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/professionals', label: 'Professionals' },
  { to: '/materials', label: 'Materials' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/projects', label: 'Projects' },
  { to: '/nuru-electricals', label: 'Glec Electricals' },
];

const dashboardPathForRole = (role) => {
  if (role === 'professional') return '/dashboard/professional';
  if (role === 'store_owner') return '/dashboard/store';
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'client') return '/dashboard/client';
  return '/dashboard/client';
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-secondary-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
            <HardHat className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-secondary-900">
            Nuru<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary-700 bg-primary/10'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPathForRole(user.role)}>
                <Button variant="outline" size="sm" icon={LayoutDashboard}>
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={User}>
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="rounded-md p-2 text-secondary-700 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-secondary-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-primary/10 text-primary-700' : 'text-secondary-700 hover:bg-secondary-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-secondary-100 pt-3">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPathForRole(user.role)} onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="md" fullWidth icon={LayoutDashboard}>
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="md" fullWidth icon={LogOut} onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="md" fullWidth>
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="md" fullWidth icon={User}>
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
