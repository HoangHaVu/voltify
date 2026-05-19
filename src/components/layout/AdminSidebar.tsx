import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, FileText, Settings, HelpCircle,
  Zap, LogOut, Percent, LayoutGrid, Calendar, MessageSquare,
  Users, Receipt, FolderCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../services/auth';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  tab?: string; // Tab-ID für /admin Seite
}

// ── Navigation pro Rolle ──────────────────────────────────────────────

const OWNER_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', tab: 'dashboard' },
  { id: 'pipeline', label: 'Pipeline', icon: BarChart3, path: '/admin', tab: 'pipeline' },
  { id: 'projects', label: 'Projekte', icon: LayoutGrid, path: '/admin', tab: 'projects' },
  { id: 'messages', label: 'Nachrichten', icon: MessageSquare, path: '/admin/messages' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, path: '/admin/calendar' },
  { id: 'completed', label: 'Abgeschlossen', icon: FolderCheck, path: '/admin/completed' },
  { id: 'discounts', label: 'Rabatte', icon: Percent, path: '/admin', tab: 'discounts' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/admin', tab: 'reports' },
  { id: 'team', label: 'Team', icon: Users, path: '/admin/team' },
];

const SUPER_EMPLOYEE_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', tab: 'dashboard' },
  { id: 'pipeline', label: 'Pipeline', icon: BarChart3, path: '/admin', tab: 'pipeline' },
  { id: 'projects', label: 'Projekte', icon: LayoutGrid, path: '/admin', tab: 'projects' },
  { id: 'messages', label: 'Nachrichten', icon: MessageSquare, path: '/admin/messages' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, path: '/admin/calendar' },
];

const VERTRIEB_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', tab: 'dashboard' },
  { id: 'pipeline', label: 'Pipeline', icon: BarChart3, path: '/admin', tab: 'pipeline' },
  { id: 'projects', label: 'Projekte', icon: LayoutGrid, path: '/admin', tab: 'projects' },
  { id: 'messages', label: 'Nachrichten', icon: MessageSquare, path: '/admin/messages' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, path: '/admin/calendar' },
];

const PROJEKTLEITER_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', tab: 'dashboard' },
  { id: 'projects', label: 'Projekte', icon: LayoutGrid, path: '/admin', tab: 'projects' },
  { id: 'messages', label: 'Nachrichten', icon: MessageSquare, path: '/admin/messages' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, path: '/admin/calendar' },
];

const MONTEUR_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', tab: 'dashboard' },
  { id: 'projects', label: 'Projekte', icon: LayoutGrid, path: '/admin', tab: 'projects' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, path: '/admin/calendar' },
];

const BACKOFFICE_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', tab: 'dashboard' },
  { id: 'pipeline', label: 'Pipeline', icon: BarChart3, path: '/admin', tab: 'pipeline' },
  { id: 'projects', label: 'Projekte', icon: LayoutGrid, path: '/admin', tab: 'projects' },
  { id: 'messages', label: 'Nachrichten', icon: MessageSquare, path: '/admin/messages' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, path: '/admin/calendar' },
  { id: 'completed', label: 'Abgeschlossen', icon: FolderCheck, path: '/admin/completed' },
];

const INSTALLER_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', tab: 'dashboard' },
  { id: 'pipeline', label: 'Pipeline', icon: BarChart3, path: '/admin', tab: 'pipeline' },
  { id: 'projects', label: 'Projekte', icon: LayoutGrid, path: '/admin', tab: 'projects' },
  { id: 'messages', label: 'Nachrichten', icon: MessageSquare, path: '/admin/messages' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, path: '/admin/calendar' },
];

function getNavForRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'owner': return OWNER_NAV;
    case 'super_employee': return SUPER_EMPLOYEE_NAV;
    case 'vertrieb': return VERTRIEB_NAV;
    case 'projektleiter': return PROJEKTLEITER_NAV;
    case 'monteur': return MONTEUR_NAV;
    case 'backoffice': return BACKOFFICE_NAV;
    case 'installer': return INSTALLER_NAV;
    case 'customer': return [];
    default: return INSTALLER_NAV;
  }
}

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Inhaber',
  super_employee: 'Super-Mitarbeiter',
  vertrieb: 'Vertrieb',
  projektleiter: 'Projektleiter',
  monteur: 'Monteur',
  backoffice: 'Backoffice',
  installer: 'Installateur',
  customer: 'Kunde',
};

// ── Component ─────────────────────────────────────────────────────────

interface AdminSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { user, logout, isOwner } = useAuth();
  const location = useLocation();
  const sidebarNav = user ? getNavForRole(user.role) : [];
  const isSettingsPage = location.pathname === '/admin/settings';

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-[#0F0F0F] border-r border-white/5">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#1A3A5C]" fill="currentColor" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">Voltify</span>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
        {sidebarNav.map((item) => {
          const Icon = item.icon;
          const isExternal = item.path !== '/admin';
          const active = !isSettingsPage && activeTab === item.id;

          // Externe Seiten (Messages, Calendar, etc.) immer als Link rendern
          if (isExternal) {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive ? 'bg-[#1A3A5C] text-white font-medium' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          }

          // Dashboard-Tabs: Button wenn onTabChange vorhanden, sonst Link
          return onTabChange ? (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                active ? 'bg-[#1A3A5C] text-white font-medium' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          ) : (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                active ? 'bg-[#1A3A5C] text-white font-medium' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-4 pb-2 flex flex-col gap-1">
        {isOwner && (
          <Link
            to="/admin/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              isSettingsPage ? 'bg-[#1A3A5C] text-white font-medium' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-[18px] h-[18px]" />
            Settings
          </Link>
        )}
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <HelpCircle className="w-[18px] h-[18px]" />
          Help
        </button>
      </div>

      {/* User */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-[#1A3A5C] flex items-center justify-center text-xs font-bold text-[#F5A623]">
            {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'VA'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Admin'}</p>
            <p className="text-xs text-gray-600">{user ? ROLE_LABELS[user.role] : 'User'}</p>
          </div>
          <button
            onClick={async () => { await logout(); window.location.href = '/login'; }}
            className="text-gray-500 hover:text-white transition-colors"
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
