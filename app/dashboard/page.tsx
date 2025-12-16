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
  Users,
  Eye,
  Download,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [medicineDetails, setMedicineDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [txnPage, setTxnPage] = useState(1);
  const [topMedPage, setTopMedPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<any>(null);
  const itemsPerPage = 5;

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

  const handleViewInvoice = async (invoiceId: number) => {
    try {
      setDownloadingId(invoiceId);
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const data = await response.json();

      if (!data.success) {
        console.error('Failed to fetch invoice details');
        return;
      }

      setInvoicePreview(data.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const generatePDF = (details: any) => {
    try {
      const doc = new jsPDF();

      // Company Header (Center)
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('PHARMCARE MANAGEMENT SYSTEM', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Location: Dar es Salaam, Tanzania', 105, 28, { align: 'center' });
      doc.text('Phone: +255 123 456 789 | Email: info@pharmcare.com', 105, 34, { align: 'center' });

      // Line separator
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 42, 190, 42);

      // Invoice Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SALES INVOICE', 105, 52, { align: 'center' });

      // Info Section (Left: Billed To, Right: Invoice Details)
      const startY = 65;

      // Left Side - Billed To
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Billed To:', 20, startY);
      doc.setFont('helvetica', 'normal');
      doc.text(details.customer_name || 'Walk-in Customer', 20, startY + 6);
      if (details.customer_phone) {
        doc.text(details.customer_phone, 20, startY + 12);
      }

      // Right Side - Invoice Details
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Details:', 140, startY);

      doc.setFont('helvetica', 'normal');
      doc.text('Invoice #:', 140, startY + 6);
      doc.setFont('helvetica', 'bold');
      doc.text(details.invoice_number, 170, startY + 6);

      doc.setFont('helvetica', 'normal');
      doc.text('Date:', 140, startY + 12);
      doc.text(new Date(details.sale_date).toLocaleDateString('en-US'), 170, startY + 12);

      // Items Table
      autoTable(doc, {
        startY: startY + 25,
        head: [['Item', 'Qty', 'Price', 'Total']],
        body: details.items.map((item: any) => [
          item.medicine_name,
          item.quantity,
          `TZS ${item.unit_price.toLocaleString()}`,
          `TZS ${item.total_price.toLocaleString()}`,
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [66, 139, 202], // #428bca
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right', fontStyle: 'bold' },
        },
      });

      // Summary
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const summaryX = 130;
      const valueX = 190;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Subtotal
      doc.text('SUBTOTAL:', summaryX, finalY);
      doc.text(`TZS ${details.total_amount.toLocaleString()}`, valueX, finalY, { align: 'right' });

      // Paid
      doc.text('PAID:', summaryX, finalY + 6);
      doc.text(`TZS ${details.amount_paid.toLocaleString()}`, valueX, finalY + 6, { align: 'right' });

      // Divider
      doc.setDrawColor(0);
      doc.setLineWidth(0.1);
      doc.line(summaryX, finalY + 8, valueX, finalY + 8);

      // Change
      doc.setFont('helvetica', 'bold');
      doc.text('CHANGE:', summaryX, finalY + 14);
      doc.text(`TZS ${(details.amount_paid - details.total_amount).toLocaleString()}`, valueX, finalY + 14, { align: 'right' });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'Thank you for your business!',
          105,
          doc.internal.pageSize.height - 20,
          { align: 'center' }
        );
        doc.setFont('helvetica', 'normal');
        doc.text(
          'PharmaCare Management System - All Rights Reserved',
          105,
          doc.internal.pageSize.height - 15,
          { align: 'center' }
        );
      }

      doc.save(`Invoice_${details.invoice_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleMedicineClick = async (medicine: any) => {
    setSelectedMedicine(medicine);
    setTxnPage(1);
    setShowMedicineModal(true);
    setLoadingDetails(true);
    try {
      // Fetch details for this medicine (last 30 days default)
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const params = new URLSearchParams({
        medicine: medicine.name,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      });
      const response = await fetch(`/api/analytics/sales?${params}`);
      const data = await response.json();
      if (data.success) {
        setMedicineDetails(data.data);
      }
    } catch (error) {
      console.error("Error fetching medicine details:", error);
    } finally {
      setLoadingDetails(false);
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



  // ... (existing imports, but make sure to put `import { Skeleton } ...` at the top)

  // ...

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column Skeleton (Top Selling) */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center mb-6">
              <Skeleton className="w-6 h-6 mr-2 rounded-full" />
              <Skeleton className="h-6 w-48 rounded" />
            </div>
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center space-x-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right ml-2">
                    <Skeleton className="h-4 w-20 ml-auto rounded" />
                    <Skeleton className="h-3 w-12 ml-auto rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-[350px] w-full rounded-xl shadow-sm border border-gray-200" /> {/* Graph */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-6 w-20 rounded" />
                    {i < 2 && <Skeleton className="h-2 w-16 rounded mt-1" />}
                  </div>
                  <Skeleton className="w-10 h-10 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT COLUMN: Top Selling Medicines */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-6 h-6 mr-2 text-blue-600" />
            Top Selling Medicines
          </h3>
          <div className="space-y-2">
            {(stats.topSelling || [])
              .slice((topMedPage - 1) * itemsPerPage, topMedPage * itemsPerPage)
              .map((medicine: any, index: number) => (
                <div
                  key={index}
                  onClick={() => handleMedicineClick(medicine)}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                      {(topMedPage - 1) * itemsPerPage + index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{medicine.name}</p>
                      <p className="text-xs text-gray-500">
                        {medicine.total_sold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-bold text-green-600">
                      TZS {(medicine.total_revenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-500 font-medium opacity-100 group-hover:underline transition-all">
                      View Details
                    </p>
                  </div>
                </div>
              ))}
            {(stats.topSelling || []).length > itemsPerPage && (
              <div className="mt-4 overflow-x-auto pb-2">
                <Pagination
                  currentPage={topMedPage}
                  totalPages={Math.ceil((stats.topSelling?.length || 0) / itemsPerPage)}
                  onPageChange={setTopMedPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={stats.topSelling?.length || 0}
                />
              </div>
            )}
            {(!stats.topSelling || stats.topSelling.length === 0) && (
              <p className="text-center text-gray-500 py-8">No sales data available</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Graph & Metrics */}
        <div className="space-y-6 min-w-0">
          {/* Sales Trend Graph */}
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

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Today's Sales */}
            <StatCard
              title="Today's Sales"
              value={stats.todaySales || 0}
              icon={ShoppingCart}
              color="bg-blue-500"
              subtext="Transactions made today"
            />

            {/* Today's Revenue */}
            <StatCard
              title="Today's Revenue"
              value={`TZS ${(stats.todayRevenue || 0).toLocaleString()}`}
              icon={DollarSign}
              color="bg-green-500"
              subtext="Gross revenue today"
            />

            {/* Total Revenue */}
            <StatCard
              title="Total Revenue"
              value={`TZS ${(stats.totalRevenue || 0).toLocaleString()}`}
              icon={DollarSign}
              color="bg-emerald-500"
              subtext="All time revenue"
            />

            {/* Total Sales */}
            <StatCard
              title="Total Sales"
              value={(stats.totalSales || 0).toLocaleString()}
              icon={ShoppingCart}
              color="bg-indigo-500"
              subtext="Lifetime transactions"
            />

            {/* Total Medicines */}
            <StatCard
              title="Total Medicines"
              value={stats.totalMedicines || 0}
              icon={Pill}
              color="bg-purple-500"
              subtext="In inventory"
            />

            {/* Alerts */}
            <StatCard
              title="Alerts"
              value={(stats.lowStock || 0) + (stats.expiringSoon || 0)}
              icon={AlertTriangle}
              color="bg-red-500"
              subtext="Critical items"
            />
          </div>
        </div>

      </div>


      {/* Medicine Details Modal */}
      {
        showMedicineModal && selectedMedicine && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMedicine.name} - Sales History</h2>
                  <p className="text-sm text-gray-500">Last 30 Days Record</p>
                </div>
                <button
                  onClick={() => setShowMedicineModal(false)}
                  className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {loadingDetails ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : medicineDetails ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium">Total Quantity Sold</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {medicineDetails.summary.total_sales || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-900">
                          TZS {medicineDetails.summary.total_revenue?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <p className="text-sm text-purple-600 font-medium">Total Profit</p>
                        <p className="text-2xl font-bold text-purple-900">
                          TZS {medicineDetails.summary.total_profit?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    {/* Transactions Table */}
                    {/* Transactions Table */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Recent Transactions</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-gray-300">
                          <thead className="bg-gray-100 sticky top-0 z-10 text-gray-700 font-semibold border-b-2 border-gray-300 shadow-sm">
                            <tr>
                              <th className="py-3 px-4 border border-gray-300 whitespace-nowrap text-center w-16">S/N</th>
                              <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">Date</th>
                              <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">Invoice #</th>
                              <th className="py-3 px-4 border border-gray-300 whitespace-nowrap text-center">Quantity</th>
                              <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">Total</th>
                              <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">Seller</th>
                              <th className="py-3 px-4 border border-gray-300 whitespace-nowrap text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {medicineDetails.detailedSales && medicineDetails.detailedSales.length > 0 ? (
                              medicineDetails.detailedSales
                                .slice((txnPage - 1) * itemsPerPage, txnPage * itemsPerPage)
                                .map((sale: any, idx: number) => (
                                  <tr key={idx} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                                    <td className="py-3 px-4 text-gray-500 font-medium border border-gray-300 text-center">
                                      {(txnPage - 1) * itemsPerPage + idx + 1}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700 border border-gray-300">
                                      {new Date(sale.sale_date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-primary-600 border border-gray-300">
                                      {sale.invoice_number}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700 border border-gray-300 text-center">
                                      {sale.quantity}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-gray-900 border border-gray-300">
                                      TZS {sale.item_total?.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 border border-gray-300">
                                      {sale.seller_name || '-'}
                                    </td>
                                    <td className="py-3 px-4 border border-gray-300 text-center">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewInvoice(sale.sale_id);
                                        }}
                                        disabled={downloadingId === sale.sale_id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50 min-w-[70px] justify-center"
                                      >
                                        {downloadingId === sale.sale_id ? (
                                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                          <>
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                          </>
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-500 border border-gray-300">
                                  No sales records found for this period.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      {medicineDetails.detailedSales && medicineDetails.detailedSales.length > itemsPerPage && (
                        <div className="mt-4">
                          <Pagination
                            currentPage={txnPage}
                            totalPages={Math.ceil(medicineDetails.detailedSales.length / itemsPerPage)}
                            onPageChange={setTxnPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={medicineDetails.detailedSales.length}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Failed to load details</div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Invoice Preview Modal */}
      {
        invoicePreview && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 rounded-t-2xl backdrop-blur-sm">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </span>
                  Invoice Preview
                </h2>
                <button
                  onClick={() => setInvoicePreview(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto bg-gray-100/50 flex-1">
                <div className="bg-white shadow-sm p-8 max-w-lg mx-auto border border-gray-200 min-h-[500px] text-sm relative print:shadow-none print:border-none">
                  {/* Standard Official Header */}
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 uppercase">PHARMCARE MANAGEMENT SYSTEM</h1>
                    <p className="text-gray-600 mt-1">Location: Dar es Salaam, Tanzania</p>
                    <p className="text-gray-600">Phone: +255 123 456 789 | Email: info@pharmcare.com</p>
                    <div className="border-b border-gray-300 my-4 w-full"></div>
                    <h2 className="text-xl font-bold text-gray-800 uppercase mt-2">SALES INVOICE</h2>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="w-1/2">
                      <p className="font-bold text-gray-900 mb-1">Billed To:</p>
                      <p className="text-gray-800">{invoicePreview.customer_name || 'Walk-in Customer'}</p>
                      {invoicePreview.customer_phone && <p className="text-gray-600">{invoicePreview.customer_phone}</p>}
                    </div>
                    <div className="w-1/2 text-right">
                      <p className="font-bold text-gray-900 mb-1">Invoice Details:</p>
                      <p className="text-gray-800"><span className="font-semibold">Invoice #:</span> {invoicePreview.invoice_number}</p>
                      <p className="text-gray-800"><span className="font-semibold">Date:</span> {new Date(invoicePreview.sale_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <table className="w-full text-sm mb-6 border-collapse">
                    <thead>
                      <tr className="bg-[#428bca] text-white">
                        <th className="text-left py-2 px-3 font-bold border border-[#428bca]">Item</th>
                        <th className="text-center py-2 px-3 font-bold border border-[#428bca]">Qty</th>
                        <th className="text-right py-2 px-3 font-bold border border-[#428bca]">Price</th>
                        <th className="text-right py-2 px-3 font-bold border border-[#428bca]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicePreview.items.map((item: any, i: number) => (
                        <tr key={i} className="even:bg-gray-50">
                          <td className="py-2 px-3 text-gray-800 border-b border-gray-200 border-l border-r">{item.medicine_name}</td>
                          <td className="py-2 px-3 text-center text-gray-800 border-b border-gray-200 border-r">{item.quantity}</td>
                          <td className="py-2 px-3 text-right text-gray-800 border-b border-gray-200 border-r">TZS {item.unit_price?.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-medium text-gray-900 border-b border-gray-200 border-r">TZS {item.total_price?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col items-end pt-2 space-y-1 mb-12">
                    <div className="w-48 flex justify-between py-1">
                      <span className="font-bold text-gray-700">SUBTOTAL:</span>
                      <span className="text-gray-900 font-medium text-right">TZS {invoicePreview.total_amount?.toLocaleString()}</span>
                    </div>
                    <div className="w-48 flex justify-between py-1">
                      <span className="font-bold text-gray-700">PAID:</span>
                      <span className="text-gray-900 font-medium text-right">TZS {invoicePreview.amount_paid?.toLocaleString()}</span>
                    </div>
                    <div className="w-48 border-t border-gray-400 my-1"></div>
                    <div className="w-48 flex justify-between py-1">
                      <span className="font-bold text-gray-800">CHANGE:</span>
                      <span className="text-gray-900 font-bold text-right">TZS {((invoicePreview.amount_paid || 0) - (invoicePreview.total_amount || 0)).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-0 w-full text-center">
                    <p className="text-gray-600 italic text-xs mb-1">Thank you for your business!</p>
                    <div className="border-t border-gray-300 w-3/4 mx-auto my-2"></div>
                    <p className="text-gray-500 text-[10px]">PharmaCare Management System - All Rights Reserved</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                <button
                  onClick={() => setInvoicePreview(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors text-sm"
                >
                  Close Header
                </button>
                <button
                  onClick={() => generatePDF(invoicePreview)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 text-sm shadow-lg shadow-blue-200"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
