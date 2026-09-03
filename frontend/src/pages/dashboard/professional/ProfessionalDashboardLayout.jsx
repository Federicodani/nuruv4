import { LayoutDashboard, UserCog, Images, LayoutGrid, Briefcase, MapPin, CheckSquare } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const SIDEBAR_LINKS = [
  { to: '/dashboard/professional', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/professional/profile', label: 'Edit Profile', icon: UserCog },
  { to: '/dashboard/professional/portfolio', label: 'Portfolio', icon: Images },
  { to: '/dashboard/professional/projects', label: 'My Projects', icon: LayoutGrid },
  { to: '/dashboard/professional/assigned', label: 'Assigned Projects', icon: Briefcase },
  { to: '/dashboard/professional/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/dashboard/professional/location', label: 'My Location', icon: MapPin },
];

const ProfessionalDashboardLayout = () => {
  return <DashboardLayout sidebarLinks={SIDEBAR_LINKS} title="Professional Dashboard" />;
};

export default ProfessionalDashboardLayout;
