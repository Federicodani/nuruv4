import { useState, useEffect } from 'react';
import { Users, Briefcase, Store, Package, ClipboardList } from 'lucide-react';
import StatCard from '../../../components/dashboard/StatCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { getAdminStats } from '../../../api/adminApi';

const AdminOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Loading dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Admin Overview</h1>
      <p className="mt-1 text-secondary-500">Platform-wide statistics at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Total Users" value={stats?.userCount || 0} accent />
        <StatCard icon={Briefcase} label="Professionals" value={stats?.professionalCount || 0} />
        <StatCard icon={Store} label="Stores" value={stats?.storeCount || 0} />
        <StatCard icon={Package} label="Products" value={stats?.productCount || 0} />
        <StatCard icon={ClipboardList} label="Jobs Posted" value={stats?.jobCount || 0} />
      </div>
    </div>
  );
};

export default AdminOverviewPage;
