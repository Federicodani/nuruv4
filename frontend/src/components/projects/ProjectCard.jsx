import { Link } from 'react-router-dom';
import { Eye, Heart, MapPin, Briefcase } from 'lucide-react';
import Badge from '../common/Badge';

const ProjectCard = ({ project }) => {
  const { _id, title, category, county, thumbnail, views, likes, professional, isFeatured } =
    project;

  const profName = professional?.user?.fullName || 'Professional';
  const profession = professional?.profession || '';

  return (
    <Link
      to={`/projects/${_id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-secondary-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-secondary-100">
        {thumbnail?.url ? (
          <img
            src={thumbnail.url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category badge top-left */}
        <div className="absolute left-3 top-3">
          <Badge variant={isFeatured ? 'primary' : 'dark'}>{category}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-secondary-900 group-hover:text-primary-700">
          {title}
        </h3>

        <div className="mt-2 space-y-1">
          <p className="flex items-center gap-1.5 text-sm text-secondary-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {county}
          </p>
          {profession && (
            <p className="flex items-center gap-1.5 text-sm text-secondary-500">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              {profName} · {profession}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-xs text-secondary-400">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {views || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" /> {likes || 0}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
