import { LayoutDashboard, Package, Store, MapPin } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const SIDEBAR_LINKS = [
  { to: '/dashboard/store', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/store/products', label: 'Products', icon: Package },
  { to: '/dashboard/store/profile', label: 'Store Profile', icon: Store },
  { to: '/dashboard/store/location', label: 'Store Location', icon: MapPin },
];

const StoreDashboardLayout = () => {
  return <DashboardLayout sidebarLinks={SIDEBAR_LINKS} title="Store Dashboard" />;
};

export default StoreDashboardLayout;
