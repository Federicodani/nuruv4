import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, SlidersHorizontal, X } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import ProductCard from '../../components/materials/ProductCard';
import ProductFilters from '../../components/materials/ProductFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { getProducts } from '../../api/productApi';
import { getConstants } from '../../api/searchApi';

const MaterialsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [constants, setConstants] = useState({ productCategories: [] });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
  });

  useEffect(() => {
    getConstants()
      .then(({ data }) => setConstants(data))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchInput) params.search = searchInput;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;

      const { data } = await getProducts(params);
      setProducts(data.products);
    } catch {
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchInput, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (value) => {
    setSearchInput(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set('search', value);
    else params.delete('search');
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({ category: '', location: '' });
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Materials Marketplace</h1>
        <p className="mt-1 text-secondary-500">
          Quality construction materials from trusted hardware and electrical stores
        </p>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          placeholder="Search materials..."
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
          <ProductFilters
            filters={filters}
            setFilters={setFilters}
            categories={constants.productCategories}
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
              <ProductFilters
                filters={filters}
                setFilters={setFilters}
                categories={constants.productCategories}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        )}

        <div>
          {loading ? (
            <LoadingSpinner label="Loading materials..." />
          ) : error ? (
            <EmptyState icon={Package} title="Something went wrong" description={error} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No materials found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialsPage;
