const STATUS_STYLES = {
  on_track: {
    dot: 'bg-green-500',
    text: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    label: 'On Track',
    emoji: '🟢',
  },
  needs_attention: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
    label: 'Needs Attention',
    emoji: '🟡',
  },
  at_risk: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    label: 'At Risk',
    emoji: '🔴',
  },
};

// Derives the status key from either a health object ({ label, color }) or a plain string
const resolveKey = (status) => {
  if (!status) return 'on_track';
  if (typeof status === 'string') return status;
  const label = (status.label || '').toLowerCase().replace(/\s/g, '_');
  if (label.includes('risk')) return 'at_risk';
  if (label.includes('attention')) return 'needs_attention';
  return 'on_track';
};

const HealthBadge = ({ status, size = 'sm', showLabel = true }) => {
  const key = resolveKey(status);
  const style = STATUS_STYLES[key] || STATUS_STYLES.on_track;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        {showLabel && style.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold ${style.bg} ${style.text}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

export default HealthBadge;
