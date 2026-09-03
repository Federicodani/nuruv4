const VARIANTS = {
  primary: 'bg-primary/10 text-primary-700 border-primary/20',
  success: 'bg-green-50 text-green-700 border-green-200',
  neutral: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  dark: 'bg-secondary text-white border-secondary',
};

const Badge = ({ children, variant = 'neutral', icon: Icon, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
};

export default Badge;
