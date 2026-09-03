const Input = ({ label, error, icon: Icon, className = '', ...rest }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-secondary-700">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
        )}
        <input
          className={`w-full rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400' : ''} ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
