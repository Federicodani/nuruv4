import {
  LayoutDashboard, FolderOpen, PlusCircle, MapPin,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const CLIENT_SIDEBAR_LINKS = [
  { to: '/dashboard/client', label: 'My Projects', icon: LayoutDashboard, end: true },
  { to: '/dashboard/client/new', label: 'New Project', icon: PlusCircle },
  { to: '/dashboard/client/nearby', label: 'Nearby', icon: MapPin },
];

const ClientDashboardLayout = () => (
  <DashboardLayout sidebarLinks={CLIENT_SIDEBAR_LINKS} title="Client Dashboard" />
);

export default ClientDashboardLayout;
