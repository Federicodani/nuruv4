import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, Package, Store as StoreIcon, LayoutGrid } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ProfessionalCard from '../components/professionals/ProfessionalCard';
import ProductCard from '../components/materials/ProductCard';
import ProjectCard from '../components/projects/ProjectCard';
import Badge from '../components/common/Badge';
import { getInitials } from '../utils/helpers';
import { globalSearch } from '../api/searchApi';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ professionals: [], products: [], stores: [], projects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) return;
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await globalSearch(query);
        setResults({
          professionals: data.results.professionals || [],
          products: data.results.products || [],
          stores: data.results.stores || [],
          projects: data.results.projects || [],
        });
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const totalResults =
    results.professionals.length +
    results.products.length +
    results.stores.length +
    results.projects.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
        Search Results for "{query}"
      </h1>

      {loading ? (
        <LoadingSpinner label="Searching..." />
      ) : error ? (
        <EmptyState icon={Search} title="Something went wrong" description={error} />
      ) : totalResults === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description="Try a different search term or browse our categories."
        />
      ) : (
        <div className="mt-8 space-y-12">

          {/* Professionals */}
          {results.professionals.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-secondary-900">
                <Users className="h-5 w-5 text-primary" /> Professionals
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {results.professionals.map((pro) => (
                  <ProfessionalCard key={pro._id} professional={pro} />
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-secondary-900">
                <LayoutGrid className="h-5 w-5 text-primary" /> Projects
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {results.products.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-secondary-900">
                <Package className="h-5 w-5 text-primary" /> Materials
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {results.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Stores */}
          {results.stores.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-secondary-900">
                <StoreIcon className="h-5 w-5 text-primary" /> Stores
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.stores.map((store) => (
                  <Link
                    key={store._id}
                    to={`/stores/${store._id}`}
                    className="flex items-center gap-4 rounded-xl border border-secondary-100 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
                      {store.logo?.url ? (
                        <img src={store.logo.url} alt={store.storeName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-bold text-white">{getInitials(store.storeName)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-secondary-900 truncate">{store.storeName}</h3>
                        {store.isNuruElectricals && <Badge variant="primary">Recommended</Badge>}
                      </div>
                      <p className="text-sm text-secondary-500">{store.town}, {store.county}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
