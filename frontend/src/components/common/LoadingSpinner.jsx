const LoadingSpinner = ({ size = 'md', fullPage = false, label = 'Loading...' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-3 border-secondary-200 border-t-primary`}
      />
      {label && <p className="text-sm text-secondary-500">{label}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center">{spinner}</div>;
  }

  return <div className="flex w-full items-center justify-center py-10">{spinner}</div>;
};

export default LoadingSpinner;
