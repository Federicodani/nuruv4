import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFoundPage from './pages/NotFoundPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import ProfessionalsPage from './pages/professionals/ProfessionalsPage';
import ProfessionalProfilePage from './pages/professionals/ProfessionalProfilePage';

import MaterialsPage from './pages/materials/MaterialsPage';
import ProductDetailPage from './pages/materials/ProductDetailPage';
import StorePage from './pages/materials/StorePage';

import JobsPage from './pages/jobs/JobsPage';

import NuruElectricalsPage from './pages/nuru/NuruElectricalsPage';

// New pages
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import CostEstimatorPage from './pages/estimators/CostEstimatorPage';
import MaterialEstimatorPage from './pages/estimators/MaterialEstimatorPage';

// Professional dashboard
import ProfessionalDashboardLayout from './pages/dashboard/professional/ProfessionalDashboardLayout';
import ProfessionalDashboardHome from './pages/dashboard/professional/ProfessionalDashboardHome';
import ProfessionalEditProfile from './pages/dashboard/professional/ProfessionalEditProfile';
import ProfessionalPortfolio from './pages/dashboard/professional/ProfessionalPortfolio';
import ProfessionalProjects from './pages/dashboard/professional/ProfessionalProjects';
import AssignedProjectsPage from './pages/dashboard/professional/AssignedProjectsPage';
import ProfessionalLocationPage from './pages/dashboard/professional/ProfessionalLocationPage';
import ProfessionalTasksPage from './pages/dashboard/professional/ProfessionalTasksPage';

// Store owner dashboard
import StoreDashboardLayout from './pages/dashboard/store/StoreDashboardLayout';
import StoreDashboardHome from './pages/dashboard/store/StoreDashboardHome';
import StoreProfilePage from './pages/dashboard/store/StoreProfilePage';
import StoreProductsPage from './pages/dashboard/store/StoreProductsPage';
import StoreLocationPage from './pages/dashboard/store/StoreLocationPage';

// Client dashboard (live construction projects)
import ClientDashboardLayout from './pages/dashboard/client/ClientDashboardLayout';
import ClientDashboardHome from './pages/dashboard/client/ClientDashboardHome';
import ProjectFormPage from './pages/dashboard/client/ProjectFormPage';
import ClientProjectDetailPage from './pages/dashboard/client/ProjectDetailPage';
import NearbyPage from './pages/dashboard/client/NearbyPage';

// Admin dashboard
import AdminDashboardLayout from './pages/dashboard/admin/AdminDashboardLayout';
import AdminOverviewPage from './pages/dashboard/admin/AdminOverviewPage';
import AdminUsersPage from './pages/dashboard/admin/AdminUsersPage';
import AdminProfessionalsPage from './pages/dashboard/admin/AdminProfessionalsPage';
import AdminStoresPage from './pages/dashboard/admin/AdminStoresPage';
import AdminProductsPage from './pages/dashboard/admin/AdminProductsPage';
import AdminJobsPage from './pages/dashboard/admin/AdminJobsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public site routes wrapped in MainLayout (navbar + footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/professionals" element={<ProfessionalsPage />} />
          <Route path="/professionals/:id" element={<ProfessionalProfilePage />} />

          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<ProductDetailPage />} />
          <Route path="/stores/:id" element={<StorePage />} />

          <Route path="/jobs" element={<JobsPage />} />

          <Route path="/nuru-electricals" element={<NuruElectricalsPage />} />

          {/* Construction Inspiration */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          {/* Planning Tools */}
          <Route path="/cost-estimator" element={<CostEstimatorPage />} />
          <Route path="/material-estimator" element={<MaterialEstimatorPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Professional dashboard (protected, role: professional) */}
        <Route
          path="/dashboard/professional"
          element={
            <ProtectedRoute allowedRoles={['professional']}>
              <ProfessionalDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfessionalDashboardHome />} />
          <Route path="profile" element={<ProfessionalEditProfile />} />
          <Route path="portfolio" element={<ProfessionalPortfolio />} />
          <Route path="projects" element={<ProfessionalProjects />} />
          <Route path="assigned" element={<AssignedProjectsPage />} />
          <Route path="tasks" element={<ProfessionalTasksPage />} />
          <Route path="location" element={<ProfessionalLocationPage />} />
        </Route>

        {/* Store owner dashboard (protected, role: store_owner) */}
        <Route
          path="/dashboard/store"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StoreDashboardHome />} />
          <Route path="profile" element={<StoreProfilePage />} />
          <Route path="products" element={<StoreProductsPage />} />
          <Route path="location" element={<StoreLocationPage />} />
        </Route>

        {/* Client dashboard — live construction projects */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute>
              <ClientDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClientDashboardHome />} />
          <Route path="new" element={<ProjectFormPage />} />
          <Route path="projects/:id" element={<ClientProjectDetailPage />} />
          <Route path="projects/:id/edit" element={<ProjectFormPage />} />
          <Route path="nearby" element={<NearbyPage />} />
        </Route>

        {/* Admin dashboard (protected, role: admin) */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="professionals" element={<AdminProfessionalsPage />} />
          <Route path="stores" element={<AdminStoresPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
