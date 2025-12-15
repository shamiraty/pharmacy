'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Eye, X, Download, FileSpreadsheet, FileText } from 'lucide-react';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/medicines');
      const data = await response.json();

      if (data.success) {
        setMedicines(data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (medicine: any) => {
    if (medicine.quantity_in_stock === 0) {
      return { status: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (medicine.quantity_in_stock <= medicine.reorder_level) {
      return { status: 'Low Stock', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else {
      return { status: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const viewSalesHistory = async (medicine: any) => {
    setSelectedMedicine(medicine);
    setShowHistoryModal(true);
    setLoadingHistory(true);

    try {
      const response = await fetch(`/api/inventory/sales-history/${medicine.id}`);
      const data = await response.json();

      if (data.success) {
        setSalesHistory(data.data);
      } else {
        setSalesHistory([]);
      }
    } catch (error) {
      console.error('Error fetching sales history:', error);
      Swal.fire('Error', 'Failed to fetch sales history', 'error');
      setSalesHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const exportHistoryToExcel = () => {
    if (!selectedMedicine || salesHistory.length === 0) {
      Swal.fire('No Data', 'No sales history to export', 'warning');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Medicine Info
    const medicineInfo = [
      ['Medicine Sales History Report'],
      [''],
      ['Medicine Name', selectedMedicine.name],
      ['Generic Name', selectedMedicine.generic_name || 'N/A'],
      ['Category', selectedMedicine.category_name || 'N/A'],
      ['Current Stock', selectedMedicine.quantity_in_stock],
      [''],
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(medicineInfo);
    XLSX.utils.book_append_sheet(wb, infoSheet, 'Medicine Info');

    // Sales History
    const historyData = salesHistory.map(h => ({
      'Date': new Date(h.sale_date).toLocaleString('sw-TZ'),
      'Invoice #': h.invoice_number,
      'Quantity Sold': h.quantity,
      'Unit Price': `TZS ${h.unit_price?.toLocaleString() || 0}`,
      'Total': `TZS ${h.subtotal?.toLocaleString() || 0}`,
      'Customer': h.customer_name || 'Walk-in',
      'Sold By': h.served_by_name || 'Unknown',
      'Payment Method': h.payment_method,
    }));

    const historySheet = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, historySheet, 'Sales History');

    XLSX.writeFile(wb, `${selectedMedicine.name}_Sales_History_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Sales history exported to Excel successfully',
      timer: 2000,
    });
  };

  const exportHistoryToPDF = () => {
    if (!selectedMedicine || salesHistory.length === 0) {
      Swal.fire('No Data', 'No sales history to export', 'warning');
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Sales History Report', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Medicine: ${selectedMedicine.name}`, 20, 30);
    doc.setFontSize(10);
    doc.text(`Generic: ${selectedMedicine.generic_name || 'N/A'}`, 20, 37);
    doc.text(`Category: ${selectedMedicine.category_name || 'N/A'}`, 20, 44);
    doc.text(`Current Stock: ${selectedMedicine.quantity_in_stock}`, 20, 51);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 58);

    // Sales History Table
    const tableData = salesHistory.map(h => [
      new Date(h.sale_date).toLocaleDateString('sw-TZ'),
      h.invoice_number,
      h.quantity,
      `TZS ${h.unit_price?.toLocaleString() || 0}`,
      `TZS ${h.subtotal?.toLocaleString() || 0}`,
      h.customer_name || 'Walk-in',
      h.served_by_name || 'Unknown',
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Invoice', 'Qty', 'Price', 'Total', 'Customer', 'Sold By']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [14, 165, 233],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      styles: {
        fontSize: 8,
        lineColor: [229, 231, 235],
        lineWidth: 0.5,
      },
    });

    // Summary
    const totalQty = salesHistory.reduce((sum, h) => sum + h.quantity, 0);
    const totalRevenue = salesHistory.reduce((sum, h) => sum + h.subtotal, 0);
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text(`Total Sales: ${salesHistory.length} transactions`, 20, finalY);
    doc.text(`Total Quantity Sold: ${totalQty}`, 20, finalY + 7);
    doc.text(`Total Revenue: TZS ${totalRevenue.toLocaleString()}`, 20, finalY + 14);

    doc.save(`${selectedMedicine.name}_Sales_History_${new Date().toISOString().split('T')[0]}.pdf`);

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Sales history exported to PDF successfully',
      timer: 2000,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Current stock levels and inventory status</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="text-left py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded w-12 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-8 w-8 bg-gray-100 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Medicine
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Current Stock
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Reorder Level
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Value
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalPages = Math.ceil(medicines.length / itemsPerPage);
                  const paginatedMedicines = medicines.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  );
                  return paginatedMedicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine);
                    const value = medicine.quantity_in_stock * (medicine.selling_price_full || 0);

                    return (
                      <tr
                        key={medicine.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          {medicine.generic_name && (
                            <div className="text-sm text-gray-500">{medicine.generic_name}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-700">{medicine.category_name}</td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">
                            {medicine.quantity_in_stock}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{medicine.reorder_level}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color} ${stockStatus.bgColor}`}
                          >
                            {stockStatus.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          TZS {value.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => viewSalesHistory(medicine)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Sales History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {!loading && medicines.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(medicines.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={medicines.length}
            />
          )}
        </div>
      )}

      {/* Sales History Modal */}
      {showHistoryModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sales History - {selectedMedicine.name}</h2>
                <p className="text-sm text-gray-600">{selectedMedicine.generic_name || ''}</p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedMedicine(null);
                  setSalesHistory([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Export Buttons */}
              {salesHistory.length > 0 && (
                <div className="mb-6 flex space-x-3">
                  <button
                    onClick={exportHistoryToExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Excel</span>
                  </button>
                  <button
                    onClick={exportHistoryToPDF}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export PDF</span>
                  </button>
                </div>
              )}

              {/* Medicine Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Taarifa za Dawa</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Current Stock</p>
                    <p className="font-semibold text-blue-900 text-xl">{selectedMedicine.quantity_in_stock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Category</p>
                    <p className="font-medium text-blue-900">{selectedMedicine.category_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Price</p>
                    <p className="font-medium text-blue-900">TZS {selectedMedicine.selling_price_full?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Total Sales</p>
                    <p className="font-semibold text-blue-900 text-xl">{salesHistory.length}</p>
                  </div>
                </div>
              </div>

              {/* Sales History Table */}
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : salesHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Hakuna historia ya mauzo kwa dawa hii</p>
                  <p className="text-sm text-gray-500 mt-1">No sales history found for this medicine</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tarehe</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice #</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kiasi</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bei</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jumla</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mteja</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aliyeuza</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesHistory.map((sale, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {new Date(sale.sale_date).toLocaleDateString('sw-TZ', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-primary-600">
                              {sale.invoice_number}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                              {sale.quantity}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              TZS {sale.unit_price?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                              TZS {sale.subtotal?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {sale.customer_name || 'Walk-in'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {sale.served_by_name || 'Unknown'}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                {sale.payment_method}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr>
                          <td colSpan={2} className="py-3 px-4 text-sm font-semibold text-gray-900">
                            JUMLA / TOTAL
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-gray-900">
                            {salesHistory.reduce((sum, s) => sum + s.quantity, 0)}
                          </td>
                          <td colSpan={2} className="py-3 px-4 text-sm font-bold text-primary-600">
                            TZS {salesHistory.reduce((sum, s) => sum + s.subtotal, 0).toLocaleString()}
                          </td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedMedicine(null);
                  setSalesHistory([]);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
