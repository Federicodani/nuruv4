import { Link } from 'react-router-dom';
import { MapPin, Store as StoreIcon } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const { _id, name, images, store, location, isFeaturedNuru } = product;

  return (
    <Link
      to={`/materials/${_id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-secondary-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary-50">
        {images?.[0]?.url ? (
          <img
            src={images[0].url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-secondary-300">
            <StoreIcon className="h-10 w-10" />
          </div>
        )}
        {isFeaturedNuru && (
          <div className="absolute left-2 top-2">
            <Badge variant="primary">Featured</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-sm font-medium text-secondary-900 group-hover:text-primary-700">
          {name}
        </h3>
       
        <div className="mt-2 space-y-1 text-xs text-secondary-500">
          <p className="flex items-center gap-1 truncate">
            <StoreIcon className="h-3 w-3 shrink-0" /> {store?.storeName || 'Store'}
          </p>
          <p className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" /> {location}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
