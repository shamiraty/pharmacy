'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { format } from 'date-fns';
import { getUserSession, clearUserSession } from '@/lib/auth';
import { getDarkMode, setDarkMode as saveDarkMode } from '@/lib/theme';
import Swal from 'sweetalert2';

interface TopbarProps {
  collapsed: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Topbar({ collapsed, setMobileMenuOpen }: TopbarProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial time on client side only
    setCurrentTime(new Date());
    setUser(getUserSession());
    setDarkMode(getDarkMode());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Handle click outside to close dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout',
    });

    if (result.isConfirmed) {
      clearUserSession();
      await Swal.fire({
        title: 'Logged out!',
        text: 'You have been logged out successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      router.push('/login');
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveDarkMode(newDarkMode);

    Swal.fire({
      title: newDarkMode ? 'Dark Mode Activated' : 'Light Mode Activated',
      text: newDarkMode ? 'Dark theme is now active' : 'Light theme is now active',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const notifications = [
    {
      id: 1,
      message: '5 medicines expiring soon',
      time: '2 min ago',
      type: 'warning',
    },
    {
      id: 2,
      message: 'Low stock alert for Panadol',
      time: '10 min ago',
      type: 'error',
    },
    {
      id: 3,
      message: 'New sale completed',
      time: '15 min ago',
      type: 'success',
    },
  ];

  return (
    <div className={`h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 z-30 shadow-sm transition-all duration-300 ${collapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
      }`}>
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left Section - Search */}
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search medicines, sales, invoices..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Current Time */}
          <div className="hidden md:flex flex-col items-end">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {currentTime ? format(currentTime, 'HH:mm:ss') : '--:--:--'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentTime ? format(currentTime, 'EEE, MMM dd, yyyy') : 'Loading...'}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={handleDarkModeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative group"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
            <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              Toggle theme
            </div>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-fadeIn z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${notif.type === 'warning'
                            ? 'bg-yellow-500'
                            : notif.type === 'error'
                              ? 'bg-red-500'
                              : 'bg-green-500'
                            }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {user?.full_name || 'Admin'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || 'Administrator'}
                </div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-fadeIn z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push('/dashboard/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/dashboard/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
