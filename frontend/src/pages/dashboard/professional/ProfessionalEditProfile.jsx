import { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import TextArea from '../../../components/common/TextArea';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import ImageUploadBox from '../../../components/dashboard/ImageUploadBox';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import {
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
  updateProfileImage,
  updateCoverImage,
} from '../../../api/professionalApi';
import { getConstants } from '../../../api/searchApi';

const ProfessionalEditProfile = () => {
  const [profile, setProfile] = useState(null);
  const [constants, setConstants] = useState({ professions: [], counties: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [form, setForm] = useState({
    profession: '',
    bio: '',
    yearsOfExperience: 0,
    county: '',
    town: '',
    whatsappNumber: '',
  });

  useEffect(() => {
    Promise.all([getMyProfessionalProfile(), getConstants()])
      .then(([profileRes, constantsRes]) => {
        const p = profileRes.data.professional;
        setProfile(p);
        setConstants(constantsRes.data);
        setForm({
          profession: p.profession || '',
          bio: p.bio || '',
          yearsOfExperience: p.yearsOfExperience || 0,
          county: p.county || '',
          town: p.town || '',
          whatsappNumber: p.whatsappNumber || '',
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
      const { data } = await updateMyProfessionalProfile(form);
      setProfile(data.professional);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (file) => {
    setUploadingProfile(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await updateProfileImage(formData);
      setProfile((p) => ({ ...p, profileImage: data.profileImage }));
    } catch {
      setError('Failed to upload profile image.');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverImageUpload = async (file) => {
    setUploadingCover(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await updateCoverImage(formData);
      setProfile((p) => ({ ...p, coverImage: data.coverImage }));
    } catch {
      setError('Failed to upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading profile..." />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-secondary-900">Edit Profile</h1>
      <p className="mt-1 text-secondary-500">Keep your profile up to date to attract more clients.</p>

      <div className="mt-6 flex flex-wrap gap-6 rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
        <ImageUploadBox
          shape="circle"
          label="Profile Photo"
          currentImageUrl={profile?.profileImage?.url}
          onUpload={handleProfileImageUpload}
          isUploading={uploadingProfile}
        />
        <ImageUploadBox
          shape="square"
          label="Cover Photo"
          currentImageUrl={profile?.coverImage?.url}
          onUpload={handleCoverImageUpload}
          isUploading={uploadingCover}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <Select
          label="Profession"
          name="profession"
          value={form.profession}
          onChange={handleChange}
          options={constants.professions}
          required
        />

        <TextArea
          label="Bio"
          name="bio"
          rows={4}
          placeholder="Tell clients about your experience and expertise..."
          value={form.bio}
          onChange={handleChange}
          maxLength={1000}
        />

        <Input
          label="Years of Experience"
          name="yearsOfExperience"
          type="number"
          min="0"
          value={form.yearsOfExperience}
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

        <Input
          label="WhatsApp Number"
          name="whatsappNumber"
          placeholder="+254712345678"
          value={form.whatsappNumber}
          onChange={handleChange}
        />

        <Button type="submit" variant="primary" isLoading={saving}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default ProfessionalEditProfile;
