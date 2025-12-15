'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  BarChart3,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  ClipboardList,
  FileText,
  Loader2,
  Database,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Medicines',
    icon: Pill,
    href: '/dashboard/medicines',
  },
  {
    title: 'Sales',
    icon: ShoppingCart,
    href: '/dashboard/sales',
  },
  {
    title: 'Invoices',
    icon: FileText,
    href: '/dashboard/invoices',
  },
  {
    title: 'Purchase',
    icon: Package,
    href: '/dashboard/purchase',
  },
  {
    title: 'Medicine Analytics',
    icon: Activity,
    href: '/dashboard/medicine-analytics',
  },
  {
    title: 'Sales Analytics',
    icon: BarChart3,
    href: '/dashboard/sales-analytics',
  },
  {
    title: 'Inventory',
    icon: ClipboardList,
    href: '/dashboard/inventory',
  },
  {
    title: 'Users',
    icon: Users,
    href: '/dashboard/users',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
  {
    title: 'Backup',
    icon: Database,
    href: '/dashboard/backup',
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Reset loading state when pathname changes
  useEffect(() => {
    if (loadingPath && pathname === loadingPath) {
      setLoadingPath(null);
    }
  }, [pathname, loadingPath]);

  // Trigger auto-backup on mount
  useEffect(() => {
    const triggerAutoBackup = async () => {
      try {
        await fetch('/api/backup/auto', { method: 'POST' });
      } catch (error) {
        console.error('Auto backup trigger failed:', error);
      }
    };
    triggerAutoBackup();
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${collapsed ? 'w-20' : 'w-64'
          } bg-gradient-to-b from-primary-700 to-primary-800 text-white h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out shadow-2xl z-40 flex flex-col
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-primary-600 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2 animate-fadeIn">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  PharmaCare
                </h1>
                <p className="text-xs text-primary-100">Management System</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-primary-600 transition-colors duration-200 ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const isLoading = loadingPath === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (pathname !== item.href && !loadingPath) {
                        setLoadingPath(item.href);
                        setMobileOpen(false);
                        router.push(item.href);
                      }
                    }}
                    disabled={isLoading}
                    className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200
                    ${isActive
                        ? 'bg-white/20 shadow-lg scale-105 backdrop-blur-sm'
                        : 'hover:bg-white/10 hover:scale-102'
                      }
                    ${isLoading ? 'opacity-75 cursor-wait' : 'cursor-pointer'}
                    group relative
                  `}
                  >
                    {isLoading ? (
                      <Loader2
                        className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'
                          } flex-shrink-0 text-white animate-spin`}
                      />
                    ) : (
                      <Icon
                        className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'
                          } flex-shrink-0 ${isActive ? 'text-white' : 'text-primary-100'
                          } group-hover:text-white transition-colors`}
                      />
                    )}
                    {!collapsed && (
                      <span
                        className={`text-sm font-medium ${isActive ? 'text-white' : 'text-primary-50'
                          } group-hover:text-white transition-colors`}
                      >
                        {item.title}
                      </span>
                    )}
                    {isActive && !isLoading && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-primary-600 animate-fadeIn">
            <div className="text-xs text-primary-100 text-center">
              © 2024 PharmaCare
              <br />
              Version 1.0.0
            </div>
          </div>
        )}
      </div>
    </>
  );
}
