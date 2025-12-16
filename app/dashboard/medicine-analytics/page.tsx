'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MedicineAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    expired: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);

  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [stockTrendData, setStockTrendData] = useState<any[]>([]);
  const [expiringMedicines, setExpiringMedicines] = useState<any[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
  const [deadStock, setDeadStock] = useState<any[]>([]);
  const [topMovers, setTopMovers] = useState<any[]>([]);
  const [mostProfitable, setMostProfitable] = useState<any[]>([]);

  // Smart Analytics State
  const [abcData, setAbcData] = useState<any>({ a: [], b: [], c: [] });
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [reorderSuggestions, setReorderSuggestions] = useState<any[]>([]);
  const [smartInsights, setSmartInsights] = useState<any>({ critical: [], overstock: [] });

  const [showExportModal, setShowExportModal] = useState(false);

  // Default to last 30 days for initial view? Or all time?
  // Let's default to "All Time" (empty) but allow setting.
  const [dateFilter, setDateFilter] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFilter.start) params.append('salesStartDate', dateFilter.start);
      if (dateFilter.end) params.append('salesEndDate', dateFilter.end);

      const response = await fetch(`/api/medicines?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        const medicines = data.data;

        // Calculate analytics
        const total = medicines.length;
        const lowStock = medicines.filter(
          (m: any) => m.quantity_in_stock <= m.reorder_level
        ).length;
        const expiringSoon = medicines.filter((m: any) => {
          const expiryDate = new Date(m.expiry_date);
          const today = new Date();
          const daysToExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
          );
          return daysToExpiry > 0 && daysToExpiry <= 30;
        }).length;
        const expired = medicines.filter(
          (m: any) => new Date(m.expiry_date) < new Date()
        ).length;
        const totalValue = medicines.reduce(
          (sum: number, m: any) =>
            sum + (m.quantity_in_stock * m.selling_price_full || 0),
          0
        );

        setAnalytics({
          totalMedicines: total,
          lowStock,
          expiringSoon,
          expired,
          totalValue,
        });

        // Deep Analysis Calculations

        // 1. Dead Stock (No sales in period, but has stock) - RISK
        const dead = medicines
          .filter((m: any) => (m.total_sold_qty || 0) === 0 && m.quantity_in_stock > 0)
          .map((m: any) => ({
            ...m,
            locked_capital: m.quantity_in_stock * (m.purchase_price_per_carton && m.units_per_carton ? (m.purchase_price_per_carton / m.units_per_carton) : 0)
          }))
          .sort((a: any, b: any) => b.locked_capital - a.locked_capital);
        setDeadStock(dead.slice(0, 10));

        // 2. Top Movers (Highest Quantity Sold)
        const movers = [...medicines]
          .filter((m: any) => (m.total_sold_qty || 0) > 0)
          .sort((a: any, b: any) => (b.total_sold_qty || 0) - (a.total_sold_qty || 0));
        setTopMovers(movers.slice(0, 5));

        // 3. Most Profitable (Revenue - Cost)
        const profitable = medicines.map((m: any) => {
          const costPerUnit = (m.purchase_price_per_carton && m.units_per_carton) ? (m.purchase_price_per_carton / m.units_per_carton) : 0;
          const totalCost = (m.total_sold_qty || 0) * costPerUnit;
          const revenue = m.total_sold_value || 0;
          return { ...m, estimated_profit: revenue - totalCost };
        })
          .filter((m: any) => m.estimated_profit > 0)
          .sort((a: any, b: any) => b.estimated_profit - a.estimated_profit);
        setMostProfitable(profitable.slice(0, 5));

        // SMART ANALYTICS (Forecasting & ABC)
        const start = new Date(dateFilter.start);
        const end = new Date(dateFilter.end);
        const daysPeriod = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

        // Forecasting
        const forecastList = medicines.map((m: any) => {
          const sold = m.total_sold_qty || 0;
          const dailyRate = sold / daysPeriod; // Avg sales per day
          const daysRemaining = dailyRate > 0 ? (m.quantity_in_stock / dailyRate) : 999;
          const targetStock = dailyRate * 30; // Target 30 days stock
          const suggestedReorder = Math.max(0, Math.ceil(targetStock - m.quantity_in_stock));

          return {
            ...m,
            dailyRate,
            daysRemaining,
            suggestedReorder,
            status: daysRemaining < 7 ? 'Critical' : daysRemaining < 30 ? 'Low' : 'Good'
          };
        });
        setForecasts(forecastList);

        const critical = forecastList.filter((f: any) => f.daysRemaining < 7 && f.dailyRate > 0).sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);
        const overstock = forecastList.filter((f: any) => f.daysRemaining > 90 && f.quantity_in_stock > 0).sort((a: any, b: any) => b.daysRemaining - a.daysRemaining);
        const reorder = forecastList.filter((f: any) => f.suggestedReorder > 0).sort((a: any, b: any) => b.suggestedReorder - a.suggestedReorder);

        setSmartInsights({ critical, overstock });
        setReorderSuggestions(reorder.slice(0, 20));

        // ABC Analysis (Pareto - Based on Revenue)
        const sortedByRev = [...medicines].sort((a: any, b: any) => (b.total_sold_value || 0) - (a.total_sold_value || 0));
        const totalRevenue = sortedByRev.reduce((sum: number, m: any) => sum + (m.total_sold_value || 0), 0);

        let cumulative = 0;
        const abc = { a: [] as any[], b: [] as any[], c: [] as any[] };

        sortedByRev.forEach((m: any) => {
          const rev = m.total_sold_value || 0;
          if (rev > 0) {
            cumulative += rev;
            const percentage = (cumulative / totalRevenue) * 100;

            if (percentage <= 70) abc.a.push(m); // Class A: Top 70% Revenue
            else if (percentage <= 90) abc.b.push(m); // Class B: Next 20%
            else abc.c.push(m); // Class C: Bottom 10%
          } else {
            abc.c.push(m); // No sales = C
          }
        });
        setAbcData(abc);


        // Category distribution
        const categoryMap: any = {};
        medicines.forEach((m: any) => {
          const cat = m.category_name || 'Uncategorized';
          if (!categoryMap[cat]) {
            categoryMap[cat] = { name: cat, value: 0, count: 0 };
          }
          categoryMap[cat].value += m.quantity_in_stock;
          categoryMap[cat].count += 1;
        });
        setCategoryData(Object.values(categoryMap));

        // Stock trend (mock data - in real app, this would be historical)
        setStockTrendData([
          { month: 'Jan', stock: 450 },
          { month: 'Feb', stock: 520 },
          { month: 'Mar', stock: 480 },
          { month: 'Apr', stock: 610 },
          { month: 'May', stock: 550 },
          { month: 'Jun', stock: 670 },
        ]);

        // Expiring medicines
        const expiring = medicines
          .filter((m: any) => {
            const expiryDate = new Date(m.expiry_date);
            const today = new Date();
            const daysToExpiry = Math.ceil(
              (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
            );
            return daysToExpiry > 0 && daysToExpiry <= 30;
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
          );
        setExpiringMedicines(expiring);

        // Low stock medicines
        const lowStockList = medicines
          .filter((m: any) => m.quantity_in_stock <= m.reorder_level)
          .sort((a: any, b: any) => a.quantity_in_stock - b.quantity_in_stock);
        setLowStockMedicines(lowStockList);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Medicines', analytics.totalMedicines],
      ['Low Stock Items', analytics.lowStock],
      ['Expiring Soon', analytics.expiringSoon],
      ['Expired Items', analytics.expired],
      ['Total Inventory Value', `TZS ${analytics.totalValue.toLocaleString()}`],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Category distribution
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Distribution');

    // Expiring medicines
    if (expiringMedicines.length > 0) {
      const expiringSheet = XLSX.utils.json_to_sheet(
        expiringMedicines.map((m) => ({
          Name: m.name,
          Category: m.category_name,
          'Expiry Date': new Date(m.expiry_date).toLocaleDateString(),
          Stock: m.quantity_in_stock,
        }))
      );
      XLSX.utils.book_append_sheet(wb, expiringSheet, 'Expiring Soon');
    }

    // Low stock medicines
    if (lowStockMedicines.length > 0) {
      const lowStockSheet = XLSX.utils.json_to_sheet(
        lowStockMedicines.map((m) => ({
          Name: m.name,
          Category: m.category_name,
          'Current Stock': m.quantity_in_stock,
          'Reorder Level': m.reorder_level,
        }))
      );
      XLSX.utils.book_append_sheet(wb, lowStockSheet, 'Low Stock');
    }

    XLSX.writeFile(wb, `Medicine_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Analytics exported to Excel successfully',
      timer: 2000,
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Medicine Analytics Report', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

    // Summary Statistics
    doc.setFontSize(14);
    doc.text('Summary', 14, 35);

    const summaryData = [
      ['Total Medicines', analytics.totalMedicines.toString()],
      ['Low Stock Items', analytics.lowStock.toString()],
      ['Expiring Soon (30 days)', analytics.expiringSoon.toString()],
      ['Expired Items', analytics.expired.toString()],
      ['Total Inventory Value', `TZS ${analytics.totalValue.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
    });

    // Category Distribution
    if (categoryData.length > 0) {
      const finalY1 = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Category Distribution', 14, finalY1);

      autoTable(doc, {
        startY: finalY1 + 5,
        head: [['Category', 'Count', 'Total Stock']],
        body: categoryData.map(c => [c.name, c.count.toString(), c.value.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
      });
    }

    // Expiring Soon
    if (expiringMedicines.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Medicines Expiring Soon', 14, 15);

      autoTable(doc, {
        startY: 20,
        head: [['Medicine', 'Category', 'Expiry Date', 'Stock']],
        body: expiringMedicines.slice(0, 20).map(m => [
          m.name,
          m.category_name || 'N/A',
          new Date(m.expiry_date).toLocaleDateString(),
          m.quantity_in_stock.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
      });
    }

    // Low Stock
    if (lowStockMedicines.length > 0) {
      const finalY2 = (doc as any).lastAutoTable?.finalY || 150;
      if (finalY2 > 250) doc.addPage();

      doc.setFontSize(14);
      doc.text('Low Stock Medicines', 14, finalY2 > 250 ? 15 : finalY2 + 10);

      autoTable(doc, {
        startY: finalY2 > 250 ? 20 : finalY2 + 15,
        head: [['Medicine', 'Current Stock', 'Reorder Level']],
        body: lowStockMedicines.slice(0, 20).map(m => [
          m.name,
          m.quantity_in_stock.toString(),
          m.reorder_level.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
      });
    }

    doc.save(`Medicine_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Analytics exported to PDF successfully',
      timer: 2000,
    });
  };

  const exportToWord = () => {
    // Generate HTML content for Word
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Medicine Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #0ea5e9; text-align: center; }
          h2 { color: #374151; margin-top: 20px; border-bottom: 2px solid #0ea5e9; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0ea5e9; color: white; }
          .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .date { text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Medicine Analytics Report</h1>
        <p class="date">Generated on: ${new Date().toLocaleString()}</p>

        <div class="summary">
          <h2>Summary Statistics</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Medicines</td><td>${analytics.totalMedicines}</td></tr>
            <tr><td>Low Stock Items</td><td>${analytics.lowStock}</td></tr>
            <tr><td>Expiring Soon (30 days)</td><td>${analytics.expiringSoon}</td></tr>
            <tr><td>Expired Items</td><td>${analytics.expired}</td></tr>
            <tr><td>Total Inventory Value</td><td>TZS ${analytics.totalValue.toLocaleString()}</td></tr>
          </table>
        </div>

        <h2>Category Distribution</h2>
        <table>
          <tr><th>Category</th><th>Count</th><th>Total Stock</th></tr>
          ${categoryData.map(c => `
            <tr>
              <td>${c.name}</td>
              <td>${c.count}</td>
              <td>${c.value}</td>
            </tr>
          `).join('')}
        </table>

        ${expiringMedicines.length > 0 ? `
          <h2>Medicines Expiring Soon</h2>
          <table>
            <tr><th>Medicine</th><th>Category</th><th>Expiry Date</th><th>Stock</th></tr>
            ${expiringMedicines.slice(0, 20).map(m => `
              <tr>
                <td>${m.name}</td>
                <td>${m.category_name || 'N/A'}</td>
                <td>${new Date(m.expiry_date).toLocaleDateString()}</td>
                <td>${m.quantity_in_stock}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}

        ${lowStockMedicines.length > 0 ? `
          <h2>Low Stock Medicines</h2>
          <table>
            <tr><th>Medicine</th><th>Current Stock</th><th>Reorder Level</th></tr>
            ${lowStockMedicines.slice(0, 20).map(m => `
              <tr>
                <td>${m.name}</td>
                <td>${m.quantity_in_stock}</td>
                <td>${m.reorder_level}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Medicine_Analytics_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Analytics exported to Word successfully',
      timer: 2000,
    });
  };

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[400px]">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[400px]">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        </div>

        {/* Alerts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[300px]">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div
          className={`w-14 h-14 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}
        >
          <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicine Analytics</h1>
          <p className="text-gray-600 mt-1">
            Deep analysis of inventory performance
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                className="w-full sm:w-40 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                className="w-full sm:w-40 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
              />
            </div>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full sm:w-auto px-5 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center space-x-2 font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Medicines"
          value={analytics.totalMedicines}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Low Stock"
          value={analytics.lowStock}
          icon={AlertTriangle}
          color="bg-orange-500"
        />
        <StatCard
          title="Expiring Soon"
          value={analytics.expiringSoon}
          icon={Calendar}
          color="bg-yellow-500"
        />
        <StatCard
          title="Inventory Value"
          value={`TZS ${analytics.totalValue.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-green-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="stock"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Intelligence Section */}
      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Smart Intelligence</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 1. Critical Forecasts */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <h3 className="font-bold text-gray-900">Critical Stockouts</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Items predicted to run out within 7 days based on current sales rate.</p>
          <div className="space-y-3">
            {smartInsights.critical.length === 0 ? <p className="text-sm text-gray-400">No critical items to report.</p> :
              smartInsights.critical.slice(0, 5).map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-red-100">
                  <span className="text-sm font-medium truncate w-32 text-gray-800">{m.name}</span>
                  <span className="text-xs font-bold text-red-600">{m.daysRemaining === 999 ? '>1yr' : Math.round(m.daysRemaining) + ' days'} left</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* 2. Reorder Recommendations */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-bold text-gray-900">Suggested Reorders</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Recommended usage to cover next 30 days.</p>
          <div className="space-y-3">
            {reorderSuggestions.length === 0 ? <p className="text-sm text-gray-400">Inventory indicates sufficient stock levels.</p> :
              reorderSuggestions.slice(0, 5).map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-blue-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate w-32 text-gray-800">{m.name}</span>
                    <span className="text-[10px] text-gray-500">In Stock: {m.quantity_in_stock}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">+{m.suggestedReorder} units</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* 3. ABC Snapshot */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
            <h3 className="font-bold text-gray-900">ABC Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Revenue Concentration (80/20 Rule)</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Class A (Top 70% Rev)</span>
              <span className="font-bold text-purple-700">{abcData.a.length} Items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Class B (Next 20%)</span>
              <span className="font-bold text-purple-700">{abcData.b.length} Items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Class C (Low Value)</span>
              <span className="font-bold text-purple-700">{abcData.c.length} Items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-200 h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
            Expiring Soon (Next 30 Days)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {expiringMedicines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No medicines expiring soon</p>
            ) : (
              expiringMedicines.map((medicine) => {
                const daysToExpiry = Math.ceil(
                  (new Date(medicine.expiry_date).getTime() - new Date().getTime()) /
                  (1000 * 3600 * 24)
                );
                return (
                  <div
                    key={medicine.id}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-600">
                          {medicine.category_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-yellow-700">
                          {daysToExpiry} days
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(medicine.expiry_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Low Stock Items
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lowStockMedicines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No low stock items</p>
            ) : (
              lowStockMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-600">
                        {medicine.category_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-700">
                        Stock: {medicine.quantity_in_stock}
                      </div>
                      <div className="text-xs text-gray-600">
                        Reorder: {medicine.reorder_level}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Analytics Report</h2>
            <p className="text-gray-600 mb-6">Choose export format:</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  exportToExcel();
                  setShowExportModal(false);
                }}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Export to Excel</span>
              </button>

              <button
                onClick={() => {
                  exportToPDF();
                  setShowExportModal(false);
                }}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Export to PDF</span>
              </button>

              <button
                onClick={() => {
                  exportToWord();
                  setShowExportModal(false);
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Export to Word</span>
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
