import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HardHat, Mail, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';

const dashboardPathForRole = (role) => {
  if (role === 'professional') return '/dashboard/professional';
  if (role === 'store_owner') return '/dashboard/store';
  if (role === 'admin') return '/dashboard/admin';
  return '/';
};

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(form);
      const redirectTo = location.state?.from || dashboardPathForRole(user.role);
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-secondary-100 bg-white p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
            <HardHat className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-secondary-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-secondary-500">Login to your Nuru Hub account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <Input
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
