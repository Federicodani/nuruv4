import { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import TextArea from '../../../components/common/TextArea';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import ImageUploadBox from '../../../components/dashboard/ImageUploadBox';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { getMyStore, updateMyStore, updateStoreLogo, updateStoreCover } from '../../../api/storeApi';
import { getConstants } from '../../../api/searchApi';

const StoreProfilePage = () => {
  const [store, setStore] = useState(null);
  const [constants, setConstants] = useState({ counties: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [form, setForm] = useState({
    storeName: '',
    description: '',
    phone: '',
    whatsappNumber: '',
    county: '',
    town: '',
  });

  useEffect(() => {
    Promise.all([getMyStore(), getConstants()])
      .then(([storeRes, constantsRes]) => {
        const s = storeRes.data.store;
        setStore(s);
        setConstants(constantsRes.data);
        setForm({
          storeName: s.storeName || '',
          description: s.description || '',
          phone: s.phone || '',
          whatsappNumber: s.whatsappNumber || '',
          county: s.county || '',
          town: s.town || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const { data } = await updateMyStore(form);
      setStore(data.store);
      setSuccess('Store profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update store profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    setUploadingLogo(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await updateStoreLogo(formData);
      setStore((s) => ({ ...s, logo: data.logo }));
    } catch {
      setError('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (file) => {
    setUploadingCover(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await updateStoreCover(formData);
      setStore((s) => ({ ...s, coverImage: data.coverImage }));
    } catch {
      setError('Failed to upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading store profile..." />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-secondary-900">Store Profile</h1>
      <p className="mt-1 text-secondary-500">Manage how your store appears to customers.</p>

      <div className="mt-6 flex flex-wrap gap-6 rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
        <ImageUploadBox
          shape="circle"
          label="Store Logo"
          currentImageUrl={store?.logo?.url}
          onUpload={handleLogoUpload}
          isUploading={uploadingLogo}
        />
        <ImageUploadBox
          shape="square"
          label="Cover Image"
          currentImageUrl={store?.coverImage?.url}
          onUpload={handleCoverUpload}
          isUploading={uploadingCover}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <Input
          label="Store Name"
          name="storeName"
          value={form.storeName}
          onChange={handleChange}
          required
        />

        <TextArea
          label="Store Description"
          name="description"
          rows={4}
          placeholder="Tell customers what your store offers..."
          value={form.description}
          onChange={handleChange}
          maxLength={1000}
        />

        <Input
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <Input
          label="WhatsApp Number"
          name="whatsappNumber"
          placeholder="+254712345678"
          value={form.whatsappNumber}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="County"
            name="county"
            value={form.county}
            onChange={handleChange}
            options={constants.counties}
            required
          />
          <Input
            label="Town"
            name="town"
            value={form.town}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" variant="primary" isLoading={saving}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default StoreProfilePage;
