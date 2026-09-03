import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const STYLES = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: AlertCircle,
};

const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;
  const Icon = ICONS[type];

  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${STYLES[type]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
