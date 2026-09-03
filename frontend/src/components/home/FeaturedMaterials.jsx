import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import ProductCard from '../materials/ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { getProducts } from '../../api/productApi';

const FeaturedMaterials = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await getProducts();
        setProducts(data.products.slice(0, 4));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (value) => {
    navigate(`/materials${value ? `?search=${encodeURIComponent(value)}` : ''}`);
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Featured Materials</h2>
            <p className="mt-2 text-secondary-500">Quality building materials from trusted stores</p>
          </div>
          <Link
            to="/materials"
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
            placeholder="Search materials..."
          />
        </div>

        <div className="mt-8">
          {loading ? (
            <LoadingSpinner label="Loading materials..." />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Stores haven't listed any products yet. Check back soon."
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
    </section>
  );
};

export default FeaturedMaterials;
