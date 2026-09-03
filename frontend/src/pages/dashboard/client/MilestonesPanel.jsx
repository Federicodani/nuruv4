import { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, CheckSquare, Flag, Calendar, User } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Modal from '../../../components/common/Modal';
import { MilestoneStatusBadge, PriorityBadge, ProgressBar } from '../../../components/construction/MilestoneStatusBadge';
import TaskList from './TaskList';
import MilestoneForm from './MilestoneForm';
import TemplatePickerModal from './TemplatePickerModal';
import {
  getMilestones,
  deleteMilestone,
  reorderMilestones,
} from '../../../api/constructionProjectApi';
import { formatDate } from '../../../utils/helpers';

const MilestonesPanel = ({ project, isOwner, collaboratorRole }) => {
  const projectId = project._id;
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const canEdit = isOwner || ['Contractor', 'Project Manager', 'Site Supervisor', 'Quantity Surveyor'].includes(collaboratorRole);

  const fetchMilestones = useCallback(() => {
    setLoading(true);
    getMilestones(projectId)
      .then(({ data }) => setMilestones(data.milestones || []))
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchMilestones(); }, [fetchMilestones]);

  const handleDelete = async (milestoneId, name) => {
    if (!window.confirm(`Delete milestone "${name}" and all its tasks?`)) return;
    setDeletingId(milestoneId);
    try {
      await deleteMilestone(projectId, milestoneId);
      setMilestones((prev) => prev.filter((m) => m._id !== milestoneId));
    } catch { alert('Failed to delete milestone.'); }
    finally { setDeletingId(null); }
  };

  const openEdit = (milestone) => { setEditTarget(milestone); setShowForm(true); };
  const openNew = () => { setEditTarget(null); setShowForm(true); };

  // Calculate overall milestone progress for the summary bar
  const activeMilestones = milestones.filter((m) => m.status !== 'On Hold');
  const overallMilestoneProgress = activeMilestones.length > 0
    ? Math.round(activeMilestones.reduce((s, m) => s + m.progress, 0) / activeMilestones.length)
    : 0;

  const completed = milestones.filter((m) => m.status === 'Completed').length;
  const delayed = milestones.filter((m) => m.status === 'Delayed').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-secondary-900">
            Milestones {milestones.length > 0 && `(${milestones.length})`}
          </h2>
          {milestones.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-secondary-500">
              <span className="text-green-600 font-medium">{completed} completed</span>
              {delayed > 0 && <span className="text-red-600 font-medium">{delayed} delayed</span>}
              <span>{milestones.length - completed} remaining</span>
            </div>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {milestones.length === 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowTemplate(true)}>
                Use Template
              </Button>
            )}
            <Button icon={Plus} size="sm" onClick={openNew}>Add Milestone</Button>
          </div>
        )}
      </div>

      {/* Summary progress bar */}
      {milestones.length > 0 && (
        <div className="mb-5 rounded-xl border border-secondary-100 bg-white p-4 shadow-card">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-secondary-700">Overall Milestone Progress</span>
            <span className="font-bold text-secondary-900">{overallMilestoneProgress}%</span>
          </div>
          <ProgressBar value={overallMilestoneProgress} size="md" />
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading milestones..." />
      ) : milestones.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No milestones yet"
          description="Break your project into milestones to track progress clearly."
          action={
            canEdit && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowTemplate(true)}>Use Template</Button>
                <Button icon={Plus} onClick={openNew}>Add Milestone</Button>
              </div>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {milestones.map((milestone, idx) => {
            const isExpanded = expandedId === milestone._id;
            const now = new Date();
            const isOverdue =
              milestone.plannedCompletionDate &&
              new Date(milestone.plannedCompletionDate) < now &&
              milestone.status !== 'Completed';
            const ts = milestone.taskSummary || {};

            return (
              <div
                key={milestone._id}
                className={`rounded-xl border bg-white shadow-card transition-all ${
                  isOverdue ? 'border-red-200' : 'border-secondary-100'
                }`}
              >
                {/* Milestone header row */}
                <div
                  className="flex cursor-pointer flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : milestone._id)}
                >
                  {/* Order number */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-600">
                    {idx + 1}
                  </span>

                  {/* Name + badges */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-secondary-900">{milestone.name}</h3>
                      <MilestoneStatusBadge status={milestone.status} />
                      <PriorityBadge priority={milestone.priority} />
                      {isOverdue && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                          ⚠️ Overdue
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-secondary-400">
                      {milestone.plannedCompletionDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Due {formatDate(milestone.plannedCompletionDate)}
                        </span>
                      )}
                      {milestone.assignedProfessional && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {milestone.assignedProfessional.profession}
                        </span>
                      )}
                      {ts.totalTasks > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" />
                          {ts.completedTasks}/{ts.totalTasks} tasks
                          {ts.overdueTasks > 0 && (
                            <span className="ml-1 text-red-600">· {ts.overdueTasks} overdue</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full sm:w-32">
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="text-secondary-400">Progress</span>
                      <span className="font-semibold text-secondary-700">{milestone.progress}%</span>
                    </div>
                    <ProgressBar value={milestone.progress} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => openEdit(milestone)}
                          className="rounded p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(milestone._id, milestone.name)}
                          disabled={deletingId === milestone._id}
                          className="rounded p-1.5 text-secondary-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <span className="ml-1 text-secondary-300">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </div>
                </div>

                {/* Expanded: description + tasks */}
                {isExpanded && (
                  <div className="border-t border-secondary-100 px-4 pb-4 pt-3">
                    {milestone.description && (
                      <p className="mb-4 text-sm text-secondary-600">{milestone.description}</p>
                    )}
                    <TaskList
                      projectId={projectId}
                      milestone={milestone}
                      project={project}
                      isOwner={isOwner}
                      collaboratorRole={collaboratorRole}
                      onTasksChanged={fetchMilestones}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Milestone form modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Milestone' : 'Add Milestone'}
        maxWidth="max-w-lg"
      >
        <MilestoneForm
          projectId={projectId}
          project={project}
          milestone={editTarget}
          onSaved={() => { setShowForm(false); setEditTarget(null); fetchMilestones(); }}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      </Modal>

      {/* Template picker modal */}
      <TemplatePickerModal
        projectId={projectId}
        projectType={project.projectType}
        isOpen={showTemplate}
        onClose={() => setShowTemplate(false)}
        onApplied={() => { setShowTemplate(false); fetchMilestones(); }}
      />
    </div>
  );
};

export default MilestonesPanel;
