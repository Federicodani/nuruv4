import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Button from '../common/Button';
import Alert from '../common/Alert';

const PostJobModal = ({ isOpen, onClose, onSubmit, isSubmitting, error }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    location: '',
    contactNumber: '',
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(form);
    if (success) {
      setForm({ title: '', description: '', budget: '', location: '', contactNumber: '' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post a Job" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <Input
          label="Job Title"
          name="title"
          placeholder="e.g. Need Electrician for Rental Apartment"
          value={form.title}
          onChange={handleChange}
          required
        />
        <TextArea
          label="Description"
          name="description"
          rows={4}
          placeholder="Describe the work that needs to be done..."
          value={form.description}
          onChange={handleChange}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Budget (KSh)"
            name="budget"
            type="number"
            min="0"
            placeholder="e.g. 15000"
            value={form.budget}
            onChange={handleChange}
            required
          />
          <Input
            label="Location"
            name="location"
            placeholder="e.g. Nairobi"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>
        <Input
          label="Contact Number"
          name="contactNumber"
          placeholder="e.g. 0712345678"
          value={form.contactNumber}
          onChange={handleChange}
          required
        />

        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
          Post Job
        </Button>
      </form>
    </Modal>
  );
};

export default PostJobModal;
