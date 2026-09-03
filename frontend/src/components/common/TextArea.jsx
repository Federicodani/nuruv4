const TextArea = ({ label, error, className = '', ...rest }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-secondary-700">{label}</label>
      )}
      <textarea
        className={`w-full rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${error ? 'border-red-400' : ''} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default TextArea;
