import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import JobCard from '../../components/jobs/JobCard';
import PostJobModal from '../../components/jobs/PostJobModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { getJobs, createJob } from '../../api/jobApi';
import { useAuth } from '../../context/AuthContext';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchJobs = useCallback(async (search) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await getJobs(params);
      setJobs(data.jobs);
    } catch {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (value) => {
    setSearchInput(value);
    fetchJobs(value);
  };

  const handlePostJobClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/jobs' } });
      return;
    }
    setShowModal(true);
  };

  const handleCreateJob = async (formData) => {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await createJob(formData);
      await fetchJobs(searchInput);
      setShowModal(false);
      return true;
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to post job. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Jobs</h1>
          <p className="mt-1 text-secondary-500">
            Browse construction jobs or post your own to find the right professional
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handlePostJobClick}>
          Post a Job
        </Button>
      </div>

      <div className="mb-8 max-w-xl">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          placeholder="Search jobs..."
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading jobs..." />
      ) : error ? (
        <EmptyState icon={ClipboardList} title="Something went wrong" description={error} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No jobs posted yet"
          description="Be the first to post a job and find the right professional."
          action={
            <Button variant="primary" icon={Plus} onClick={handlePostJobClick}>
              Post a Job
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      <PostJobModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateJob}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </div>
  );
};

export default JobsPage;
