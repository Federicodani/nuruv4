import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HardHat, Mail, Lock, Phone, User as UserIcon } from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'client', label: 'Client - I want to hire professionals or buy materials' },
  { value: 'professional', label: 'Professional - I offer construction services' },
  { value: 'store_owner', label: 'Store Owner - I sell materials/products' },
];

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const dashboardPathForRole = (role) => {
    if (role === 'professional') return '/dashboard/professional';
    if (role === 'store_owner') return '/dashboard/store';
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const user = await register(form);
      navigate(dashboardPathForRole(user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="mt-4 text-2xl font-bold text-secondary-900">Create Your Account</h1>
          <p className="mt-1 text-sm text-secondary-500">Join Nuru Construction Hub today</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <Input
            label="Full Name"
            name="fullName"
            icon={UserIcon}
            placeholder="John Doe"
            value={form.fullName}
            onChange={handleChange}
            required
          />
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
            label="Phone Number"
            name="phone"
            icon={Phone}
            placeholder="0712345678"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <Select
            label="I am registering as a"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={ROLE_OPTIONS}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            icon={Lock}
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            minLength={6}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
