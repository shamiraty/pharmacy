'use client';

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        loadingPath={loadingPath}
        setLoadingPath={setLoadingPath}
      />
      <Topbar
        collapsed={collapsed}
        setMobileMenuOpen={setMobileMenuOpen}
        isLoading={!!loadingPath}
      />
      <main className={`transition-all duration-300 ease-in-out pt-16 min-h-screen ${collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
