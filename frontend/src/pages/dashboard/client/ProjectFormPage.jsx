import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, FolderOpen } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import {
  createConstructionProject,
  updateConstructionProject,
  getConstructionProjectById,
} from '../../../api/constructionProjectApi';
import axiosInstance from '../../../api/axiosInstance';
const field = (label, required = false) => (
  <label className="mb-1 block text-sm font-medium text-secondary-700">
    {label}{required && <span className="ml-1 text-red-500">*</span>}
  </label>
);

const inputCls = 'w-full rounded-lg border border-secondary-200 px-3.5 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const ProjectFormPage = () => {
  const { id } = useParams();          // present when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [options, setOptions] = useState({ counties: [], constructionProjectTypes: [], constructionStages: [] });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    projectName: '', projectType: '', county: '', town: '',
    budget: '', startDate: '', expectedCompletionDate: '',
    currentStage: '', description: '', progress: 0,
  });

  useEffect(() => {
  axiosInstance.get('/constants').then(({ data }) => setOptions(data)).catch(() => {}); 
  if (!isEdit) return;
    getConstructionProjectById(id)
      .then(({ data }) => {
        const p = data.project;
        setForm({
          projectName: p.projectName || '',
          projectType: p.projectType || '',
          county: p.county || '',
          town: p.town || '',
          budget: p.budget || '',
          startDate: p.startDate ? p.startDate.slice(0, 10) : '',
          expectedCompletionDate: p.expectedCompletionDate ? p.expectedCompletionDate.slice(0, 10) : '',
          currentStage: p.currentStage || '',
          description: p.description || '',
          progress: p.progress || 0,
        });
      })
      .catch(() => setError('Could not load project details.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.projectName || !form.projectType || !form.county || !form.budget) {
      setError('Project name, type, county and budget are required.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateConstructionProject(id, form);
        navigate(`/dashboard/client/projects/${id}`);
      } else {
        const { data } = await createConstructionProject(form);
        navigate(`/dashboard/client/projects/${data.project._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading project..." />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-secondary-900">
        {isEdit ? 'Edit Project' : 'New Construction Project'}
      </h1>
      <p className="mt-1 text-secondary-500">
        {isEdit ? 'Update your project details.' : 'Create a live project to track budget, expenses and progress.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          {field('Project Name', true)}
          <input name="projectName" value={form.projectName} onChange={handleChange}
            placeholder="e.g. My Karen Bungalow" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            {field('Project Type', true)}
            <select name="projectType" value={form.projectType} onChange={handleChange} className={inputCls}>
              <option value="">Select type</option>
              {(options.constructionProjectTypes || []).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            {field('Budget (KSh)', true)}
            <input type="number" name="budget" value={form.budget} onChange={handleChange}
              placeholder="e.g. 3500000" min="0" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            {field('County', true)}
            <select name="county" value={form.county} onChange={handleChange} className={inputCls}>
              <option value="">Select county</option>
              {(options.counties || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            {field('Town')}
            <input name="town" value={form.town} onChange={handleChange}
              placeholder="e.g. Karen" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            {field('Start Date')}
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            {field('Expected Completion')}
            <input type="date" name="expectedCompletionDate" value={form.expectedCompletionDate}
              onChange={handleChange} className={inputCls} />
          </div>
        </div>

        <div>
          {field('Current Stage')}
          <select name="currentStage" value={form.currentStage} onChange={handleChange} className={inputCls}>
            <option value="">Select stage</option>
            {(options.constructionStages || []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {isEdit && (
          <div>
            {field('Overall Progress (%)')}
            <div className="flex items-center gap-3">
              <input type="range" name="progress" min="0" max="100" value={form.progress}
                onChange={handleChange} className="flex-1" />
              <span className="w-12 text-right text-sm font-bold text-secondary-900">{form.progress}%</span>
            </div>
          </div>
        )}

        <div>
          {field('Description')}
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            placeholder="Brief description of the project..." className={inputCls} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={saving} icon={Save} fullWidth>
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectFormPage;
