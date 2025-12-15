'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  Filter as FilterIcon,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';
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
  AreaChart,
  Area,
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Pagination from '@/components/Pagination';

type DateFilterType = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'prev_month' | 'this_year' | 'jan_mar' | 'apr_jun' | 'jul_sep' | 'oct_dec' | 'jan_jun' | 'jul_dec';

export default function SalesAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showTopMedicinesModal, setShowTopMedicinesModal] = useState(false);
  const [transPage, setTransPage] = useState(1);
  const [itemsPage, setItemsPage] = useState(1);
  const [topMedPage, setTopMedPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<DateFilterType | 'custom'>('custom');
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 15;

  const handleExport = async (exportFn: () => void) => {
    setIsExporting(true);
    // Simulate a small delay for visual feedback since export is sync
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      exportFn();
    } catch (error) {
      console.error('Export failed:', error);
      Swal.fire('Error', 'Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);

    // Fetch users for filter
    fetchUsers();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [startDate, endDate, paymentMethod, selectedUser, customerSearch]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      if (paymentMethod) params.append('paymentMethod', paymentMethod);
      if (selectedUser) params.append('userId', selectedUser);
      if (customerSearch) params.append('customer', customerSearch);

      const response = await fetch(`/api/analytics/sales?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = (filter: DateFilterType) => {
    setActiveFilter(filter);
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (filter) {
      case 'today':
        // Start/End is today
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        end.setDate(now.getDate() - 1);
        break;
      case 'this_week':
        const day = now.getDay() || 7; // getDay returns 0 for Sunday
        if (day !== 1) start.setHours(-24 * (day - 1));
        break;
      case 'this_month':
        start.setDate(1);
        break;
      case 'prev_month':
        start.setMonth(now.getMonth() - 1);
        start.setDate(1);
        end.setDate(0); // Last day of previous month
        break;
      case 'this_year':
        start.setMonth(0, 1);
        break;
      // Quarters
      case 'jan_mar':
        start.setMonth(0, 1); // Jan 1st
        end.setMonth(2, 31); // Mar 31st (approx, handled by JS overflow or set explicitly)
        // Better: new Date(year, 2 + 1, 0)
        end.setFullYear(now.getFullYear(), 3, 0);
        break;
      case 'apr_jun':
        start.setMonth(3, 1);
        end.setFullYear(now.getFullYear(), 6, 0);
        break;
      case 'jul_sep':
        start.setMonth(6, 1);
        end.setFullYear(now.getFullYear(), 9, 0);
        break;
      case 'oct_dec':
        start.setMonth(9, 1);
        end.setFullYear(now.getFullYear(), 12, 0);
        break;
      // Bi-Annual
      case 'jan_jun':
        start.setMonth(0, 1);
        end.setFullYear(now.getFullYear(), 6, 0);
        break;
      case 'jul_dec':
        start.setMonth(6, 1);
        end.setFullYear(now.getFullYear(), 12, 0);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };


  const exportToExcel = () => {
    if (!analytics) return;

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Sales Analytics Report'],
      ['Period', `${startDate} to ${endDate}`],
      [''],
      ['Metric', 'Value'],
      ['Total Sales', analytics.summary.total_sales],
      ['Total Revenue', `TZS ${analytics.summary.total_revenue?.toLocaleString()}`],
      ['Total Profit', `TZS ${analytics.summary.total_profit?.toLocaleString()}`],
      ['Average Sale', `TZS ${analytics.summary.average_sale?.toLocaleString()}`],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Daily trend sheet
    if (analytics.dailyTrend && analytics.dailyTrend.length > 0) {
      const dailySheet = XLSX.utils.json_to_sheet(
        analytics.dailyTrend.map((d: any) => ({
          Date: new Date(d.date).toLocaleDateString(),
          'Sales Count': d.sales_count,
          Revenue: d.revenue,
        }))
      );
      XLSX.utils.book_append_sheet(wb, dailySheet, 'Daily Trend');
    }

    // Top medicines sheet
    if (analytics.topMedicines && analytics.topMedicines.length > 0) {
      const topMedicinesSheet = XLSX.utils.json_to_sheet(
        analytics.topMedicines.map((m: any) => ({
          Medicine: m.medicine_name,
          'Quantity Sold': m.total_quantity,
          Revenue: m.total_revenue,
          Profit: m.total_profit,
          'Times Sold': m.times_sold,
        }))
      );
      XLSX.utils.book_append_sheet(wb, topMedicinesSheet, 'Top Medicines');
    }

    // Payment methods sheet
    if (analytics.paymentMethods && analytics.paymentMethods.length > 0) {
      const paymentSheet = XLSX.utils.json_to_sheet(
        analytics.paymentMethods.map((p: any) => ({
          'Payment Method': p.payment_method,
          Count: p.count,
          Total: p.total,
        }))
      );
      XLSX.utils.book_append_sheet(wb, paymentSheet, 'Payment Methods');
    }



    XLSX.writeFile(
      wb,
      `Sales_Analytics_${startDate}_to_${endDate}.xlsx`
    );

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Sales analytics exported to Excel successfully',
      timer: 2000,
    });
  };

  const exportToPDF = () => {
    if (!analytics) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Sales Analytics Report', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 105, 22, { align: 'center' });

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 35);

    const summaryData = [
      ['Total Sales', analytics.summary.total_sales?.toString() || '0'],
      ['Total Revenue', `TZS ${analytics.summary.total_revenue?.toLocaleString() || '0'}`],
      ['Total Profit', `TZS ${analytics.summary.total_profit?.toLocaleString() || '0'}`],
      ['Average Sale', `TZS ${analytics.summary.average_sale?.toLocaleString() || '0'}`],
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        cellPadding: 3,
      },
    });

    // Top Medicines
    if (analytics.topMedicines && analytics.topMedicines.length > 0) {
      doc.setFontSize(14);
      const finalY = (doc as any).lastAutoTable.finalY || 40;
      doc.text('Top Selling Medicines', 20, finalY + 15);

      const topMedicinesData = analytics.topMedicines.slice(0, 10).map((m: any) => [
        m.medicine_name,
        m.total_quantity?.toString() || '0',
        `TZS ${m.total_revenue?.toLocaleString() || '0'}`,
        `TZS ${m.total_profit?.toLocaleString() || '0'}`,
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Medicine', 'Qty Sold', 'Revenue', 'Profit']],
        body: topMedicinesData,
        theme: 'striped',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        styles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          cellPadding: 3,
        },
      });
    }

    // Payment Methods
    if (analytics.paymentMethods && analytics.paymentMethods.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Payment Methods Distribution', 20, 20);

      const paymentData = analytics.paymentMethods.map((p: any) => [
        p.payment_method,
        p.count?.toString() || '0',
        `TZS ${p.total?.toLocaleString() || '0'}`,
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['Method', 'Count', 'Total']],
        body: paymentData,
        theme: 'striped',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        styles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          cellPadding: 3,
        },
      });
    }



    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
        105,
        285,
        { align: 'center' }
      );
    }

    doc.save(`Sales_Analytics_${startDate}_to_${endDate}.pdf`);

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Sales analytics exported to PDF successfully',
      timer: 2000,
    });
  };

  const exportToWord = () => {
    if (!analytics) return;

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sales Analytics Report</title>
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
        <h1>Sales Analytics Report</h1>
        <p class="date">Period: ${startDate} to ${endDate}</p>
        <p class="date">Generated on: ${new Date().toLocaleString()}</p>

        <div class="summary">
          <h2>Summary Statistics</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Sales</td><td>${analytics.summary?.total_sales || 0}</td></tr>
            <tr><td>Total Revenue</td><td>TZS ${analytics.summary?.total_revenue?.toLocaleString() || 0}</td></tr>
            <tr><td>Total Profit</td><td>TZS ${analytics.summary?.total_profit?.toLocaleString() || 0}</td></tr>
            <tr><td>Average Sale</td><td>TZS ${analytics.summary?.average_sale?.toLocaleString() || 0}</td></tr>
          </table>
        </div>

        ${analytics.topMedicines && analytics.topMedicines.length > 0 ? `
          <h2>Top Selling Medicines</h2>
          <table>
            <tr><th>Medicine</th><th>Quantity Sold</th><th>Revenue</th><th>Profit</th></tr>
            ${analytics.topMedicines.slice(0, 15).map((m: any) => `
              <tr>
                <td>${m.medicine_name}</td>
                <td>${m.total_quantity}</td>
                <td>TZS ${m.total_revenue?.toLocaleString() || 0}</td>
                <td>TZS ${m.total_profit?.toLocaleString() || 0}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}

        ${analytics.paymentMethods && analytics.paymentMethods.length > 0 ? `
          <h2>Payment Methods Distribution</h2>
          <table>
            <tr><th>Payment Method</th><th>Count</th><th>Total Amount</th></tr>
            ${analytics.paymentMethods.map((p: any) => `
              <tr>
                <td>${p.payment_method}</td>
                <td>${p.count}</td>
                <td>TZS ${p.total?.toLocaleString() || 0}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}

        ${analytics.dailyTrend && analytics.dailyTrend.length > 0 ? `
          <h2>Daily Sales Trend</h2>
          <table>
            <tr><th>Date</th><th>Sales Count</th><th>Revenue</th></tr>
            ${analytics.dailyTrend.map((d: any) => `
              <tr>
                <td>${new Date(d.date).toLocaleDateString()}</td>
                <td>${d.sales_count}</td>
                <td>TZS ${d.revenue?.toLocaleString() || 0}</td>
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
    link.download = `Sales_Analytics_${startDate}_to_${endDate}.doc`;
    link.click();

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Sales analytics exported to Word successfully',
      timer: 2000,
    });
  };

  // Derived Data & New Modal Exports
  const getTransactions = () => {
    if (!analytics?.detailedSales) return [];
    const seen = new Set();
    return analytics.detailedSales.filter((sale: any) => {
      const duplicate = seen.has(sale.invoice_number);
      seen.add(sale.invoice_number);
      return !duplicate;
    });
  };

  const getSoldItems = () => {
    return analytics?.detailedSales || [];
  };

  const exportTransactions = (type: 'pdf' | 'excel') => {
    const transactions = getTransactions();
    if (type === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(transactions.map((t: any) => ({
        Date: new Date(t.sale_date).toLocaleDateString(),
        Invoice: t.invoice_number,
        Customer: t.customer_name || 'Walk-in',
        Total: t.invoice_total,
        Paid: t.amount_paid,
        Change: t.change_amount,
        Seller: t.seller_name
      })));
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `Transactions_${startDate}_${endDate}.xlsx`);
    } else if (type === 'pdf') {
      const doc = new jsPDF();
      doc.text("Transactions Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Invoice', 'Customer', 'Total', 'Paid', 'Change/Debt', 'Seller']],
        body: transactions.map((t: any) => [
          new Date(t.sale_date).toLocaleDateString(),
          t.invoice_number,
          t.customer_name || '-',
          `TZS ${t.invoice_total?.toLocaleString()}`,
          `TZS ${t.amount_paid?.toLocaleString()}`,
          t.change_amount < 0 ? `Debt: TZS ${Math.abs(t.change_amount).toLocaleString()}` : `TZS ${t.change_amount?.toLocaleString()}`,
          t.seller_name
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [22, 163, 74], // Green-600
          textColor: 255,
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        styles: {
          textColor: 0,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244] // Light Green tint
        }
      });
      doc.save(`Transactions_${startDate}_${endDate}.pdf`);
    }
  };

  const exportItems = (type: 'pdf' | 'excel') => {
    const items = getSoldItems();
    if (type === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(items.map((i: any) => ({
        Date: new Date(i.sale_date).toLocaleDateString(),
        Item: i.medicine_name,
        Qty: i.quantity,
        Total: i.item_total,
        Profit: i.item_profit,
        "Stock Remaining": i.current_stock,
        "Stock Value": i.stock_value
      })));
      XLSX.utils.book_append_sheet(wb, ws, "Sold Items");
      XLSX.writeFile(wb, `Sold_Items_${startDate}_${endDate}.xlsx`);
    } else if (type === 'pdf') {
      const doc = new jsPDF();
      doc.text("Sold Items Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Item', 'Qty', 'Total', 'Profit', 'Stock Left', 'Stock Value']],
        body: items.map((i: any) => [
          new Date(i.sale_date).toLocaleDateString(),
          i.medicine_name,
          i.quantity,
          `TZS ${i.item_total?.toLocaleString()}`,
          `TZS ${i.item_profit?.toLocaleString()}`,
          i.current_stock,
          `TZS ${i.stock_value?.toLocaleString()}`
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [22, 163, 74], // Green-600
          textColor: 255,
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        styles: {
          textColor: 0,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244] // Light Green tint
        }
      });
      doc.save(`Sold_Items_${startDate}_${endDate}.pdf`);
    }
  };

  const getTopMedicines = () => {
    return analytics?.topMedicines || [];
  };

  const exportTopMedicines = (type: 'pdf' | 'excel') => {
    const medicines = getTopMedicines();
    if (type === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(medicines.map((m: any) => ({
        Medicine: m.medicine_name,
        'Qty Sold': m.total_quantity,
        Revenue: m.total_revenue,
        Profit: m.total_profit,
        'Times Sold': m.times_sold,
      })));
      XLSX.utils.book_append_sheet(wb, ws, "Top Medicines");
      XLSX.writeFile(wb, `Top_Medicines_${startDate}_${endDate}.xlsx`);
    } else if (type === 'pdf') {
      const doc = new jsPDF();
      doc.text("Top Medicines Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [['Medicine', 'Qty Sold', 'Revenue', 'Profit', 'Times Sold']],
        body: medicines.map((m: any) => [
          m.medicine_name,
          m.total_quantity,
          `TZS ${m.total_revenue?.toLocaleString()}`,
          `TZS ${m.total_profit?.toLocaleString()}`,
          m.times_sold
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [22, 163, 74],
          textColor: 255,
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        styles: {
          textColor: 0,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244]
        }
      });
      doc.save(`Top_Medicines_${startDate}_${endDate}.pdf`);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 truncate" title={String(value)}>{value}</h3>
          {change && (
            <div className="flex items-center mt-2 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`w-14 h-14 rounded-lg ${color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
          </div>
        )}
      </div>
    </div>
  );

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
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

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[350px] animate-pulse"></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[350px] animate-pulse"></div>
        </div>

        {/* Report Buttons Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed sales and revenue analysis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center space-x-2 text-sm font-medium"
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md flex items-center space-x-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>



      {/* Stats Grid */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`TZS ${(analytics.summary.total_revenue || 0).toLocaleString()}`}
              color="bg-green-500"
            />
            <StatCard
              title="Total Sales"
              value={analytics.summary.total_sales?.toLocaleString() || '0'}
              icon={ShoppingCart}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Profit"
              value={`TZS ${(analytics.summary.total_profit || 0).toLocaleString()}`}
              icon={TrendingUp}
              color="bg-purple-500"
            />
            <StatCard
              title="Profit Margin"
              value={`${(
                ((analytics.summary.total_profit || 0) /
                  (analytics.summary.total_revenue || 1)) *
                100
              ).toFixed(1)}%`}
              icon={Percent}
              color="bg-orange-500"
            />
          </div>

          {/* Detailed Reports Section Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 col-span-full mt-6">
            <button
              onClick={() => setShowTransactionsModal(true)}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Transactions Report</h3>
              <p className="text-sm text-gray-500 mt-1">
                View invoice-level details: Payments, Change, Customers
              </p>
            </button>

            <button
              onClick={() => setShowItemsModal(true)}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sold Items Report</h3>
              <p className="text-sm text-gray-500 mt-1">
                View product-level details: Quantities, Stock Impact, Item Totals
              </p>
            </button>

            <button
              onClick={() => setShowTopMedicinesModal(true)}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Top Medicines Report</h3>
              <p className="text-sm text-gray-500 mt-1">
                View best selling products, profitability and frequency
              </p>
            </button>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Sales Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={analytics.dailyTrend?.slice().reverse() || []}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    stroke="#94a3b8"
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value: any) => [`TZS ${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Methods
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.paymentMethods || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payment_method, percent }) =>
                      `${payment_method} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics.paymentMethods || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Sales Pattern */}
            {analytics.hourlySales && analytics.hourlySales.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sales by Hour
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.hourlySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(value) => `${value}:00`}
                      stroke="#94a3b8"
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      labelFormatter={(value) => `${value}:00`}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="sales_count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>








          {/* Transactions Modal */}
          {
            showTransactionsModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-2xl">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Transactions Report</h2>
                      <div className="flex gap-3 mt-2 text-sm font-medium">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                          Count: {getTransactions().length}
                        </span>
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                          Revenue: TZS {getTransactions().reduce((sum: number, t: any) => sum + (t.invoice_total || 0), 0).toLocaleString()}
                        </span>
                        <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-100">
                          Paid: TZS {getTransactions().reduce((sum: number, t: any) => sum + (t.amount_paid || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport(() => exportTransactions('excel'))}
                        disabled={isExporting}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Excel
                      </button>
                      <button
                        onClick={() => handleExport(() => exportTransactions('pdf'))}
                        disabled={isExporting}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF
                      </button>
                      <button onClick={() => setShowTransactionsModal(false)} className="px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-500 text-sm font-medium">
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="p-0 overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Invoice #</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Total Bill</th>
                          <th className="py-3 px-4">Paid</th>
                          <th className="py-3 px-4">Change/Debt</th>
                          <th className="py-3 px-4">Seller</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {getTransactions()
                          .slice((transPage - 1) * itemsPerPage, transPage * itemsPerPage)
                          .map((t: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{new Date(t.sale_date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 font-medium">{t.invoice_number}</td>
                              <td className="py-3 px-4">{t.customer_name || '-'}</td>
                              <td className="py-3 px-4 font-bold">TZS {t.invoice_total?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-green-600">TZS {t.amount_paid?.toLocaleString()}</td>
                              <td className={`py-3 px-4 font-medium ${t.change_amount < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                {t.change_amount < 0 ? 'Debt: ' : ''}TZS {Math.abs(t.change_amount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-4">{t.seller_name}</td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-gray-100 font-bold text-gray-900 border-t border-gray-200">
                        <tr>
                          <td colSpan={3} className="py-4 px-4 text-right">Totals:</td>
                          <td className="py-4 px-4">TZS {getTransactions().reduce((s: number, t: any) => s + (t.invoice_total || 0), 0).toLocaleString()}</td>
                          <td className="py-4 px-4 text-green-700">TZS {getTransactions().reduce((s: number, t: any) => s + (t.amount_paid || 0), 0).toLocaleString()}</td>
                          <td className="py-4 px-4 text-orange-700">TZS {getTransactions().reduce((s: number, t: any) => s + (t.change_amount || 0), 0).toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <Pagination
                    currentPage={transPage}
                    totalPages={Math.ceil(getTransactions().length / itemsPerPage)}
                    onPageChange={setTransPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={getTransactions().length}
                  />
                </div>
              </div>
            )
          }

          {/* Sold Items Modal */}
          {
            showItemsModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-2xl">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Sold Items Report</h2>
                      <div className="flex gap-3 mt-2 text-sm font-medium">
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                          Total Items: {getSoldItems().reduce((s: number, i: any) => s + (i.quantity || 0), 0)}
                        </span>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                          Total Value: TZS {getSoldItems().reduce((s: number, i: any) => s + (i.item_total || 0), 0).toLocaleString()}
                        </span>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                          Total Profit: TZS {getSoldItems().reduce((s: number, i: any) => s + (i.item_profit || 0), 0).toLocaleString()}
                        </span>
                        <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                          Remaining Stock Value: TZS {getSoldItems().reduce((s: number, i: any) => s + (i.stock_value || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport(() => exportItems('excel'))}
                        disabled={isExporting}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Excel
                      </button>
                      <button
                        onClick={() => handleExport(() => exportItems('pdf'))}
                        disabled={isExporting}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF
                      </button>
                      <button onClick={() => setShowItemsModal(false)} className="px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-500 text-sm font-medium">
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="p-0 overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Item</th>
                          <th className="py-3 px-4">Qty Sold</th>
                          <th className="py-3 px-4">Item Total</th>
                          <th className="py-3 px-4">Profit</th>
                          <th className="py-3 px-4">Stock Left</th>
                          <th className="py-3 px-4">Stock Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {getSoldItems()
                          .slice((itemsPage - 1) * itemsPerPage, itemsPage * itemsPerPage)
                          .map((i: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{new Date(i.sale_date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 font-medium">{i.medicine_name}</td>
                              <td className="py-3 px-4">{i.quantity}</td>
                              <td className="py-3 px-4 font-bold">TZS {i.item_total?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-green-600">TZS {i.item_profit?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-blue-600">{i.current_stock}</td>
                              <td className="py-3 px-4 text-gray-500">TZS {i.stock_value?.toLocaleString()}</td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-gray-100 font-bold text-gray-900 border-t border-gray-200">
                        <tr>
                          <td colSpan={2} className="py-4 px-4 text-right">Totals:</td>
                          <td className="py-4 px-4">{getSoldItems().reduce((s: number, i: any) => s + (i.quantity || 0), 0)}</td>
                          <td className="py-4 px-4 text-green-700">TZS {getSoldItems().reduce((s: number, i: any) => s + (i.item_total || 0), 0).toLocaleString()}</td>
                          <td className="py-4 px-4 text-blue-700">TZS {getSoldItems().reduce((s: number, i: any) => s + (i.item_profit || 0), 0).toLocaleString()}</td>
                          <td></td>
                          <td className="py-4 px-4 text-purple-700">TZS {getSoldItems().reduce((s: number, i: any) => s + (i.stock_value || 0), 0).toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <Pagination
                    currentPage={itemsPage}
                    totalPages={Math.ceil(getSoldItems().length / itemsPerPage)}
                    onPageChange={setItemsPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={getSoldItems().length}
                  />
                </div>
              </div>
            )
          }




          {/* Filter Modal */}
          {
            showFilterModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">Filters & Settings</h2>
                    <button onClick={() => setShowFilterModal(false)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                      Close
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-8">
                    {/* Date Presets */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Date Presets</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Today', value: 'today' },
                          { label: 'Yesterday', value: 'yesterday' },
                          { label: 'This Week', value: 'this_week' },
                          { label: 'This Month', value: 'this_month' },
                          { label: 'Last Month', value: 'prev_month' },
                          { label: 'This Year', value: 'this_year' },
                        ].map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => applyDateFilter(filter.value as DateFilterType)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${activeFilter === filter.value
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          { label: 'Q1 (Jan-Mar)', value: 'jan_mar' },
                          { label: 'Q2 (Apr-Jun)', value: 'apr_jun' },
                          { label: 'Q3 (Jul-Sep)', value: 'jul_sep' },
                          { label: 'Q4 (Oct-Dec)', value: 'oct_dec' },
                          { label: '1st Half (Jan-Jun)', value: 'jan_jun' },
                          { label: '2nd Half (Jul-Dec)', value: 'jul_dec' },
                        ].map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => applyDateFilter(filter.value as DateFilterType)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${activeFilter === filter.value
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setActiveFilter('custom')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${activeFilter === 'custom'
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          Custom Range
                        </button>
                      </div>
                    </div>

                    {/* Manual Date Range */}
                    {activeFilter === 'custom' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                          />
                        </div>
                      </div>
                    )}

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                        >
                          <option value="">All Methods</option>
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="mobile_money">Mobile Money</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User/Cashier</label>
                        <select
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                        >
                          <option value="">All Users</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.full_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50 rounded-b-2xl">
                    <button
                      onClick={() => {
                        setPaymentMethod('');
                        setSelectedUser('');
                        setCustomerSearch('');
                        applyDateFilter('this_month');
                      }}
                      className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Top Medicines Modal */}
          {
            showTopMedicinesModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Top Medicines Report</h2>
                      <p className="text-sm text-gray-500">Best selling products by revenue and quantity</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport(() => exportTopMedicines('excel'))}
                        disabled={isExporting}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Excel
                      </button>
                      <button
                        onClick={() => handleExport(() => exportTopMedicines('pdf'))}
                        disabled={isExporting}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF
                      </button>
                      <button onClick={() => setShowTopMedicinesModal(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="p-0 overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-4">Medicine</th>
                          <th className="py-3 px-4">Qty Sold</th>
                          <th className="py-3 px-4">Revenue</th>
                          <th className="py-3 px-4">Profit</th>
                          <th className="py-3 px-4">Freq</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {getTopMedicines()
                          .slice((topMedPage - 1) * itemsPerPage, topMedPage * itemsPerPage)
                          .map((m: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{m.medicine_name}</td>
                              <td className="py-3 px-4">{m.total_quantity}</td>
                              <td className="py-3 px-4 font-bold text-green-600">TZS {m.total_revenue?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-blue-600">TZS {m.total_profit?.toLocaleString()}</td>
                              <td className="py-3 px-4">{m.times_sold}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={topMedPage}
                    totalPages={Math.ceil(getTopMedicines().length / itemsPerPage)}
                    onPageChange={setTopMedPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={getTopMedicines().length}
                  />
                </div>
              </div>
            )
          }

          {/* Export Modal */}
          {
            showExportModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Sales Analytics</h2>
                  <p className="text-gray-600 mb-6">Choose export format:</p>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleExport(() => {
                        exportToExcel();
                        setShowExportModal(false);
                      })}
                      disabled={isExporting}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                      <span>{isExporting ? 'Generating...' : 'Export to Excel'}</span>
                    </button>

                    <button
                      onClick={() => handleExport(() => {
                        exportToPDF();
                        setShowExportModal(false);
                      })}
                      disabled={isExporting}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      <span>{isExporting ? 'Generating...' : 'Export to PDF'}</span>
                    </button>

                    <button
                      onClick={() => handleExport(() => {
                        exportToWord();
                        setShowExportModal(false);
                      })}
                      disabled={isExporting}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      <span>{isExporting ? 'Generating...' : 'Export to Word'}</span>
                    </button>

                    <button
                      onClick={() => setShowExportModal(false)}
                      disabled={isExporting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )
          }
        </>
      )}
    </div>
  );
}
