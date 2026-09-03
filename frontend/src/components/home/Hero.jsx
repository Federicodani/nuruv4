import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, Package, Calculator, LayoutGrid } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';

const Hero = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.15),_transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Find Trusted Construction Professionals and Materials
          </h1>
          <p className="mt-5 text-base text-secondary-300 sm:text-lg">
            Connect with builders, electricians, suppliers and hardware stores all in one place.
          </p>

          <div className="mt-8">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              placeholder="Search electricians, masons, cables, cement, stores..."
              size="lg"
            />
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              icon={HardHat}
              onClick={() => navigate('/professionals')}
            >
              Find Professionals
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={Package}
              className="!bg-white/5 !text-white !border-white/20 hover:!bg-white/10"
              onClick={() => navigate('/materials')}
            >
              Browse Materials
            </Button>
          </div>

          {/* Quick access to planning tools */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/cost-estimator"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-secondary-300 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <Calculator className="h-4 w-4" /> Cost Estimator
            </Link>
            <Link
              to="/material-estimator"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-secondary-300 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <Package className="h-4 w-4" /> Material Estimator
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-secondary-300 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <LayoutGrid className="h-4 w-4" /> Inspiration Gallery
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
