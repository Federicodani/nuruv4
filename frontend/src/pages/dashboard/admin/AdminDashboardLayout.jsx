import { LayoutDashboard, Users, Briefcase, Store, Package, ClipboardList } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const SIDEBAR_LINKS = [
  { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/admin/users', label: 'Users', icon: Users },
  { to: '/dashboard/admin/professionals', label: 'Professionals', icon: Briefcase },
  { to: '/dashboard/admin/stores', label: 'Stores', icon: Store },
  { to: '/dashboard/admin/products', label: 'Products', icon: Package },
  { to: '/dashboard/admin/jobs', label: 'Jobs', icon: ClipboardList },
];

const AdminDashboardLayout = () => {
  return <DashboardLayout sidebarLinks={SIDEBAR_LINKS} title="Admin Panel" />;
};

export default AdminDashboardLayout;
