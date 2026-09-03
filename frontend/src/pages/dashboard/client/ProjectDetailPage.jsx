import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, BarChart2, Users, MapPin, Flag,
  Pencil, Trash2, Plus, AlertCircle, TrendingUp,
  Calendar, CheckCircle, ArrowLeft,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import StatCard from '../../../components/dashboard/StatCard';
import Badge from '../../../components/common/Badge';
import HealthBadge from '../../../components/construction/HealthBadge';
import BudgetBar from '../../../components/construction/BudgetBar';
import { SpendingByCategory, MonthlySpendingChart } from '../../../components/construction/SpendingChart';
import ExpenseForm from './ExpenseForm';
import TeamPanel from './TeamPanel';
import NearbyPanel from './NearbyPanel';
import BenchmarkPanel from './BenchmarkPanel';
import MilestonesPanel from './MilestonesPanel';
import {
  getConstructionProjectById,
  getProjectSummary,
  getProjectHealth,
  archiveConstructionProject,
  getExpenses,
  deleteExpense,
  getMilestoneStats,
} from '../../../api/constructionProjectApi';
import { formatCurrency, formatDate } from '../../../utils/helpers';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'milestones', label: 'Milestones', icon: Flag },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const [milestoneStats, setMilestoneStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [expenses, setExpenses] = useState([]);
  const [expLoading, setExpLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deletingExpId, setDeletingExpId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes, hRes, mRes] = await Promise.all([
        getConstructionProjectById(id),
        getProjectSummary(id),
        getProjectHealth(id),
        getMilestoneStats(id).catch(() => null),
      ]);
      setProject(pRes.data.project);
      setSummary(sRes.data.summary);
      setHealth(hRes.data.health);
      setMilestoneStats(mRes?.data || null);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchExpenses = useCallback(async () => {
    setExpLoading(true);
    try {
      const { data } = await getExpenses(id, { limit: 50 });
      setExpenses(data.expenses || []);
    } catch { setExpenses([]); }
    finally { setExpLoading(false); }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'expenses') fetchExpenses();
  }, [activeTab, fetchExpenses]);

  const handleDeleteExpense = async (expId) => {
    if (!window.confirm('Delete this expense?')) return;
    setDeletingExpId(expId);
    try {
      await deleteExpense(id, expId);
      setExpenses((prev) => prev.filter((e) => e._id !== expId));
      fetchAll(); // refresh summary
    } catch { alert('Failed to delete expense.'); }
    finally { setDeletingExpId(null); }
  };

  const handleArchive = async () => {
    if (!window.confirm('Archive this project? You can restore it later.')) return;
    try {
      await archiveConstructionProject(id);
      navigate('/dashboard/client');
    } catch { alert('Failed to archive project.'); }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading project..." />;

  if (!project) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-secondary-300" />
        <p className="text-secondary-600">Project not found or access denied.</p>
        <Link to="/dashboard/client"><Button variant="outline">Back to Projects</Button></Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/dashboard/client" className="mb-2 inline-flex items-center gap-1 text-sm text-secondary-400 hover:text-secondary-700">
            <ArrowLeft className="h-3.5 w-3.5" /> All Projects
          </Link>
          <h1 className="text-2xl font-bold text-secondary-900">{project.projectName}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-secondary-500">
            <span>{project.projectType}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{project.town ? `${project.town}, ` : ''}{project.county}</span>
            {health && <HealthBadge status={health.overall?.label ? health.overall.label.toLowerCase().replace(' ', '_') : 'on_track'} />}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/client/projects/${id}/edit`}>
            <Button variant="outline" size="sm" icon={Pencil}>Edit</Button>
          </Link>
          <Button variant="danger" size="sm" icon={Trash2} onClick={handleArchive}>Archive</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-secondary-200 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary-700'
                : 'border-transparent text-secondary-500 hover:text-secondary-800'
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && summary && (
        <div className="flex flex-col gap-6">
          {/* Key stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={TrendingUp} label="Total Budget" value={formatCurrency(summary.budget)} accent />
            <StatCard icon={Receipt} label="Spent" value={formatCurrency(summary.totalSpent)} />
            <StatCard icon={CheckCircle} label="Remaining" value={formatCurrency(summary.remaining)} />
            <StatCard icon={BarChart2} label="Utilisation" value={`${summary.utilizationPct}%`} />
          </div>

          {/* Budget bar */}
          <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
            <BudgetBar budget={summary.budget} spent={summary.totalSpent} />
            {summary.isOverBudget && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Over budget by {formatCurrency(Math.abs(summary.variance))}
              </div>
            )}
          </div>

          {/* Project Health */}
          {health && (
            <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
              <h2 className="mb-4 font-semibold text-secondary-900">Project Health</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { key: 'budget', label: 'Budget' },
                  { key: 'timeline', label: 'Timeline' },
                  { key: 'progress', label: 'Progress' },
                  { key: 'milestones', label: 'Milestones' },
                ].map(({ key, label }) => (
                  <div key={key} className="rounded-lg border border-secondary-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-600">{label}</span>
                      <HealthBadge status={health[key]?.label?.toLowerCase().replace(' ', '_') || 'on_track'} />
                    </div>
                    <p className="mt-2 text-xs text-secondary-500">{health[key]?.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress + Stage */}
          <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-secondary-900">Construction Progress</h2>
              <span className="text-sm font-bold text-secondary-900">{project.progress}%</span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary-100">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-secondary-500">
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-primary" /> {project.currentStage}</span>
              {project.startDate && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Started {formatDate(project.startDate)}</span>}
              {project.expectedCompletionDate && <span>Due {formatDate(project.expectedCompletionDate)}</span>}
            </div>
          </div>

          {/* Benchmark teaser */}
          <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-secondary-900">Benchmarking</h2>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                View full analysis →
              </button>
            </div>
            <BenchmarkPanel projectId={id} compact />
          </div>
        </div>
      )}

      {/* ── EXPENSES TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'expenses' && (
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-secondary-900">Expense History</h2>
            <Button icon={Plus} size="sm" onClick={() => { setEditExpense(null); setShowExpenseForm(true); }}>
              Add Expense
            </Button>
          </div>

          {showExpenseForm && (
            <div className="mb-6">
              <ExpenseForm
                projectId={id}
                expense={editExpense}
                onSaved={() => { setShowExpenseForm(false); setEditExpense(null); fetchExpenses(); fetchAll(); }}
                onCancel={() => { setShowExpenseForm(false); setEditExpense(null); }}
              />
            </div>
          )}

          {expLoading ? (
            <LoadingSpinner label="Loading expenses..." />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses recorded yet"
              description="Add your first expense to start tracking spending."
              action={<Button icon={Plus} onClick={() => setShowExpenseForm(true)}>Add Expense</Button>}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-secondary-100 bg-white shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50 text-xs font-semibold uppercase tracking-wide text-secondary-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Stage</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3 text-secondary-500">{formatDate(exp.date)}</td>
                      <td className="px-4 py-3 font-medium text-secondary-900">{exp.description}</td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral">{exp.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-secondary-500">{exp.stage || '—'}</td>
                      <td className="px-4 py-3 text-right font-bold text-secondary-900">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setEditExpense(exp); setShowExpenseForm(true); window.scrollTo(0, 0); }}
                            className="rounded p-1 text-secondary-400 hover:text-secondary-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp._id)}
                            disabled={deletingExpId === exp._id}
                            className="rounded p-1 text-secondary-400 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-secondary-200 bg-secondary-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-secondary-700">Total</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-secondary-900">
                      {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && summary && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
              <h2 className="mb-4 font-semibold text-secondary-900">Spending by Category</h2>
              <SpendingByCategory data={summary.byCategory} />
            </div>
            <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
              <h2 className="mb-4 font-semibold text-secondary-900">Monthly Spending</h2>
              <MonthlySpendingChart data={summary.byMonth} />
            </div>
          </div>

          {summary.byStage?.length > 0 && (
            <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
              <h2 className="mb-4 font-semibold text-secondary-900">Spending by Construction Stage</h2>
              <SpendingByCategory data={summary.byStage} />
            </div>
          )}

          {summary.averageDailySpend !== null && (
            <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
              <h2 className="mb-1 font-semibold text-secondary-900">Average Daily Spend</h2>
              <p className="text-3xl font-bold text-primary">{formatCurrency(summary.averageDailySpend)}<span className="ml-1 text-base font-normal text-secondary-500">/day</span></p>
            </div>
          )}

          {milestoneStats && (milestoneStats.milestoneStats?.total > 0 || milestoneStats.taskStats?.total > 0) && (
            <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
              <h2 className="mb-4 font-semibold text-secondary-900">Milestone &amp; Task Summary</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Total Milestones', value: milestoneStats.milestoneStats?.total ?? 0 },
                  { label: 'Completed', value: milestoneStats.milestoneStats?.completed ?? 0, color: 'text-green-700' },
                  { label: 'Delayed / Overdue', value: (milestoneStats.milestoneStats?.delayed ?? 0) + (milestoneStats.milestoneStats?.overdue ?? 0), color: 'text-red-700' },
                  { label: 'Avg Progress', value: `${milestoneStats.milestoneStats?.avgProgress ?? 0}%` },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border border-secondary-100 bg-secondary-50 p-3 text-center">
                    <p className={`text-xl font-bold ${color || 'text-secondary-900'}`}>{value}</p>
                    <p className="mt-0.5 text-xs text-secondary-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Total Tasks', value: milestoneStats.taskStats?.total ?? 0 },
                  { label: 'Completed', value: milestoneStats.taskStats?.completed ?? 0, color: 'text-green-700' },
                  { label: 'In Progress', value: milestoneStats.taskStats?.inProgress ?? 0, color: 'text-blue-700' },
                  { label: 'Overdue', value: milestoneStats.taskStats?.overdue ?? 0, color: 'text-red-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border border-secondary-100 bg-secondary-50 p-3 text-center">
                    <p className={`text-xl font-bold ${color || 'text-secondary-900'}`}>{value}</p>
                    <p className="mt-0.5 text-xs text-secondary-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <BenchmarkPanel projectId={id} />
        </div>
      )}

      {/* ── TEAM TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <TeamPanel project={project} onTeamUpdated={fetchAll} />
      )}

      {/* ── MILESTONES TAB ────────────────────────────────────────────────── */}
      {activeTab === 'milestones' && project && (
        <MilestonesPanel
          project={project}
          isOwner={project.owner?._id?.toString() === user?._id?.toString() || project.owner?.toString() === user?._id?.toString()}
          collaboratorRole={null}
        />
      )}

      {/* ── NEARBY TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'nearby' && <NearbyPanel />}
    </div>
  );
};

export default ProjectDetailPage;
