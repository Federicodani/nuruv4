import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import ProfessionalCard from '../professionals/ProfessionalCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { Users } from 'lucide-react';
import { getProfessionals } from '../../api/professionalApi';

const FeaturedProfessionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await getProfessionals();
        setProfessionals(data.professionals.slice(0, 4));
      } catch {
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (value) => {
    navigate(`/professionals${value ? `?search=${encodeURIComponent(value)}` : ''}`);
  };

  return (
    <section className="bg-secondary-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
              Featured Professionals
            </h2>
            <p className="mt-2 text-secondary-500">Top-rated experts ready to work on your project</p>
          </div>
          <Link
            to="/professionals"
            className="flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto mt-6 max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            placeholder="Search professionals..."
          />
        </div>

        <div className="mt-8">
          {loading ? (
            <LoadingSpinner label="Loading professionals..." />
          ) : professionals.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No professionals yet"
              description="Be the first professional to join Nuru Construction Hub."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {professionals.map((pro) => (
                <ProfessionalCard key={pro._id} professional={pro} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfessionals;
