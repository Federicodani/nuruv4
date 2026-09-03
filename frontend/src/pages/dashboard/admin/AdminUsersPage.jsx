import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Alert from '../../../components/common/Alert';
import AdminDataTable from '../../../components/dashboard/AdminDataTable';
import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/helpers';
import { getAllUsers, deleteUserAdmin } from '../../../api/adminApi';

const ROLE_LABELS = {
  client: 'Client',
  professional: 'Professional',
  store_owner: 'Store Owner',
  admin: 'Admin',
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data.users);
    } catch {
      setError('Failed to load users.');
    }
  };

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (user) => {
    try {
      await deleteUserAdmin(user._id);
      await fetchUsers();
    } catch {
      setError('Failed to delete user.');
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading users..." />;

  const columns = [
    { key: 'fullName', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <Badge variant={row.role === 'admin' ? 'dark' : 'neutral'}>{ROLE_LABELS[row.role]}</Badge>,
    },
    { key: 'createdAt', header: 'Joined', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Users</h1>
      <p className="mt-1 text-secondary-500">Manage all registered users on the platform.</p>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-6">
        <AdminDataTable
          columns={columns}
          data={users.filter((u) => u.role !== 'admin')}
          icon={Users}
          emptyTitle="No users found"
          emptyDescription="No users have registered yet."
          onDelete={handleDelete}
          getRowLabel={(row) => row.fullName}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;
