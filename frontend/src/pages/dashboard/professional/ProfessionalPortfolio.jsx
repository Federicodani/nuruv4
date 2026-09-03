import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Images } from 'lucide-react';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import EmptyState from '../../../components/common/EmptyState';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import {
  getMyProfessionalProfile,
  addPortfolioImage,
  deletePortfolioImage,
} from '../../../api/professionalApi';

const ProfessionalPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    getMyProfessionalProfile()
      .then(({ data }) => setPortfolio(data.professional.portfolio || []))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await addPortfolioImage(formData);
      setPortfolio(data.portfolio);
    } catch {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (imageId) => {
    setDeletingId(imageId);
    setError('');
    try {
      const { data } = await deletePortfolioImage(imageId);
      setPortfolio(data.portfolio);
    } catch {
      setError('Failed to delete image.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading portfolio..." />;

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Portfolio Gallery</h1>
          <p className="mt-1 text-secondary-500">Showcase your best work to attract more clients.</p>
        </div>
        <Button variant="primary" icon={Plus} isLoading={uploading} onClick={() => fileInputRef.current?.click()}>
          Upload Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-6">
        {portfolio.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No portfolio images yet"
            description="Upload images of your previous work to build trust with clients."
            action={
              <Button variant="primary" icon={Plus} onClick={() => fileInputRef.current?.click()}>
                Upload Your First Image
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {portfolio.map((img) => (
              <div key={img._id} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary-50">
                <img src={img.url} alt={img.caption || 'Portfolio'} className="h-full w-full object-cover" />
                <button
                  onClick={() => handleDelete(img._id)}
                  disabled={deletingId === img._id}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalPortfolio;
