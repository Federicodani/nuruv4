import { useState, useEffect } from 'react';
import { UserPlus, X, Star, MapPin, Briefcase } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Badge from '../../../components/common/Badge';
import { addCollaborator, removeCollaborator } from '../../../api/constructionProjectApi';
import { getProfessionals } from '../../../api/professionalApi';
import { getInitials } from '../../../utils/helpers';

const ROLES = [
  'Contractor', 'Architect', 'Engineer', 'Quantity Surveyor',
  'Electrician', 'Plumber', 'Site Supervisor', 'Project Manager',
  'Other Professional', 'Viewer',
];

const TeamPanel = ({ project, onTeamUpdated }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPro, setSelectedPro] = useState(null);
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');
  const [loadingPros, setLoadingPros] = useState(false);

  const collaborators = project?.collaborators || [];

  const searchProfessionals = async (term) => {
    if (!term || term.length < 2) { setProfessionals([]); return; }
    setLoadingPros(true);
    try {
      const { data } = await getProfessionals({ search: term, limit: 8 });
      setProfessionals(data.professionals || []);
    } catch { setProfessionals([]); }
    finally { setLoadingPros(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => searchProfessionals(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleAdd = async () => {
    if (!selectedPro || !role) { setError('Select a professional and a role.'); return; }
    setSaving(true); setError('');
    try {
      await addCollaborator(project._id, { professionalId: selectedPro._id, role });
      setShowAdd(false); setSelectedPro(null); setRole(''); setSearchTerm('');
      onTeamUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add team member.');
    } finally { setSaving(false); }
  };

  const handleRemove = async (collaboratorId) => {
    if (!window.confirm('Remove this team member?')) return;
    setRemoving(collaboratorId);
    try {
      await removeCollaborator(project._id, collaboratorId);
      onTeamUpdated();
    } catch { alert('Failed to remove team member.'); }
    finally { setRemoving(null); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-secondary-900">Project Team ({collaborators.length})</h2>
        <Button icon={UserPlus} size="sm" onClick={() => setShowAdd(true)}>Add Team Member</Button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-secondary-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-secondary-900">Add Team Member</h3>
            <button onClick={() => { setShowAdd(false); setSelectedPro(null); setSearchTerm(''); }}
              className="rounded p-1 text-secondary-400 hover:text-secondary-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary-700">Search Professionals</label>
              <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setSelectedPro(null); }}
                placeholder="Search by name or profession..."
                className="w-full rounded-lg border border-secondary-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            {loadingPros && <p className="text-sm text-secondary-400">Searching...</p>}

            {professionals.length > 0 && !selectedPro && (
              <div className="flex flex-col gap-2 rounded-lg border border-secondary-100 bg-secondary-50 p-2">
                {professionals.map((pro) => (
                  <button key={pro._id} onClick={() => setSelectedPro(pro)}
                    className="flex items-center gap-3 rounded-lg p-2.5 text-left hover:bg-white">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                      {getInitials(pro.user?.fullName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{pro.user?.fullName}</p>
                      <p className="text-xs text-secondary-500">{pro.profession} · {pro.county}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedPro && (
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-secondary-900">{selectedPro.user?.fullName}</p>
                  <p className="text-xs text-secondary-500">{selectedPro.profession}</p>
                </div>
                <button onClick={() => setSelectedPro(null)} className="text-secondary-400 hover:text-secondary-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-secondary-700">Role <span className="text-red-500">*</span></label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-secondary-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none">
                <option value="">Select role</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <Button onClick={handleAdd} isLoading={saving} icon={UserPlus}>Add to Project</Button>
          </div>
        </div>
      )}

      {collaborators.length === 0 ? (
        <EmptyState icon={UserPlus} title="No team members yet"
          description="Add professionals from Nuru to your project team."
          action={<Button icon={UserPlus} onClick={() => setShowAdd(true)}>Add Team Member</Button>} />
      ) : (
        <div className="flex flex-col gap-3">
          {collaborators.map((collab) => {
            const pro = collab.professional;
            const user = pro?.user;
            return (
              <div key={collab._id} className="flex items-center gap-4 rounded-xl border border-secondary-100 bg-white p-4 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                  {getInitials(user?.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-secondary-900">{user?.fullName}</p>
                    <Badge variant="primary">{collab.role}</Badge>
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-secondary-500">
                    {pro?.profession && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{pro.profession}</span>}
                    {pro?.county && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pro.county}</span>}
                    {pro?.averageRating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{pro.averageRating}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/professionals/${pro?._id}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-primary-700 hover:underline">View Profile</a>
                  <button onClick={() => handleRemove(collab._id)} disabled={removing === collab._id}
                    className="rounded p-1.5 text-secondary-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamPanel;
