import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  MapIcon,
  Cog6ToothIcon,
  UsersIcon,
  ShieldCheckIcon,
  CloudIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
    roles: ['government', 'ngo', 'researcher', 'field_worker', 'admin']
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderIcon,
    roles: ['government', 'ngo', 'researcher', 'field_worker', 'admin'],
    children: [
      {
        name: 'All Projects',
        href: '/projects',
        icon: FolderIcon,
        roles: ['government', 'ngo', 'researcher', 'field_worker', 'admin']
      },
      {
        name: 'My Projects',
        href: '/projects/my',
        icon: UserGroupIcon,
        roles: ['ngo', 'researcher', 'field_worker']
      },
      {
        name: 'Create Project',
        href: '/projects/create',
        icon: BuildingOfficeIcon,
        roles: ['ngo', 'researcher']
      }
    ]
  },
  {
    name: 'MRV Reports',
    href: '/mrv-reports',
    icon: DocumentTextIcon,
    roles: ['government', 'ngo', 'researcher', 'admin'],
    children: [
      {
        name: 'All Reports',
        href: '/mrv-reports',
        icon: DocumentTextIcon,
        roles: ['government', 'ngo', 'researcher', 'admin']
      },
      {
        name: 'Submit Report',
        href: '/mrv-reports/submit',
        icon: ClipboardDocumentListIcon,
        roles: ['ngo', 'researcher']
      },
      {
        name: 'Verify Reports',
        href: '/mrv-reports/verify',
        icon: ShieldCheckIcon,
        roles: ['government', 'admin']
      }
    ]
  },
  {
    name: 'Carbon Credits',
    href: '/carbon-credits',
    icon: CurrencyDollarIcon,
    roles: ['government', 'ngo', 'admin'],
    children: [
      {
        name: 'Credit Registry',
        href: '/carbon-credits',
        icon: BanknotesIcon,
        roles: ['government', 'ngo', 'admin']
      },
      {
        name: 'Issue Credits',
        href: '/carbon-credits/issue',
        icon: CurrencyDollarIcon,
        roles: ['government', 'admin']
      },
      {
        name: 'Transfer Credits',
        href: '/carbon-credits/transfer',
        icon: BanknotesIcon,
        roles: ['ngo', 'admin']
      }
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    roles: ['government', 'ngo', 'researcher', 'admin'],
    children: [
      {
        name: 'Overview',
        href: '/analytics',
        icon: ChartBarIcon,
        roles: ['government', 'ngo', 'researcher', 'admin']
      },
      {
        name: 'Carbon Impact',
        href: '/analytics/carbon',
        icon: GlobeAltIcon,
        roles: ['government', 'ngo', 'researcher', 'admin']
      },
      {
        name: 'Project Performance',
        href: '/analytics/projects',
        icon: FolderIcon,
        roles: ['government', 'ngo', 'researcher', 'admin']
      }
    ]
  },
  {
    name: 'Field Data',
    href: '/field-data',
    icon: MapIcon,
    roles: ['field_worker', 'ngo', 'researcher', 'admin'],
    children: [
      {
        name: 'Data Collection',
        href: '/field-data/collect',
        icon: DevicePhoneMobileIcon,
        roles: ['field_worker']
      },
      {
        name: 'Sensor Data',
        href: '/field-data/sensors',
        icon: CpuChipIcon,
        roles: ['field_worker', 'ngo', 'researcher', 'admin']
      },
      {
        name: 'Satellite Data',
        href: '/field-data/satellite',
        icon: CloudIcon,
        roles: ['ngo', 'researcher', 'admin']
      }
    ]
  },
  {
    name: 'User Management',
    href: '/users',
    icon: UsersIcon,
    roles: ['admin'],
    children: [
      {
        name: 'All Users',
        href: '/users',
        icon: UsersIcon,
        roles: ['admin']
      },
      {
        name: 'User Roles',
        href: '/users/roles',
        icon: ShieldCheckIcon,
        roles: ['admin']
      }
    ]
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    roles: ['government', 'ngo', 'researcher', 'field_worker', 'admin']
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const hasAccess = (item: NavigationItem): boolean => {
    return item.roles.includes(user?.role || '');
  };

  const isActive = (href: string): boolean => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    if (!hasAccess(item)) return null;

    const isItemActive = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const hasAccessibleChildren = hasChildren && item.children!.some(child => hasAccess(child));

    return (
      <div key={item.name}>
        <Link
          to={item.href}
          className={`sidebar-item ${
            isItemActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
          } ${level > 0 ? 'ml-6' : ''}`}
          onClick={onClose}
        >
          <item.icon className="h-5 w-5 mr-3" />
          {item.name}
        </Link>
        
        {hasAccessibleChildren && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BC</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  Blue Carbon MRV
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map(item => renderNavigationItem(item))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Blue Carbon MRV Platform</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

