import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import EmptyState from '../../../components/common/EmptyState';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import ProductFormModal from '../../../components/dashboard/ProductFormModal';
import { formatCurrency } from '../../../utils/helpers';
import { getMyProducts, createProduct, updateProduct, deleteProduct } from '../../../api/productApi';
import { getConstants } from '../../../api/searchApi';

const StoreProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await getMyProducts();
      setProducts(data.products);
    } catch {
      setError('Failed to load products.');
    }
  };

  useEffect(() => {
    Promise.all([getMyProducts(), getConstants()])
      .then(([productsRes, constantsRes]) => {
        setProducts(productsRes.data.products);
        setCategories(constantsRes.data.productCategories);
      })
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormError('');
    setShowFormModal(true);
  };

  const handleSubmit = async (formData) => {
    setFormError('');
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      await fetchProducts();
      setShowFormModal(false);
      return true;
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget._id);
      await fetchProducts();
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading products..." />;

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Products</h1>
          <p className="mt-1 text-secondary-500">Manage the products listed in your store.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add Product
        </Button>
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-6">
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your first product to start selling on Nuru Hub."
            action={
              <Button variant="primary" icon={Plus} onClick={openAddModal}>
                Add Your First Product
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-secondary-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary-50 text-xs uppercase text-secondary-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary-50">
                        {product.images?.[0]?.url && (
                          <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-secondary-900">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-secondary-600">{product.category}</td>
                    <td className="px-4 py-3 text-secondary-600">{product.stockQuantity}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-md p-2 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-md p-2 text-secondary-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={formError}
        categories={categories}
        editingProduct={editingProduct}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-secondary-600">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth isLoading={isDeleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StoreProductsPage;
