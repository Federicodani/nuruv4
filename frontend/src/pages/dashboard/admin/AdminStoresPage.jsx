import { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AdminDataTable from '../../../components/dashboard/AdminDataTable';
import Badge from '../../../components/common/Badge';
import { getAllStoresAdmin } from '../../../api/adminApi';

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllStoresAdmin()
      .then(({ data }) => setStores(data.stores))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Loading stores..." />;

  const columns = [
    { key: 'storeName', header: 'Store Name' },
    { key: 'owner', header: 'Owner', render: (row) => row.owner?.fullName },
    { key: 'phone', header: 'Phone' },
    { key: 'location', header: 'Location', render: (row) => `${row.town}, ${row.county}` },
    {
      key: 'partner',
      header: 'Partner',
      render: (row) => row.isNuruElectricals ? <Badge variant="primary">Recommended</Badge> : '—',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Stores</h1>
      <p className="mt-1 text-secondary-500">View all registered stores on the platform.</p>

      <div className="mt-6">
        <AdminDataTable
          columns={columns}
          data={stores}
          icon={Store}
          emptyTitle="No stores found"
          emptyDescription="No stores have registered yet."
        />
      </div>
    </div>
  );
};

export default AdminStoresPage;
