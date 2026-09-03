import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AdminDataTable from '../../../components/dashboard/AdminDataTable';
import Badge from '../../../components/common/Badge';
import RatingStars from '../../../components/common/RatingStars';
import { getAllProfessionalsAdmin } from '../../../api/adminApi';

const AdminProfessionalsPage = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProfessionalsAdmin()
      .then(({ data }) => setProfessionals(data.professionals))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Loading professionals..." />;

  const columns = [
    { key: 'name', header: 'Name', render: (row) => row.user?.fullName },
    { key: 'profession', header: 'Profession' },
    { key: 'location', header: 'Location', render: (row) => `${row.town}, ${row.county}` },
    { key: 'rating', header: 'Rating', render: (row) => <RatingStars rating={row.averageRating} /> },
    {
      key: 'partner',
      header: 'Partner',
      render: (row) => row.isNuruElectricals ? <Badge variant="primary">Recommended</Badge> : '—',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Professionals</h1>
      <p className="mt-1 text-secondary-500">View all professional profiles on the platform.</p>

      <div className="mt-6">
        <AdminDataTable
          columns={columns}
          data={professionals}
          icon={Briefcase}
          emptyTitle="No professionals found"
          emptyDescription="No professionals have registered yet."
        />
      </div>
    </div>
  );
};

export default AdminProfessionalsPage;
