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
  loadingPath: string | null;
  setLoadingPath: (path: string | null) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  loadingPath,
  setLoadingPath
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Reset loading state and close mobile menu when navigation completes
  useEffect(() => {
    if (loadingPath && pathname === loadingPath) {
      setLoadingPath(null);
      if (mobileOpen) {
        setMobileOpen(false);
      }
    }
  }, [pathname, loadingPath, mobileOpen, setLoadingPath, setMobileOpen]);

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
                        // Do NOT close mobile menu here. Wait for useEffect on pathname change.
                        router.push(item.href);
                      }
                    }}
                    disabled={loadingPath !== null}
                    className={`flex w-full items-center p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${pathname === item.href
                      ? 'bg-gradient-to-r from-white/20 to-white/5 text-white shadow-lg border border-white/10'
                      : 'text-primary-100 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {/* Active Indicator */}
                    {pathname === item.href && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                    )}

                    {loadingPath === item.href ? (
                      <div className="flex items-center justify-center w-full">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="font-medium animate-pulse">Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center w-full">
                        <Icon
                          className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${pathname === item.href ? 'text-white' : 'text-primary-200 group-hover:text-white'
                            }`}
                        />
                        {!collapsed && (
                          <span className="font-medium flex-1 text-left">{item.title}</span>
                        )}
                        {pathname === item.href && !collapsed && (
                          <ChevronRight className="w-4 h-4 ml-auto text-white" />
                        )}
                      </div>
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
