import { useState, useEffect } from 'react';
import { CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import { TaskStatusBadge, PriorityBadge } from '../../../components/construction/MilestoneStatusBadge';
import { getMyAssignedTasks, updateTask } from '../../../api/constructionProjectApi';
import { formatDate } from '../../../utils/helpers';

const ProfessionalTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getMyAssignedTasks()
      .then(({ data }) => setTasks(data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (task, newStatus) => {
    setUpdatingId(task._id);
    try {
      await updateTask(task.constructionProject._id, task.milestone._id, task._id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id
            ? { ...t, status: newStatus, progress: newStatus === 'Completed' ? 100 : t.progress }
            : t
        )
      );
    } catch { alert('Failed to update task.'); }
    finally { setUpdatingId(null); }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading your tasks..." />;

  const grouped = tasks.reduce((acc, task) => {
    const key = task.constructionProject?._id || 'unknown';
    const name = task.constructionProject?.projectName || 'Unknown Project';
    if (!acc[key]) acc[key] = { name, tasks: [] };
    acc[key].tasks.push(task);
    return acc;
  }, {});

  const overdueTasks = tasks.filter((t) => t.isOverdue);
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">My Assigned Tasks</h1>
      <p className="mt-1 text-secondary-500">Tasks assigned to you across all construction projects.</p>

      {tasks.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-secondary-100 bg-white p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-secondary-900">{pendingTasks.length}</p>
            <p className="text-xs text-secondary-500 mt-0.5">Pending</p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-green-700">{completedTasks.length}</p>
            <p className="text-xs text-green-600 mt-0.5">Completed</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-red-700">{overdueTasks.length}</p>
            <p className="text-xs text-red-600 mt-0.5">Overdue</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks assigned"
            description="When a client assigns tasks to you on a construction project, they will appear here."
          />
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(grouped).map(([projectId, group]) => (
              <div key={projectId}>
                <h2 className="mb-3 text-base font-semibold text-secondary-800">{group.name}</h2>
                <div className="flex flex-col gap-2">
                  {group.tasks.map((task) => (
                    <div
                      key={task._id}
                      className={`rounded-xl border bg-white p-4 shadow-card ${
                        task.isOverdue ? 'border-red-200' : 'border-secondary-100'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`font-medium ${task.status === 'Completed' ? 'text-secondary-400 line-through' : 'text-secondary-900'}`}>
                              {task.title}
                            </h3>
                            <TaskStatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} />
                          </div>
                          {task.description && (
                            <p className="mt-1 text-sm text-secondary-500">{task.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-secondary-400">
                            <span className="text-secondary-500">
                              Milestone: <span className="font-medium">{task.milestone?.name}</span>
                            </span>
                            {task.dueDate && (
                              <span className={`flex items-center gap-1 ${task.isOverdue ? 'font-semibold text-red-600' : ''}`}>
                                <Calendar className="h-3 w-3" />
                                {task.isOverdue ? `⚠️ Overdue since ${formatDate(task.dueDate)}` : `Due ${formatDate(task.dueDate)}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick status update */}
                        <div className="shrink-0">
                          <select
                            value={task.status}
                            disabled={updatingId === task._id}
                            onChange={(e) => handleStatusUpdate(task, e.target.value)}
                            className="rounded-lg border border-secondary-200 bg-white px-2.5 py-1.5 text-xs font-medium text-secondary-700 focus:border-primary focus:outline-none disabled:opacity-50"
                          >
                            {['To Do', 'In Progress', 'Completed', 'Delayed'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {task.progress > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary-100">
                            <div
                              className={`h-full rounded-full transition-all ${task.status === 'Completed' ? 'bg-green-500' : 'bg-primary'}`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTasksPage;
