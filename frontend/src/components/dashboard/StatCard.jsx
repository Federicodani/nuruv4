const StatCard = ({ icon: Icon, label, value, accent = false }) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent ? 'bg-primary text-secondary' : 'bg-secondary-100 text-secondary-700'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-secondary-900">{value}</p>
        <p className="text-sm text-secondary-500">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
