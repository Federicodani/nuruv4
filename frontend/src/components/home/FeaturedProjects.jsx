import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import ProjectCard from '../projects/ProjectCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { getFeaturedProjects } from '../../api/projectApi';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProjects()
      .then(({ data }) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section at all if there are no projects and loading is done
  if (!loading && projects.length === 0) return null;

  return (
    <section className="bg-secondary-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
              Construction Inspiration
            </h2>
            <p className="mt-2 text-secondary-500">
              Real projects completed by Kenya's top construction professionals
            </p>
          </div>
          <Link
            to="/projects"
            className="flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
          >
            View All Projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <LoadingSpinner label="Loading projects..." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>

        {!loading && projects.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-6 py-2.5 text-sm font-semibold text-secondary-700 shadow-card transition-all hover:border-primary hover:text-primary-700"
            >
              <LayoutGrid className="h-4 w-4" /> Browse All Projects
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
