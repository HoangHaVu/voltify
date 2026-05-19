import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import type { UserRole } from './services/auth';
import CustomerLandingPage from './pages/CustomerLandingPage';
import Login from './pages/Login';
import Configurator from './pages/Configurator';

import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';

import LeadDetailsPage from './pages/LeadDetailsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CompletedOrdersPage from './pages/CompletedOrdersPage';
import MessagesPage from './pages/MessagesPage';
import CalendarPage from './pages/CalendarPage';
import TeamPage from './pages/TeamPage';
import LandingPage from './pages/LandingPage';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import PricingPage from './pages/PricingPage';
import BetaSignupPage from './pages/BetaSignupPage';
import AGB from './pages/AGB';

/** Alle Rollen, die Admin-Bereich Zugriff haben */
const ADMIN_ROLES: UserRole[] = [
  'owner', 'installer', 'vertrieb', 'projektleiter', 'monteur', 'backoffice', 'super_employee',
];

/** Rollen, die Leads sehen dürfen */
const LEAD_ROLES: UserRole[] = ['owner', 'vertrieb', 'super_employee', 'installer'];

/** Rollen, die Projekte sehen dürfen */
const PROJECT_ROLES: UserRole[] = [
  'owner', 'installer', 'vertrieb', 'projektleiter', 'monteur', 'backoffice', 'super_employee',
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/demo" element={<CustomerLandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/beta" replace />} />
      <Route path="/konfigurator" element={<Configurator />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* Owner Settings — only accessible to owner */}
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      {/* Lead Details */}
      <Route
        path="/lead/:id"
        element={
          <ProtectedRoute allowedRoles={LEAD_ROLES}>
            <LeadDetailsPage />
          </ProtectedRoute>
        }
      />
      {/* Project Details */}
      <Route
        path="/project/:id"
        element={
          <ProtectedRoute allowedRoles={PROJECT_ROLES}>
            <ProjectDetailsPage />
          </ProtectedRoute>
        }
      />
      {/* Completed Orders List */}
      <Route
        path="/admin/completed"
        element={
          <ProtectedRoute allowedRoles={['owner', 'backoffice', 'super_employee']}>
            <CompletedOrdersPage />
          </ProtectedRoute>
        }
      />
      {/* Messages & Calendar */}
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/calendar"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/team"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route path="/preise" element={<PricingPage />} />
      <Route path="/beta" element={<BetaSignupPage />} />
      <Route path="/agb" element={<AGB />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="/impressum" element={<Impressum />} />
    </Routes>
  );
}
