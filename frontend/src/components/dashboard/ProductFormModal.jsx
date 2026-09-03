import { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import TextArea from '../common/TextArea';
import Button from '../common/Button';
import Alert from '../common/Alert';

const ProductFormModal = ({ isOpen, onClose, onSubmit, isSubmitting, error, categories, editingProduct }) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    stockQuantity: '',
    location: '',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        price: editingProduct.price || '',
        description: editingProduct.description || '',
        stockQuantity: editingProduct.stockQuantity || '',
        location: editingProduct.location || '',
      });
      setPreviews(editingProduct.images?.map((img) => img.url) || []);
    } else {
      setForm({ name: '', category: '', price: '', description: '', stockQuantity: '', location: '' });
      setPreviews([]);
    }
    setFiles([]);
  }, [editingProduct, isOpen]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const removePreview = (idx) => {
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    files.forEach((file) => formData.append('images', file));

    const success = await onSubmit(formData);
    if (success) {
      setFiles([]);
      setPreviews([]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Product' : 'Add New Product'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <Input
          label="Product Name"
          name="name"
          placeholder="e.g. 50kg Bag of Cement"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            options={categories}
            required
          />
          <Input
            label="Price (KSh)"
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <TextArea
          label="Description"
          name="description"
          rows={3}
          placeholder="Describe the product..."
          value={form.description}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Stock Quantity"
            name="stockQuantity"
            type="number"
            min="0"
            value={form.stockQuantity}
            onChange={handleChange}
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            Product Images
          </label>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, idx) => (
              <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-lg bg-secondary-50">
                <img src={src} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(idx)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-900/70 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-secondary-200 text-secondary-400 hover:border-primary hover:text-primary"
            >
              <Upload className="h-5 w-5" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
          <p className="mt-1.5 text-xs text-secondary-400">Upload up to 6 images. First image is used as the cover.</p>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
          {editingProduct ? 'Update Product' : 'Add Product'}
        </Button>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
