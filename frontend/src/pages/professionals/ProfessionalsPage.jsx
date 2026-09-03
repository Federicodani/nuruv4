import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, SlidersHorizontal, X } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import ProfessionalCard from '../../components/professionals/ProfessionalCard';
import ProfessionalFilters from '../../components/professionals/ProfessionalFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { getProfessionals } from '../../api/professionalApi';
import { getConstants } from '../../api/searchApi';

const ProfessionalsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [constants, setConstants] = useState({ professions: [], counties: [] });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    profession: searchParams.get('profession') || '',
    county: searchParams.get('county') || '',
  });

  useEffect(() => {
    getConstants()
      .then(({ data }) => setConstants(data))
      .catch(() => {});
  }, []);

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchInput) params.search = searchInput;
      if (filters.profession) params.profession = filters.profession;
      if (filters.county) params.county = filters.county;

      const { data } = await getProfessionals(params);
      setProfessionals(data.professionals);
    } catch {
      setError('Failed to load professionals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchInput, filters]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleSearch = (value) => {
    setSearchInput(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set('search', value);
    else params.delete('search');
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({ profession: '', county: '' });
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Find Professionals</h1>
        <p className="mt-1 text-secondary-500">
          Browse verified construction professionals across Kenya
        </p>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          placeholder="Search professionals..."
        />
      </div>

      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          icon={SlidersHorizontal}
          onClick={() => setShowMobileFilters(true)}
        >
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <ProfessionalFilters
            filters={filters}
            setFilters={setFilters}
            professions={constants.professions}
            counties={constants.counties}
            onClear={handleClearFilters}
          />
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-secondary-900/60"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="relative z-10 ml-auto h-full w-80 overflow-y-auto bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-secondary-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="h-5 w-5 text-secondary-500" />
                </button>
              </div>
              <ProfessionalFilters
                filters={filters}
                setFilters={setFilters}
                professions={constants.professions}
                counties={constants.counties}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        )}

        <div>
          {loading ? (
            <LoadingSpinner label="Loading professionals..." />
          ) : error ? (
            <EmptyState icon={Users} title="Something went wrong" description={error} />
          ) : professionals.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No professionals found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((pro) => (
                <ProfessionalCard key={pro._id} professional={pro} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalsPage;
