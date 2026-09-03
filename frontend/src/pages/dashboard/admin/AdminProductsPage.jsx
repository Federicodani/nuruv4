import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Alert from '../../../components/common/Alert';
import AdminDataTable from '../../../components/dashboard/AdminDataTable';
import { formatCurrency } from '../../../utils/helpers';
import { getAllProductsAdmin, deleteProductAdmin } from '../../../api/adminApi';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await getAllProductsAdmin();
      setProducts(data.products);
    } catch {
      setError('Failed to load products.');
    }
  };

  useEffect(() => {
    fetchProducts().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (product) => {
    try {
      await deleteProductAdmin(product._id);
      await fetchProducts();
    } catch {
      setError('Failed to delete product.');
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading products..." />;

  const columns = [
    { key: 'name', header: 'Product' },
    { key: 'category', header: 'Category' },
    { key: 'store', header: 'Store', render: (row) => row.store?.storeName },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Products</h1>
      <p className="mt-1 text-secondary-500">View and remove products listed on the platform.</p>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-6">
        <AdminDataTable
          columns={columns}
          data={products}
          icon={Package}
          emptyTitle="No products found"
          emptyDescription="No stores have listed any products yet."
          onDelete={handleDelete}
          getRowLabel={(row) => row.name}
        />
      </div>
    </div>
  );
};

export default AdminProductsPage;
