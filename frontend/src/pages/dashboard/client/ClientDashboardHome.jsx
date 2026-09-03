import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FolderOpen, MapPin, Calendar, TrendingUp } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import BudgetBar from '../../../components/construction/BudgetBar';
import HealthBadge from '../../../components/construction/HealthBadge';
import { getMyConstructionProjects } from '../../../api/constructionProjectApi';
import { formatCurrency, formatDate } from '../../../utils/helpers';

// Fetches the live projects list; budget utilisation is derived client-side from the
// summary endpoint only when the card is opened — the list just shows static fields.
const ClientDashboardHome = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyConstructionProjects()
      .then(({ data }) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Loading your projects..." />;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Construction Projects</h1>
          <p className="mt-1 text-secondary-500">Track budget, progress and your team in one place.</p>
        </div>
        <Link to="/dashboard/client/new">
          <Button icon={PlusCircle}>New Project</Button>
        </Link>
      </div>

      <div className="mt-8">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create your first live construction project to start tracking budget, expenses and progress."
            action={
              <Link to="/dashboard/client/new">
                <Button icon={PlusCircle}>Create Project</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/dashboard/client/projects/${project._id}`}
                className="group flex flex-col gap-4 rounded-xl border border-secondary-100 bg-white p-5 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-secondary-900 group-hover:text-primary-700">
                      {project.projectName}
                    </h2>
                    <p className="mt-0.5 text-sm text-secondary-500">{project.projectType}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-secondary-50 px-2.5 py-1 text-xs font-medium text-secondary-600">
                    {project.currentStage}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-secondary-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {project.town ? `${project.town}, ` : ''}{project.county}
                  </span>
                  {project.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Started {formatDate(project.startDate)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> {project.progress}% complete
                  </span>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs text-secondary-500">
                    <span>Budget</span>
                    <span className="font-semibold text-secondary-900">{formatCurrency(project.budget)}</span>
                  </div>
                  {/* Progress bar (construction progress, not budget) */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-100">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboardHome;
