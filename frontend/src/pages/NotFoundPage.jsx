import { Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-100">
        <HardHat className="h-8 w-8 text-secondary-400" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold text-secondary-900">404</h1>
      <p className="mt-2 text-secondary-500">Sorry, we couldn't find the page you're looking for.</p>
      <Link to="/" className="mt-6">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
