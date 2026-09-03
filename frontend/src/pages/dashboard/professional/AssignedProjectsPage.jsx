import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Calendar, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Badge from '../../../components/common/Badge';
import { getAssignedProjects } from '../../../api/constructionProjectApi';
import { formatCurrency, formatDate } from '../../../utils/helpers';

const AssignedProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssignedProjects()
      .then(({ data }) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Loading assigned projects..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Assigned Projects</h1>
      <p className="mt-1 text-secondary-500">
        Construction projects you have been added to by a client.
      </p>

      <div className="mt-8">
        {projects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No assigned projects"
            description="When a client adds you to their construction project, it will appear here."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="flex flex-col gap-3 rounded-xl border border-secondary-100 bg-white p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-secondary-900">{project.projectName}</h2>
                    <p className="text-sm text-secondary-500">{project.projectType}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.myRole && <Badge variant="primary">{project.myRole}</Badge>}
                    <Badge variant="neutral">{project.currentStage}</Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-secondary-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {project.town ? `${project.town}, ` : ''}{project.county}
                  </span>
                  {project.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Started {formatDate(project.startDate)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {project.progress}% complete
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500">
                    Client: <span className="font-medium text-secondary-800">{project.owner?.fullName}</span>
                  </span>
                  <span className="text-secondary-400">
                    Budget: {formatCurrency(project.budget)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedProjectsPage;
