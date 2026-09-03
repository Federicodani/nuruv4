import { Link } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';
import { getInitials } from '../../utils/helpers';

const ProfessionalCard = ({ professional }) => {
  const { _id, profession, county, town, averageRating, profileImage, user, yearsOfExperience, isNuruElectricals } =
    professional;

  return (
    <Link
      to={`/professionals/${_id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-secondary-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative flex h-40 items-center justify-center bg-secondary-50">
        {profileImage?.url ? (
          <img
            src={profileImage.url}
            alt={user?.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-xl font-bold text-white">
            {getInitials(user?.fullName)}
          </div>
        )}
        {isNuruElectricals && (
          <div className="absolute left-3 top-3">
            <Badge variant="primary">Recommended Partner</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-secondary-900 group-hover:text-primary-700">
          {user?.fullName || 'Professional'}
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-secondary-500">
          <Briefcase className="h-3.5 w-3.5" /> {profession}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-secondary-500">
          <MapPin className="h-3.5 w-3.5" /> {town}, {county}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <RatingStars rating={averageRating} />
          {yearsOfExperience > 0 && (
            <span className="text-xs font-medium text-secondary-400">
              {yearsOfExperience}+ yrs
            </span>
          )}
        </div>

        <span className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-secondary-200 py-2 text-sm font-semibold text-secondary-700 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-secondary">
          View Profile
        </span>
      </div>
    </Link>
  );
};

export default ProfessionalCard;
