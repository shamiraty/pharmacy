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
  isLoading?: boolean;
}

export default function Topbar({ collapsed, setMobileMenuOpen, isLoading = false }: TopbarProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial setup
    setCurrentTime(new Date());
    setUser(getUserSession());
    const initialDarkMode = getDarkMode();
    setDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Timer
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Click outside handler
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
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    Swal.fire({
      title: newDarkMode ? 'Dark Mode Activated' : 'Light Mode Activated',
      text: newDarkMode ? 'Dark theme is now active' : 'Light theme is now active',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className={`fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out ${collapsed ? 'left-20' : 'left-0 lg:left-64'
      }`}>
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 h-16 px-6 py-2">
        <div className="flex items-center justify-between h-full">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Search Bar - Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 pl-10 pr-4 py-2 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
            {/* Time Display - Hidden on mobile */}
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {currentTime ? format(currentTime, 'EEEE, MMM do') : ''}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentTime ? format(currentTime, 'h:mm a') : ''}
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleDarkModeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-fadeIn z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                  </div>
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No new notifications
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold shadow-sm">
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
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-fadeIn z-50 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        router.push('/dashboard/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        router.push('/dashboard/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
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

        {/* Loading/Decoration Line */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-50 dark:bg-gray-800 overflow-hidden">
          <div className={`h-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 w-full origin-left ${isLoading ? 'animate-loading-bar' : ''
            }`} />
        </div>
      </div>
    </div>
  );
}
