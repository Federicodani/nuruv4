const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-secondary-200 bg-secondary-50/50 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-100">
          <Icon className="h-7 w-7 text-secondary-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-secondary-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
