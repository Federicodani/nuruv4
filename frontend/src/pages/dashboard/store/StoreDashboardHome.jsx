import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Plus } from 'lucide-react';
import StatCard from '../../../components/dashboard/StatCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Button from '../../../components/common/Button';
import { getMyStore } from '../../../api/storeApi';
import { getMyProducts } from '../../../api/productApi';

const StoreDashboardHome = () => {
  const [store, setStore] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyStore(), getMyProducts()])
      .then(([storeRes, productsRes]) => {
        setStore(storeRes.data.store);
        setProductCount(productsRes.data.count);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Loading your dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">Welcome back, {store?.storeName}</h1>
      <p className="mt-1 text-secondary-500">Here's an overview of your store.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Package} label="Total Products" value={productCount} accent />
        <StatCard icon={MapPin} label="Location" value={`${store?.town}, ${store?.county}`} />
      </div>

      <div className="mt-8 rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-secondary-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/dashboard/store/products">
            <Button variant="primary" size="sm" icon={Plus}>Add Product</Button>
          </Link>
          <Link to="/dashboard/store/profile">
            <Button variant="outline" size="sm">Edit Store Profile</Button>
          </Link>
          <Link to={`/stores/${store?._id}`} target="_blank">
            <Button variant="outline" size="sm">View Public Store Page</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboardHome;
