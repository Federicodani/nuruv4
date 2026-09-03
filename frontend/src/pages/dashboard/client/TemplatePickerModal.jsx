import { useState, useEffect } from 'react';
import { CheckSquare } from 'lucide-react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { getMilestoneTemplates, applyMilestoneTemplate } from '../../../api/constructionProjectApi';

const TemplatePickerModal = ({ projectId, projectType, isOpen, onClose, onApplied }) => {
  const [template, setTemplate] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError('');
    getMilestoneTemplates(projectId)
      .then(({ data }) => {
        setTemplate(data.template || []);
        setSelected(data.template || []);
      })
      .catch(() => setError('Could not load template.'))
      .finally(() => setLoading(false));
  }, [isOpen, projectId]);

  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleApply = async () => {
    if (selected.length === 0) { setError('Select at least one milestone.'); return; }
    setApplying(true);
    setError('');
    try {
      // Preserve the original template order
      const ordered = template.filter((n) => selected.includes(n));
      await applyMilestoneTemplate(projectId, ordered);
      onApplied();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply template.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Milestone Template — ${projectType}`} maxWidth="max-w-md">
      {loading ? (
        <LoadingSpinner label="Loading template..." />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-secondary-500">
            Select the milestones to add. You can deselect any that don't apply to your project.
          </p>

          {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

          <div className="flex flex-col gap-1.5 rounded-xl border border-secondary-100 bg-secondary-50 p-3">
            {template.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected.includes(name)
                    ? 'bg-white shadow-card text-secondary-900 font-medium'
                    : 'text-secondary-400 line-through'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ${
                  selected.includes(name)
                    ? 'border-primary bg-primary text-secondary'
                    : 'border-secondary-200 bg-white text-secondary-300'
                }`}>
                  {selected.includes(name) ? '✓' : ''}
                </span>
                <span className="flex-1">{i + 1}. {name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-secondary-400">
            <span>{selected.length} of {template.length} selected</span>
            <div className="flex gap-2">
              <button onClick={() => setSelected(template)} className="text-primary-700 hover:underline">All</button>
              <span>/</span>
              <button onClick={() => setSelected([])} className="text-secondary-500 hover:underline">None</button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              icon={CheckSquare}
              onClick={handleApply}
              isLoading={applying}
              fullWidth
              disabled={selected.length === 0}
            >
              Add {selected.length} Milestone{selected.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TemplatePickerModal;
