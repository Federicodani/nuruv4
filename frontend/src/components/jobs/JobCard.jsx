import { MapPin, Wallet, Phone, Clock } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, formatDate, getCallLink } from '../../utils/helpers';

const JobCard = ({ job }) => {
  const { title, description, budget, location, contactNumber, createdAt, status } = job;

  return (
    <div className="flex flex-col rounded-xl border border-secondary-100 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-secondary-900">{title}</h3>
        {status === 'open' ? (
          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            Open
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-secondary-100 px-2.5 py-1 text-xs font-semibold text-secondary-600">
            Closed
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-3 text-sm text-secondary-600">{description}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-secondary-500">
        <span className="flex items-center gap-1.5">
          <Wallet className="h-4 w-4 text-primary" /> {formatCurrency(budget)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-primary" /> {location}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary" /> {formatDate(createdAt)}
        </span>
      </div>

      <a href={getCallLink(contactNumber)} className="mt-4">
        <Button variant="outline" size="sm" icon={Phone} fullWidth>
          Call {contactNumber}
        </Button>
      </a>
    </div>
  );
};

export default JobCard;
