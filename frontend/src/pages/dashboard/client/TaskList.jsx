import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, CheckSquare, Calendar, AlertCircle, User } from 'lucide-react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { TaskStatusBadge, PriorityBadge } from '../../../components/construction/MilestoneStatusBadge';
import TaskForm from './TaskForm';
import { getTasks, deleteTask, updateTask } from '../../../api/constructionProjectApi';
import { formatDate } from '../../../utils/helpers';

const TaskList = ({ projectId, milestone, project, isOwner, collaboratorRole, onTasksChanged }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const canCreate = isOwner || ['Contractor', 'Project Manager', 'Site Supervisor', 'Quantity Surveyor', 'Electrician', 'Plumber'].includes(collaboratorRole);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    getTasks(projectId, milestone._id)
      .then(({ data }) => setTasks(data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [projectId, milestone._id]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async (taskId, title) => {
    if (!window.confirm(`Delete task "${title}"?`)) return;
    setDeletingId(taskId);
    try {
      await deleteTask(projectId, milestone._id, taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      onTasksChanged?.();
    } catch { alert('Failed to delete task.'); }
    finally { setDeletingId(null); }
  };

  // Quick toggle complete
  const handleQuickComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      await updateTask(projectId, milestone._id, task._id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id
            ? { ...t, status: newStatus, progress: newStatus === 'Completed' ? 100 : t.progress }
            : t
        )
      );
      onTasksChanged?.();
    } catch { alert('Failed to update task.'); }
  };

  const openEdit = (task) => { setEditTarget(task); setShowForm(true); };
  const openNew = () => { setEditTarget(null); setShowForm(true); };

  if (loading) return <LoadingSpinner size="sm" label="Loading tasks..." />;

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const overdue = tasks.filter((t) => t.isOverdue).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary-400">
          Tasks {total > 0 && `· ${completed}/${total} done${overdue > 0 ? ` · ${overdue} overdue` : ''}`}
        </span>
        {canCreate && (
          <Button variant="ghost" size="sm" icon={Plus} onClick={openNew} className="text-xs">
            Add Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-secondary-200 py-5 text-center">
          <p className="text-xs text-secondary-400">No tasks yet.</p>
          {canCreate && (
            <button onClick={openNew} className="mt-1 text-xs font-medium text-primary-700 hover:underline">
              Add first task
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                task.status === 'Completed'
                  ? 'border-green-100 bg-green-50/40'
                  : task.isOverdue
                  ? 'border-red-100 bg-red-50/30'
                  : 'border-secondary-100 bg-secondary-50/30 hover:bg-white'
              }`}
            >
              {/* Quick-complete checkbox */}
              <button
                onClick={() => handleQuickComplete(task)}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                  task.status === 'Completed'
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-secondary-300 hover:border-primary'
                }`}
              >
                {task.status === 'Completed' && '✓'}
              </button>

              {/* Task content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-sm font-medium ${task.status === 'Completed' ? 'text-secondary-400 line-through' : 'text-secondary-900'}`}>
                    {task.title}
                  </span>
                  <TaskStatusBadge status={task.status} />
                  {task.priority !== 'Medium' && <PriorityBadge priority={task.priority} />}
                </div>

                {task.description && (
                  <p className="mt-0.5 text-xs text-secondary-500">{task.description}</p>
                )}

                <div className="mt-1 flex flex-wrap gap-2 text-xs text-secondary-400">
                  {task.dueDate && (
                    <span className={`flex items-center gap-0.5 ${task.isOverdue ? 'font-semibold text-red-600' : ''}`}>
                      <Calendar className="h-3 w-3" />
                      {task.isOverdue ? `⚠️ ${task.daysOverdue}d overdue` : `Due ${formatDate(task.dueDate)}`}
                    </span>
                  )}
                  {task.assignedProfessional?.user?.fullName && (
                    <span className="flex items-center gap-0.5">
                      <User className="h-3 w-3" />
                      {task.assignedProfessional.user.fullName}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {(isOwner || canCreate) && (
                <div className="flex shrink-0 gap-0.5">
                  <button
                    onClick={() => openEdit(task)}
                    className="rounded p-1 text-secondary-300 hover:text-secondary-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(task._id, task.title)}
                      disabled={deletingId === task._id}
                      className="rounded p-1 text-secondary-300 hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Task' : 'Add Task'}
        maxWidth="max-w-lg"
      >
        <TaskForm
          projectId={projectId}
          milestoneId={milestone._id}
          project={project}
          task={editTarget}
          onSaved={() => { setShowForm(false); setEditTarget(null); fetchTasks(); onTasksChanged?.(); }}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      </Modal>
    </div>
  );
};

export default TaskList;
