import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Alert from '../../../components/common/Alert';
import AdminDataTable from '../../../components/dashboard/AdminDataTable';
import Badge from '../../../components/common/Badge';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { getAllJobsAdmin, deleteJobAdmin } from '../../../api/adminApi';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      const { data } = await getAllJobsAdmin();
      setJobs(data.jobs);
    } catch {
      setError('Failed to load jobs.');
    }
  };

  useEffect(() => {
    fetchJobs().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (job) => {
    try {
      await deleteJobAdmin(job._id);
      await fetchJobs();
    } catch {
      setError('Failed to delete job.');
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading jobs..." />;

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'client', header: 'Posted By', render: (row) => row.client?.fullName },
    { key: 'budget', header: 'Budget', render: (row) => formatCurrency(row.budget) },
    { key: 'location', header: 'Location' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'open' ? 'success' : 'neutral'}>{row.status}</Badge>,
    },
    { key: 'createdAt', header: 'Posted', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Jobs</h1>
      <p className="mt-1 text-secondary-500">View and remove job postings on the platform.</p>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-6">
        <AdminDataTable
          columns={columns}
          data={jobs}
          icon={ClipboardList}
          emptyTitle="No jobs found"
          emptyDescription="No jobs have been posted yet."
          onDelete={handleDelete}
          getRowLabel={(row) => row.title}
        />
      </div>
    </div>
  );
};

export default AdminJobsPage;
