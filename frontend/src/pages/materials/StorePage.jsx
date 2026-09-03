import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Package } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import ProductCard from '../../components/materials/ProductCard';
import Badge from '../../components/common/Badge';
import { getStoreById } from '../../api/storeApi';
import { getWhatsAppLink, getCallLink, WHATSAPP_MESSAGES, getInitials } from '../../utils/helpers';

const StorePage = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      try {
        const { data } = await getStoreById(id);
        setStore(data.store);
        setProducts(data.products);
      } catch {
        setError('Store not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage label="Loading store..." />;
  if (error || !store) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Not Found" description={error || 'This store does not exist.'} />
      </div>
    );
  }

  const { storeName, description, logo, coverImage, phone, whatsappNumber, county, town, isNuruElectricals } = store;

  return (
    <div>
      <div className="relative h-44 w-full bg-secondary-200 sm:h-56">
        {coverImage?.url ? (
          <img src={coverImage.url} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-secondary to-secondary-700" />
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-secondary shadow-lg">
            {logo?.url ? (
              <img src={logo.url} alt={storeName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{getInitials(storeName)}</span>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-secondary-900">{storeName}</h1>
              {isNuruElectricals && <Badge variant="primary">Recommended Partner</Badge>}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-secondary-500">
              <MapPin className="h-4 w-4" /> {town}, {county}
            </p>
          </div>

          <div className="flex w-full gap-2 pb-2 sm:w-auto">
            <a href={getCallLink(phone)} className="flex-1 sm:flex-none">
              <Button variant="outline" icon={Phone} fullWidth>
                Call Store
              </Button>
            </a>
            <a
              href={getWhatsAppLink(whatsappNumber || phone, WHATSAPP_MESSAGES.store)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button variant="whatsapp" icon={MessageCircle} fullWidth>
                WhatsApp Store
              </Button>
            </a>
          </div>
        </div>

        {description && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-secondary-600">{description}</p>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-bold text-secondary-900">Products ({products.length})</h2>
          {products.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={Package} title="No products yet" description="This store hasn't listed any products." />
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={{ ...product, store }} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-12" />
    </div>
  );
};

export default StorePage;
