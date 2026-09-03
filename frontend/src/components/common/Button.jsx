const VARIANTS = {
  primary: 'bg-primary text-secondary hover:bg-primary-600 shadow-sm',
  secondary: 'bg-secondary text-white hover:bg-secondary-800 shadow-sm',
  outline: 'bg-white text-secondary border border-secondary-200 hover:border-secondary-400',
  ghost: 'bg-transparent text-secondary hover:bg-secondary-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1ebe5a] shadow-sm',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  className = '',
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
};

export default Button;
