const STATUS_CONFIG = {
  'Not Started': { cls: 'bg-secondary-100 text-secondary-600 border-secondary-200', dot: 'bg-secondary-400', icon: '⬜' },
  'In Progress': { cls: 'bg-blue-50 text-blue-700 border-blue-200',                 dot: 'bg-blue-500',       icon: '🔄' },
  'Completed':   { cls: 'bg-green-50 text-green-700 border-green-200',               dot: 'bg-green-500',      icon: '✅' },
  'Delayed':     { cls: 'bg-red-50 text-red-700 border-red-200',                     dot: 'bg-red-500',        icon: '🔴' },
  'On Hold':     { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',            dot: 'bg-yellow-500',     icon: '⏸️' },
};

const PRIORITY_CONFIG = {
  Low:    'bg-secondary-100 text-secondary-500',
  Medium: 'bg-blue-50 text-blue-600',
  High:   'bg-orange-50 text-orange-600',
  Urgent: 'bg-red-50 text-red-700',
};

export const MilestoneStatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Not Started'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

export const TaskStatusBadge = ({ status }) => {
  const TASK_STATUS_CONFIG = {
    'To Do':      { cls: 'bg-secondary-100 text-secondary-600 border-secondary-200', dot: 'bg-secondary-400' },
    'In Progress':{ cls: 'bg-blue-50 text-blue-700 border-blue-200',                 dot: 'bg-blue-500' },
    'Completed':  { cls: 'bg-green-50 text-green-700 border-green-200',               dot: 'bg-green-500' },
    'Delayed':    { cls: 'bg-red-50 text-red-700 border-red-200',                     dot: 'bg-red-500' },
    'Cancelled':  { cls: 'bg-secondary-100 text-secondary-400 border-secondary-200',  dot: 'bg-secondary-300' },
  };
  const cfg = TASK_STATUS_CONFIG[status] || TASK_STATUS_CONFIG['To Do'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const cls = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {priority}
    </span>
  );
};

export const ProgressBar = ({ value = 0, size = 'sm', showLabel = false, color = '' }) => {
  const pct = Math.min(100, Math.max(0, value));
  const barColor = color || (pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-primary' : pct >= 30 ? 'bg-blue-500' : 'bg-secondary-300');
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-secondary-500">Progress</span>
          <span className="font-semibold text-secondary-700">{pct}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-secondary-100 ${h}`}>
        <div className={`${h} rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
