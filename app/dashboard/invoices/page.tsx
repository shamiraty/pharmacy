'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Filter, Calendar, User, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
  });
  const itemsPerPage = 15;

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();

      if (data.success) {
        setInvoices(data.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoice: any) => {
    try {
      setDownloadingId(invoice.id);
      const response = await fetch(`/api/invoices/${invoice.id}`);
      const data = await response.json();

      if (!data.success) {
        Swal.fire('Error', 'Failed to fetch invoice details', 'error');
        return;
      }

      const details = data.data;
      const doc = new jsPDF();

      // Company Header
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('PHARMCARE MANAGEMENT SYSTEM', 105, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Location: Dar es Salaam, Tanzania', 105, 22, { align: 'center' });
      doc.text('Phone: +255 123 456 789 | Email: info@pharmcare.com', 105, 27, { align: 'center' });

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      // Invoice Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SALES INVOICE', 105, 40, { align: 'center' });

      // Invoice Details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Invoice #: ${details.invoice_number}`, 20, 50);
      doc.text(`Date: ${new Date(details.sale_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}`, 20, 56);

      doc.setFont('helvetica', 'normal');
      doc.text(`Customer: ${details.customer_name || 'Walk-in Customer'}`, 20, 62);
      if (details.customer_phone) {
        doc.text(`Phone: ${details.customer_phone}`, 20, 68);
      }

      // Items Table
      autoTable(doc, {
        startY: 75,
        head: [['Medicine', 'Quantity', 'Unit Price', 'Total']],
        body: details.items.map((item: any) => [
          item.medicine_name,
          item.quantity,
          `TZS ${item.unit_price.toLocaleString()}`,
          `TZS ${(item.total_price || item.subtotal || (item.quantity * item.unit_price)).toLocaleString()}`,
        ]),
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
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' },
        },
      });

      // Get final Y position after table
      const finalY = (doc as any).lastAutoTable.finalY || 150;

      // Summary section - Bottom right
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');

      const summaryX = 120;
      let summaryY = finalY + 15;

      // Draw summary box
      doc.setLineWidth(0.1);
      doc.rect(summaryX - 5, summaryY - 8, 75, 35);

      doc.text('SUBTOTAL:', summaryX, summaryY);
      doc.text(`TZS ${details.total_amount.toLocaleString()}`, 185, summaryY, { align: 'right' });

      summaryY += 7;
      doc.text('PAID:', summaryX, summaryY);
      doc.text(`TZS ${details.amount_paid.toLocaleString()}`, 185, summaryY, { align: 'right' });

      summaryY += 7;
      doc.setLineWidth(0.5);
      doc.line(summaryX, summaryY - 2, 190, summaryY - 2);

      doc.setFontSize(12);
      doc.text('CHANGE:', summaryX, summaryY + 3);
      doc.text(`TZS ${(details.amount_paid - details.total_amount).toLocaleString()}`, 185, summaryY + 3, { align: 'right' });

      // Footer
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for your business!', 105, 270, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, 105, 275, { align: 'center' });

      doc.setLineWidth(0.3);
      doc.line(20, 280, 190, 280);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('PharmaCare Management System - All Rights Reserved', 105, 285, { align: 'center' });

      doc.save(`Invoice_${details.invoice_number}.pdf`);

      Swal.fire({
        title: 'Success!',
        text: 'Invoice downloaded successfully',
        icon: 'success',
        timer: 2000,
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to generate PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ankara / Invoices</h1>
          <p className="text-gray-600 mt-1">Historia ya mauzo yote</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarehe ya Kuanza
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarehe ya Mwisho
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tafuta
            </label>
            <input
              type="text"
              placeholder="Invoice #, Mteja..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <TableSkeleton columns={6} rows={10} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse border border-gray-300">
              <thead className="bg-gray-100 sticky top-0 z-10 text-gray-700 font-semibold border-b-2 border-gray-300 shadow-sm">
                <tr>
                  <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                    S/N
                  </th>
                  <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                    Invoice #
                  </th>
                  <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                    Tarehe
                  </th>
                  <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                    Mteja
                  </th>
                  <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                    Kiasi
                  </th>
                  <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                    Hali
                  </th>
                  <th className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-500 font-medium border border-gray-300 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-primary-600 border border-gray-300">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-3 px-4 text-gray-700 border border-gray-300">
                      {new Date(invoice.sale_date).toLocaleDateString('sw-TZ')}
                    </td>
                    <td className="py-3 px-4 text-gray-700 border border-gray-300">
                      {invoice.customer_name || 'Walk-in'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 border border-gray-300">
                      TZS {invoice.total_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 border border-gray-300">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 border border-gray-300">
                      <button
                        onClick={() => downloadInvoice(invoice)}
                        disabled={downloadingId === invoice.id}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        {downloadingId === invoice.id ? (
                          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && invoices.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={invoices.length}
          />
        )}
      </div>
    </div>
  );
}
