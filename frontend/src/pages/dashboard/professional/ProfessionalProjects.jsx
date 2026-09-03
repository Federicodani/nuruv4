import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Pencil, Eye, X, Image as ImageIcon } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Badge from '../../../components/common/Badge';
import {
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../../../api/projectApi';
import { getConstants } from '../../../api/searchApi';

const EMPTY_FORM = { title: '', description: '', category: '', county: '' };

const ProjectFormModal = ({ open, onClose, onSaved, editProject, categories, counties }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (open) {
      if (editProject) {
        setForm({
          title: editProject.title || '',
          description: editProject.description || '',
          category: editProject.category || '',
          county: editProject.county || '',
        });
        setPreviews((editProject.images || []).map((img) => ({ url: img.url, existing: true })));
      } else {
        setForm(EMPTY_FORM);
        setPreviews([]);
      }
      setImages([]);
      setError('');
    }
  }, [open, editProject]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 10));
    const newPreviews = files.map((f) => ({ url: URL.createObjectURL(f), existing: false }));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
  };

  const removeNewImage = (idx) => {
    // Count existing to find offset
    const existingCount = previews.filter((p) => p.existing).length;
    const newIdx = idx - existingCount;
    if (newIdx >= 0) {
      setImages((prev) => prev.filter((_, i) => i !== newIdx));
    }
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.category || !form.county) {
      setError('Title, category, and county are required.');
      return;
    }
    if (!editProject && images.length === 0) {
      setError('Please add at least one image.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((f) => fd.append('images', f));

      if (editProject) {
        await updateProject(editProject._id, fd);
      } else {
        await createProject(fd);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-secondary-900/50 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-secondary-900">
            {editProject ? 'Edit Project' : 'Upload Project'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Images */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700">
              Project Images {!editProject && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg">
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  {!p.existing && (
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              {previews.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-secondary-300 text-secondary-400 hover:border-primary hover:text-primary"
                >
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            {editProject && (
              <p className="mt-1 text-xs text-secondary-400">Existing images are kept. Add new ones above.</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. 4-Bedroom Bungalow in Karen"
              maxLength={150}
              className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the project scope, materials used, timeline..."
              className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Category + County */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-secondary-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none"
              >
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-secondary-700">
                County <span className="text-red-500">*</span>
              </label>
              <select
                name="county"
                value={form.county}
                onChange={handleChange}
                className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none"
              >
                <option value="">Select county</option>
                {counties.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} fullWidth>
              {editProject ? 'Save Changes' : 'Upload Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

const ProfessionalProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [categories, setCategories] = useState([]);
  const [counties, setCounties] = useState([]);

  useEffect(() => {
    getConstants().then(({ data }) => {
      setCategories(data.projectCategories || []);
      setCounties(data.counties || []);
    }).catch(() => {});
  }, []);

  const fetchProjects = () => {
    setLoading(true);
    getMyProjects()
      .then(({ data }) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const openNew = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditTarget(project);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Projects</h1>
          <p className="mt-1 text-secondary-500">Showcase your completed work to attract clients.</p>
        </div>
        <Button icon={Plus} onClick={openNew}>Upload Project</Button>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner label="Loading your projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No projects yet"
            description="Upload your first project to start attracting clients through the inspiration gallery."
            action={<Button icon={Plus} onClick={openNew}>Upload Your First Project</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-secondary-100 bg-white shadow-card"
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-secondary-100">
                  {project.thumbnail?.url ? (
                    <img
                      src={project.thumbnail.url}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-secondary-300">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <Badge variant="dark">{project.category}</Badge>
                  </div>
                  {project.isFeatured && (
                    <div className="absolute right-3 top-3">
                      <Badge variant="primary">Featured</Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold text-secondary-900 line-clamp-2">{project.title}</h3>
                  <p className="mt-1 text-sm text-secondary-500">{project.county}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-secondary-400">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{project.views}</span>
                    <span>{project.images?.length || 0} image{project.images?.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <a
                      href={`/projects/${project._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" fullWidth icon={Eye}>View</Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Pencil}
                      onClick={() => openEdit(project)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      disabled={deleting === project._id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
                    >
                      {deleting === project._id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchProjects}
        editProject={editTarget}
        categories={categories}
        counties={counties}
      />
    </div>
  );
};

export default ProfessionalProjects;
