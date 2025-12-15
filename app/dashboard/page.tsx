'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  Pill,
  Calendar,
  TrendingDown,
  Clock,
  Activity,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-14 h-14 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for Today's Stats */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-5 h-24"></div>
            <div className="bg-gray-50 rounded-xl p-5 h-24"></div>
          </div>
        </div>

        {/* Skeleton for Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-[400px] animate-pulse"></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-[400px] animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Today's Stats - Special Highlight */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Today's Statistics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Today's Sales</p>
            <p className="text-3xl font-bold text-blue-600">{stats.todaySales || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Transactions</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              TZS {(stats.todayRevenue || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`TZS ${(stats.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
          subtext="All time revenue"
        />
        <StatCard
          title="Total Sales"
          value={(stats.totalSales || 0).toLocaleString()}
          icon={ShoppingCart}
          color="bg-blue-500"
          subtext={`${stats.todaySales || 0} today`}
        />
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines || 0}
          icon={Pill}
          color="bg-purple-500"
          subtext="In inventory"
        />
        <StatCard
          title="Alerts"
          value={(stats.lowStock || 0) + (stats.expiringSoon || 0)}
          icon={AlertTriangle}
          color="bg-red-500"
          subtext={`${stats.lowStock || 0} low stock, ${stats.expiringSoon || 0} expiring soon`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            Sales Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.salesTrend || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US')}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-6 h-6 mr-2 text-blue-600" />
            Top Selling Medicines
          </h3>
          <div className="space-y-3">
            {(stats.topSelling || []).slice(0, 5).map((medicine: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{medicine.name}</p>
                    <p className="text-xs text-gray-500">
                      {medicine.total_sold} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    TZS {(medicine.total_revenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!stats.topSelling || stats.topSelling.length === 0) && (
              <p className="text-center text-gray-500 py-8">No sales data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
