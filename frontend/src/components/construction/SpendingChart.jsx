import { formatCurrency } from '../../utils/helpers';

// Minimal bar chart using plain divs — no extra library needed.
// Matches the existing card/shadow design tokens.

const CATEGORY_COLORS = {
  Materials: '#F59E0B',
  Labour: '#3B82F6',
  Transport: '#10B981',
  'Professional Fees': '#8B5CF6',
  Equipment: '#F97316',
  'Permits & Fees': '#EC4899',
  Miscellaneous: '#6B7280',
};

const SpendingByCategory = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-secondary-400">
        No expense data yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => {
        const pct = Math.round((item.total / max) * 100);
        const color = CATEGORY_COLORS[item._id] || '#9CA3AF';
        return (
          <div key={item._id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-secondary-700">{item._id}</span>
              <span className="font-bold text-secondary-900">{formatCurrency(item.total)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Monthly spending trend using inline SVG bars
const MonthlySpendingChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-secondary-400">
        No monthly data yet
      </div>
    );
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const max = Math.max(...data.map((d) => d.total), 1);
  const barW = 28;
  const gap = 8;
  const chartH = 80;
  const totalW = data.length * (barW + gap);

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={chartH + 24} className="min-w-full">
        {data.map((point, i) => {
          const barH = Math.max(4, Math.round((point.total / max) * chartH));
          const x = i * (barW + gap);
          const y = chartH - barH;
          const label = MONTHS[(point._id.month || 1) - 1];
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#F59E0B" opacity={0.85} />
              <text
                x={x + barW / 2}
                y={chartH + 14}
                textAnchor="middle"
                fontSize={9}
                fill="#6B7280"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export { SpendingByCategory, MonthlySpendingChart };
