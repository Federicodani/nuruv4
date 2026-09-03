import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { createTask, updateTask } from '../../../api/constructionProjectApi';

const STATUSES = ['To Do', 'In Progress', 'Completed', 'Delayed', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const inputCls = 'w-full rounded-lg border border-secondary-200 px-3.5 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const lbl = (text, req) => (
  <label className="mb-1 block text-sm font-medium text-secondary-700">
    {text}{req && <span className="ml-1 text-red-500">*</span>}
  </label>
);

const EMPTY = {
  title: '', description: '', status: 'To Do', priority: 'Medium',
  progress: 0, assignedProfessional: '', startDate: '', dueDate: '', notes: '',
};

const TaskForm = ({ projectId, milestoneId, project, task, onSaved, onCancel }) => {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const collaborators = project?.collaborators || [];

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        progress: task.progress ?? 0,
        assignedProfessional: task.assignedProfessional?._id || task.assignedProfessional || '',
        startDate: task.startDate ? task.startDate.slice(0, 10) : '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        notes: task.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setForm((f) => ({
      ...f,
      status,
      progress:
        status === 'Completed' ? 100
        : status === 'To Do' ? 0
        : f.progress,
    }));
  };

  const handleProgressChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setForm((f) => ({
      ...f,
      progress: val,
      status:
        val === 100 ? 'Completed'
        : val === 0 ? 'To Do'
        : f.status === 'To Do' || f.status === 'Completed'
        ? 'In Progress'
        : f.status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Task title is required.'); return; }
    if (form.dueDate && form.startDate && form.dueDate < form.startDate) {
      setError('Due date cannot be before the start date.'); return;
    }

    const payload = { ...form };
    if (!payload.startDate) payload.startDate = null;
    if (!payload.dueDate) payload.dueDate = null;
    if (!payload.assignedProfessional) payload.assignedProfessional = null;

    setSaving(true);
    try {
      if (isEdit) {
        await updateTask(projectId, milestoneId, task._id, payload);
      } else {
        await createTask(projectId, milestoneId, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div>
        {lbl('Task Title', true)}
        <input name="title" value={form.title} onChange={handleChange}
          placeholder="e.g. Purchase cement bags" className={inputCls} />
      </div>

      <div>
        {lbl('Description')}
        <textarea name="description" value={form.description} onChange={handleChange}
          rows={2} placeholder="Optional description..." className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {lbl('Status')}
          <select name="status" value={form.status} onChange={handleStatusChange} className={inputCls}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          {lbl('Priority')}
          <select name="priority" value={form.priority} onChange={handleChange} className={inputCls}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        {lbl(`Progress: ${form.progress}%`)}
        <input type="range" min="0" max="100" value={form.progress}
          onChange={handleProgressChange} className="w-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {lbl('Start Date')}
          <input type="date" name="startDate" value={form.startDate}
            onChange={handleChange} className={inputCls} />
        </div>
        <div>
          {lbl('Due Date')}
          <input type="date" name="dueDate" value={form.dueDate}
            onChange={handleChange} className={inputCls} />
        </div>
      </div>

      {collaborators.length > 0 && (
        <div>
          {lbl('Assign to Team Member')}
          <select name="assignedProfessional" value={form.assignedProfessional}
            onChange={handleChange} className={inputCls}>
            <option value="">— Unassigned —</option>
            {collaborators.map((c) => (
              <option key={c._id} value={c.professional?._id || c.professional}>
                {c.professional?.user?.fullName || 'Team member'} ({c.role})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        {lbl('Notes')}
        <textarea name="notes" value={form.notes} onChange={handleChange}
          rows={2} placeholder="Any notes about this task..." className={inputCls} />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={saving} fullWidth>
          {isEdit ? 'Save Changes' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
