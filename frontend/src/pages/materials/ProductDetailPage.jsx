import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Store as StoreIcon, Package } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { getProductById } from '../../api/productApi';
import { formatCurrency, getWhatsAppLink, getCallLink, WHATSAPP_MESSAGES } from '../../utils/helpers';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await getProductById(id);
        setProduct(data.product);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage label="Loading product..." />;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={Package} title="Not Found" description={error || 'This product does not exist.'} />
      </div>
    );
  }

  const { name, description, images, store, location, category } = product;
  const sellerPhone = store?.phone;
  const sellerWhatsapp = store?.whatsappNumber || sellerPhone;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-secondary-50">
            {images?.[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-secondary-300">
                <Package className="h-16 w-16" />
              </div>
            )}
          </div>
          {images && images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={img._id || idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    idx === activeImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt={`${name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-700">
            {category}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-secondary-900 sm:text-3xl">{name}</h1>
        
          <p className="mt-4 text-sm leading-relaxed text-secondary-600">
            {description || 'No description provided.'}
          </p>

          <div className="mt-6 rounded-xl border border-secondary-100 bg-secondary-50 p-4">
            <Link to={`/stores/${store?._id}`} className="flex items-center gap-2 font-semibold text-secondary-900 hover:text-primary-700">
              <StoreIcon className="h-4 w-4" /> {store?.storeName}
            </Link>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-secondary-500">
              <MapPin className="h-4 w-4" /> {location}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={getCallLink(sellerPhone)} className="flex-1">
              <Button variant="outline" icon={Phone} fullWidth>
                Call Seller
              </Button>
            </a>
            <a
              href={getWhatsAppLink(sellerWhatsapp, WHATSAPP_MESSAGES.product)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="whatsapp" icon={MessageCircle} fullWidth>
                WhatsApp Seller
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
