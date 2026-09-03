import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { createMilestone, updateMilestone } from '../../../api/constructionProjectApi';

const STATUSES = ['Not Started', 'In Progress', 'Completed', 'Delayed', 'On Hold'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const inputCls = 'w-full rounded-lg border border-secondary-200 px-3.5 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const lbl = (text, req) => (
  <label className="mb-1 block text-sm font-medium text-secondary-700">
    {text}{req && <span className="ml-1 text-red-500">*</span>}
  </label>
);

const EMPTY = { name: '', description: '', status: 'Not Started', priority: 'Medium', progress: 0, startDate: '', plannedCompletionDate: '', assignedProfessional: '', budget: '', notes: '' };

const MilestoneForm = ({ projectId, project, milestone, onSaved, onCancel }) => {
  const isEdit = Boolean(milestone);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const collaborators = project?.collaborators || [];

  useEffect(() => {
    if (milestone) {
      setForm({
        name: milestone.name || '',
        description: milestone.description || '',
        status: milestone.status || 'Not Started',
        priority: milestone.priority || 'Medium',
        progress: milestone.progress ?? 0,
        startDate: milestone.startDate ? milestone.startDate.slice(0, 10) : '',
        plannedCompletionDate: milestone.plannedCompletionDate ? milestone.plannedCompletionDate.slice(0, 10) : '',
        assignedProfessional: milestone.assignedProfessional?._id || milestone.assignedProfessional || '',
        budget: milestone.budget ?? '',
        notes: milestone.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [milestone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Auto-correct progress when status changes
  const handleStatusChange = (e) => {
    const status = e.target.value;
    setForm((f) => ({
      ...f,
      status,
      progress: status === 'Completed' ? 100 : status === 'Not Started' ? 0 : f.progress,
    }));
  };

  const handleProgressChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setForm((f) => ({
      ...f,
      progress: val,
      status: val === 100 ? 'Completed' : val === 0 ? 'Not Started' : val > 0 ? (f.status === 'Not Started' || f.status === 'Completed' ? 'In Progress' : f.status) : f.status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Milestone name is required.'); return; }

    const payload = { ...form };
    if (!payload.startDate) payload.startDate = null;
    if (!payload.plannedCompletionDate) payload.plannedCompletionDate = null;
    if (!payload.assignedProfessional) payload.assignedProfessional = null;
    if (payload.budget === '') payload.budget = null;

    setSaving(true);
    try {
      if (isEdit) {
        await updateMilestone(projectId, milestone._id, payload);
      } else {
        await createMilestone(projectId, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save milestone.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div>
        {lbl('Milestone Name', true)}
        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Foundation" className={inputCls} />
      </div>

      <div>
        {lbl('Description')}
        <textarea name="description" value={form.description} onChange={handleChange} rows={2}
          placeholder="Describe what this milestone covers..." className={inputCls} />
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
        <input type="range" min="0" max="100" value={form.progress} onChange={handleProgressChange} className="w-full" />
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary-100">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${form.progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {lbl('Start Date')}
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          {lbl('Planned Completion')}
          <input type="date" name="plannedCompletionDate" value={form.plannedCompletionDate} onChange={handleChange} className={inputCls} />
        </div>
      </div>

      {collaborators.length > 0 && (
        <div>
          {lbl('Assign to Team Member')}
          <select name="assignedProfessional" value={form.assignedProfessional} onChange={handleChange} className={inputCls}>
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
        {lbl('Budget Allocation (KSh)')}
        <input type="number" name="budget" value={form.budget} onChange={handleChange} min="0" placeholder="Optional budget for this milestone" className={inputCls} />
      </div>

      <div>
        {lbl('Notes')}
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Any notes about this milestone..." className={inputCls} />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={saving} fullWidth>{isEdit ? 'Save Changes' : 'Add Milestone'}</Button>
      </div>
    </form>
  );
};

export default MilestoneForm;
