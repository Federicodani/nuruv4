import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, BarChart2 } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { getBenchmarkData } from '../../../api/constructionProjectApi';
import { formatCurrency } from '../../../utils/helpers';

const POSITION_CONFIG = {
  within_range: {
    label: 'Within comparable range',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    icon: CheckCircle,
  },
  below_range: {
    label: 'Below comparable range',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: TrendingUp,
  },
  above_range: {
    label: 'Above comparable range',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
    icon: AlertCircle,
  },
};

const BenchmarkPanel = ({ projectId, compact = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBenchmarkData(projectId)
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <LoadingSpinner size="sm" label="Loading benchmarks..." />;

  if (!data) {
    return (
      <p className="text-sm text-secondary-400">Benchmarking data unavailable.</p>
    );
  }

  if (!data.hasSufficientData) {
    return (
      <div className={`flex items-start gap-3 rounded-lg border border-secondary-200 bg-secondary-50 p-4 ${compact ? '' : ''}`}>
        <BarChart2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary-400" />
        <div>
          <p className="text-sm font-medium text-secondary-700">
            {data.message}
          </p>
          <p className="mt-1 text-xs text-secondary-400">
            Your budget: {formatCurrency(data.yourBudget)} · {data.comparableCount} comparable project{data.comparableCount !== 1 ? 's' : ''} found so far.
          </p>
        </div>
      </div>
    );
  }

  const { benchmarks, countyBenchmark, yourBudget, projectType, county, comparableCount } = data;
  const posConfig = POSITION_CONFIG[benchmarks.budgetPosition] || POSITION_CONFIG.within_range;
  const PosIcon = posConfig.icon;

  if (compact) {
    return (
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <div>
          <p className="text-xs text-secondary-400">Your Budget</p>
          <p className="font-bold text-secondary-900">{formatCurrency(yourBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-secondary-400">Similar Projects Avg</p>
          <p className="font-bold text-secondary-900">{formatCurrency(benchmarks.average)}</p>
        </div>
        <div>
          <p className="text-xs text-secondary-400">Range</p>
          <p className="font-semibold text-secondary-700">
            {formatCurrency(benchmarks.min)} – {formatCurrency(benchmarks.max)}
          </p>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${posConfig.bg} ${posConfig.color}`}>
          <PosIcon className="h-3.5 w-3.5" />
          {posConfig.label}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-semibold text-secondary-900">Project Benchmarking</h2>
        <p className="mt-1 text-sm text-secondary-500">
          Comparing your {projectType} against {comparableCount} similar projects on Nuru. All data is anonymised.
        </p>
      </div>

      {/* Position indicator */}
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${posConfig.bg}`}>
        <PosIcon className={`h-5 w-5 shrink-0 ${posConfig.color}`} />
        <div>
          <p className={`font-semibold ${posConfig.color}`}>{posConfig.label}</p>
          <p className="text-xs text-secondary-500">
            Your budget is at the {benchmarks.percentile}th percentile of comparable projects.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Your Budget', value: formatCurrency(yourBudget), highlight: true },
          { label: 'Average', value: formatCurrency(benchmarks.average) },
          { label: 'Median', value: formatCurrency(benchmarks.median) },
          { label: 'Range', value: `${formatCurrency(benchmarks.min)} – ${formatCurrency(benchmarks.max)}` },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-xl border p-4 ${highlight ? 'border-primary/30 bg-primary/5' : 'border-secondary-100 bg-white'} shadow-card`}>
            <p className="text-xs font-medium text-secondary-500">{label}</p>
            <p className={`mt-1 text-sm font-bold ${highlight ? 'text-primary-700' : 'text-secondary-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Visual range bar */}
      <div className="rounded-xl border border-secondary-100 bg-white p-4 shadow-card">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-400">Budget Range Visualisation</p>
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary-100">
          {/* Range fill */}
          <div className="absolute inset-y-0 bg-secondary-200 rounded-full"
            style={{
              left: '5%',
              right: '5%',
            }} />
          {/* Median marker */}
          <div className="absolute inset-y-0 w-0.5 bg-secondary-500"
            style={{ left: `${Math.round(((benchmarks.median - benchmarks.min) / Math.max(benchmarks.max - benchmarks.min, 1)) * 90 + 5)}%` }} />
          {/* Your budget marker */}
          {yourBudget >= benchmarks.min && yourBudget <= benchmarks.max && (
            <div className="absolute inset-y-0 w-1 rounded-full bg-primary"
              style={{ left: `${Math.round(((yourBudget - benchmarks.min) / Math.max(benchmarks.max - benchmarks.min, 1)) * 90 + 5)}%` }} />
          )}
        </div>
        <div className="mt-2 flex justify-between text-xs text-secondary-400">
          <span>Min: {formatCurrency(benchmarks.min)}</span>
          <span className="text-primary-700 font-medium">▲ Yours</span>
          <span>Max: {formatCurrency(benchmarks.max)}</span>
        </div>
      </div>

      {/* County comparison */}
      {countyBenchmark && (
        <div className="rounded-xl border border-secondary-100 bg-white p-4 shadow-card">
          <p className="mb-3 text-sm font-semibold text-secondary-900">{county} County Comparison</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-xs text-secondary-400">County Average</p>
              <p className="font-bold text-secondary-900">{formatCurrency(countyBenchmark.average)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400">County Median</p>
              <p className="font-bold text-secondary-900">{formatCurrency(countyBenchmark.median)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400">Projects in {county}</p>
              <p className="font-bold text-secondary-900">{countyBenchmark.count}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-secondary-400">
        * Benchmarks are based on anonymised data from Nuru projects only. No individual project details are shared.
      </p>
    </div>
  );
};

export default BenchmarkPanel;
