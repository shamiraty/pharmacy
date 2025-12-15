'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Calendar,
  Filter,
  TrendingUp,
  Loader2,
  MoreVertical,
  FileDown,
  FileUp,
} from 'lucide-react';

import Swal from 'sweetalert2';
import { isAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import MedicineFormModal from '@/components/MedicineFormModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  category_name: string;
  manufacturer: string;
  selling_price_full: number;
  selling_price_half?: number;
  selling_price_single?: number;
  purchase_price_per_carton?: number;
  units_per_carton?: number;
  quantity_in_stock: number;
  reorder_level: number;
  expiry_date: string;
  manufacture_date?: string;
  stock_status: string;
  diseases_treated?: string;
  dosage_form?: string;
  strength?: string;
  barcode?: string;
  shelf_location?: string;
  side_effects?: string;
  usage_instructions?: string;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: '',
    month: '',
    year: '',
    status: ''
  });
  const itemsPerPage = 15;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    category_id: '',
    manufacturer: '',
    purchase_price_per_carton: '',
    units_per_carton: '',
    selling_price_full: '',
    selling_price_half: '',
    selling_price_single: '',
    quantity_in_stock: '',
    reorder_level: '10',
    diseases_treated: '',
    dosage_form: '',
    strength: '',
    usage_instructions: '',
    side_effects: '',
    manufacture_date: '',
    expiry_date: '',
    barcode: '',
    shelf_location: '',
  });

  useEffect(() => {
    setUserIsAdmin(isAdmin());
    fetchMedicines();
    fetchCategories();
  }, [searchTerm, filterCategory, filters]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/medicines?${params}`);
      const data = await response.json();

      if (data.success) {
        setMedicines(data.data);
        setSummaryStats(data.summary);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      Swal.fire('Error', 'Failed to fetch medicines', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      Swal.fire({
        title: 'Processing...',
        text: 'Adding medicine...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await logActivity('medicine_added', `Added ${formData.name}`);
        Swal.fire({
          title: 'Success!',
          text: 'Medicine added successfully',
          icon: 'success',
          confirmButtonColor: '#0ea5e9',
        });
        setShowAddModal(false);
        resetForm();
        fetchMedicines();
      } else {
        Swal.fire('Error', data.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to add medicine', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (medicine: any) => {
    setSelectedMedicine(medicine);
    setShowViewModal(true);
  };

  const handleEdit = (medicine: any) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name || '',
      generic_name: medicine.generic_name || '',
      category_id: medicine.category_id?.toString() || '',
      manufacturer: medicine.manufacturer || '',
      purchase_price_per_carton: medicine.purchase_price_per_carton?.toString() || '',
      units_per_carton: medicine.units_per_carton?.toString() || '',
      selling_price_full: medicine.selling_price_full?.toString() || '',
      selling_price_half: medicine.selling_price_half?.toString() || '',
      selling_price_single: medicine.selling_price_single?.toString() || '',
      quantity_in_stock: medicine.quantity_in_stock?.toString() || '',
      reorder_level: medicine.reorder_level?.toString() || '10',
      diseases_treated: medicine.diseases_treated || '',
      dosage_form: medicine.dosage_form || '',
      strength: medicine.strength || '',
      usage_instructions: medicine.usage_instructions || '',
      side_effects: medicine.side_effects || '',
      manufacture_date: medicine.manufacture_date?.split('T')[0] || '',
      expiry_date: medicine.expiry_date?.split('T')[0] || '',
      barcode: medicine.barcode || '',
      shelf_location: medicine.shelf_location || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      Swal.fire({
        title: 'Updating...',
        text: 'Saving changes...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('/api/medicines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedMedicine.id, ...formData }),
      });

      const data = await response.json();

      if (data.success) {
        await logActivity('medicine_updated', `Updated ${formData.name}`);
        Swal.fire({
          title: 'Success!',
          text: 'Medicine updated successfully',
          icon: 'success',
          confirmButtonColor: '#0ea5e9',
        });
        setShowEditModal(false);
        setSelectedMedicine(null);
        resetForm();
        fetchMedicines();
      } else {
        Swal.fire('Error', data.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update medicine', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Deleting...',
          text: 'Removing medicine...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await fetch(`/api/medicines?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          await logActivity('medicine_deleted', `Deleted medicine ID ${id}`);
          Swal.fire('Deleted!', 'Medicine has been deleted.', 'success');
          fetchMedicines();
        } else {
          Swal.fire('Error', data.error || 'Failed to delete medicine', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete medicine', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      generic_name: '',
      category_id: '',
      manufacturer: '',
      purchase_price_per_carton: '',
      units_per_carton: '',
      selling_price_full: '',
      selling_price_half: '',
      selling_price_single: '',
      quantity_in_stock: '',
      reorder_level: '10',
      diseases_treated: '',
      dosage_form: '',
      strength: '',
      usage_instructions: '',
      side_effects: '',
      manufacture_date: '',
      expiry_date: '',
      barcode: '',
      shelf_location: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      expired: 'bg-red-100 text-red-800',
      expiring_soon: 'bg-yellow-100 text-yellow-800',
      low_stock: 'bg-orange-100 text-orange-800',
      active: 'bg-green-100 text-green-800',
    };

    const labels = {
      expired: 'Expired',
      expiring_soon: 'Expiring Soon',
      low_stock: 'Low Stock',
      active: 'Active',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const exportToExcel = () => {
    const headers = [
      'Name', 'Generic Name', 'Category', 'Manufacturer', 'Stock',
      'Price (Full)', 'Price (Half)', 'Price (One)',
      'Purchase Price', 'Units/Carton', 'Reorder Level',
      'Expiry Date', 'Manufacture Date', 'Status',
      'Diseases Treated', 'Dosage Form', 'Strength',
      'Barcode', 'Shelf Location'
    ];

    const data = medicines.map(m => ([
      m.name,
      m.generic_name || '',
      m.category_name || '',
      m.manufacturer || '',
      m.quantity_in_stock,
      m.selling_price_full,
      m.selling_price_half || '',
      m.selling_price_single || '',
      m.purchase_price_per_carton || '',
      m.units_per_carton || '',
      m.reorder_level || '',
      new Date(m.expiry_date).toLocaleDateString(),
      m.manufacture_date ? new Date(m.manufacture_date).toLocaleDateString() : '',
      m.stock_status.replace('_', ' ').toUpperCase(),
      m.diseases_treated || '',
      m.dosage_form || '',
      m.strength || '',
      m.barcode || '',
      m.shelf_location || ''
    ]));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Set column widths
    ws['!cols'] = headers.map(() => ({ wch: 15 }));
    ws['!cols'][0] = { wch: 25 }; // Name
    ws['!cols'][1] = { wch: 20 }; // Generic
    ws['!cols'][2] = { wch: 15 }; // Category

    XLSX.utils.book_append_sheet(wb, ws, 'Medicines');
    XLSX.writeFile(wb, `Medicines_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Medicines exported to Excel successfully',
      timer: 2000,
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Medicines Inventory Report', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

    const tableData = medicines.map(m => [
      m.name,
      m.category_name || '',
      m.quantity_in_stock,
      `TZS ${m.selling_price_full.toLocaleString()}`,
      m.selling_price_half ? `TZS ${m.selling_price_half.toLocaleString()}` : '-',
      m.selling_price_single ? `TZS ${m.selling_price_single.toLocaleString()}` : '-',
      new Date(m.expiry_date).toLocaleDateString(),
      m.stock_status.replace('_', ' ').toUpperCase()
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Medicine', 'Category', 'Stock', 'Price (Full)', 'Price (Half)', 'Price (One)', 'Expiry', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'center' },
        7: { cellWidth: 20, halign: 'center' },
      },
    });

    doc.save(`medicines_report_${new Date().toISOString().split('T')[0]}.pdf`);

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Medicines report exported to PDF successfully',
      timer: 2000,
    });
  };



  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|xlsx|xls)$/)) {
      Swal.fire('Error', 'Please upload a CSV or Excel file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        let jsonData: any[] = [];

        if (file.name.endsWith('.csv')) {
          const text = data as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase().replace(/ /g, '_'));

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const obj: any = {};
            headers.forEach((h, idx) => obj[h] = values[idx]);
            jsonData.push(obj);
          }
        } else {
          // Basic XLSX support if library available, else fallback msg or simple parse
          // Assuming we rely on CSV mainly or basic parse. 
          // For now let's stick to CSV robustly as implemented before but cleaner
          // If user insists on Excel, we need 'xlsx' lib installed
          // For this snippet, I will stick to the CSV logic but structure it for the preview
        }

        // Validate and Structure Data
        const processedData = jsonData.map((row) => ({
          name: row.name || row.medicine_name || '',
          generic_name: row.generic_name || '',
          category: row.category || '',
          stock: parseInt(row.quantity_in_stock || row.stock || '0'),
          price_full: parseFloat(row.selling_price_full || row.price || '0'),
          price_half: parseFloat(row.selling_price_half || '0'),
          price_single: parseFloat(row.selling_price_single || '0'),
          purchase_price: parseFloat(row.purchase_price_per_carton || row.purchase_price || '0'),
          units: parseInt(row.units_per_carton || row.units || '1'),
          expiry: row.expiry_date || '',
          manufacture_date: row.manufacture_date || '',
          reorder_level: parseInt(row.reorder_level || '10'),
          manufacturer: row.manufacturer || '',
          diseases: row.diseases_treated || row.diseases || '',
          dosage: row.dosage_form || row.dosage || '',
          strength: row.strength || '',
          barcode: row.barcode || '',
          location: row.shelf_location || row.location || '',
          usage: row.usage_instructions || row.usage || '',
          side_effects: row.side_effects || '',
          isValid: !!(row.name || row.medicine_name) && !!(row.selling_price_full || row.price_full)
        }));

        setImportData(processedData);
        setImportStats({
          total: processedData.length,
          valid: processedData.filter((d: any) => d.isValid).length,
          invalid: processedData.filter((d: any) => !d.isValid).length
        });
        setShowImportPreview(true);
        setShowImportModal(false); // Close upload modal, open preview

      } catch (error) {
        Swal.fire('Error', 'Failed to read file', 'error');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      Swal.fire('Notice', 'For now please use CSV files. formatting: name,category,stock,price...', 'info');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImport = async () => {
    setImporting(true);
    try {
      const validData = importData.filter((d: any) => d.isValid);

      // Map category names to IDs
      const payload = validData.map(d => ({
        name: d.name,
        generic_name: d.generic_name,
        category_id: categories.find(c => c.name.toLowerCase() === d.category.toLowerCase())?.id || null,
        quantity_in_stock: d.stock,
        selling_price_full: d.price_full,
        selling_price_half: d.price_half,
        selling_price_single: d.price_single,
        purchase_price_per_carton: d.purchase_price,
        units_per_carton: d.units,
        reorder_level: d.reorder_level,
        expiry_date: d.expiry || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        manufacture_date: d.manufacture_date || null,
        manufacturer: d.manufacturer,
        diseases_treated: d.diseases,
        dosage_form: d.dosage,
        strength: d.strength,
        usage_instructions: d.usage,
        side_effects: d.side_effects,
        barcode: d.barcode,
        shelf_location: d.location
      }));

      const response = await fetch('/api/medicines/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: payload })
      });

      const res = await response.json();

      if (res.success) {
        await logActivity('bulk_import', `Imported ${res.results.added} new, Updated ${res.results.updated}`);
        Swal.fire({
          title: 'Import Report',
          html: `
                   <div class="text-left">
                     <p class="text-green-600 font-bold">Added New: ${res.results.added}</p>
                     <p class="text-blue-600 font-bold">Updated Stock: ${res.results.updated}</p>
                     <p class="text-red-600 font-bold">Failed: ${res.results.failed}</p>
                     ${res.results.errors.length > 0 ? `<div class="mt-2 text-xs text-red-500 max-h-32 overflow-auto">${res.results.errors.join('<br>')}</div>` : ''}
                   </div>
                `,
          icon: 'success'
        });
        fetchMedicines();
        setShowImportPreview(false);
        setImportData([]);
      } else {
        Swal.fire('Error', res.error, 'error');
      }

    } catch (err) {
      Swal.fire('Error', 'Import failed', 'error');
    } finally {
      setImporting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicines</h1>
          <p className="text-gray-600 mt-1">Manage your medicine inventory</p>
        </div>
        {userIsAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medicine</span>
          </button>
        )}
      </div>

      {/* Summary Dashboard */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Inventory Value</p>
                <h3 className="text-2xl font-bold text-gray-900">TZS {summaryStats.total_stock_value?.toLocaleString()}</h3>
                <p className="text-xs text-green-600 mt-1">Cost Valuation</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 text-blue-600 font-bold flex items-center justify-center">ToS</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Projected Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">TZS {summaryStats.total_selling_value?.toLocaleString()}</h3>
                <p className="text-xs text-blue-600 mt-1">If all stock sold</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Sold (Filtered)</p>
                <h3 className="text-2xl font-bold text-gray-900">{summaryStats.total_sold_qty?.toLocaleString()}</h3>
                <p className="text-xs text-purple-600 mt-1">Units Sold</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sales Value</p>
                <h3 className="text-2xl font-bold text-gray-900">TZS {summaryStats.total_sold_value?.toLocaleString()}</h3>
                <p className="text-xs text-indigo-600 mt-1">Total Revenue</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Left Side: Search & Category */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto content-center justify-end">
            <button
              onClick={() => setShowFilterModal(true)}
              className="p-2.5 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all shadow-sm"
              title="Advanced Filters"
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Actions Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                onBlur={() => setTimeout(() => setShowActionsMenu(false), 200)}
                className="p-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <MoreVertical className="w-5 h-5" />
                <span className="hidden sm:inline">Actions</span>
              </button>

              {showActionsMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-fadeIn">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export Data
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileUp className="w-4 h-4" />
                    Import Data
                  </button>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-gray-300 mx-1 hidden sm:block"></div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add Medicine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
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
                        <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <div className="h-8 w-8 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Medicine Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Expiry Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {medicines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No medicines found</p>
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const totalPages = Math.ceil(medicines.length / itemsPerPage);
                    const paginatedMedicines = medicines.slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    );
                    return paginatedMedicines.map((medicine) => (
                      <tr
                        key={medicine.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">
                              {medicine.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {medicine.generic_name}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {medicine.category_name}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            {medicine.quantity_in_stock}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          TZS {medicine.selling_price_full?.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(medicine.expiry_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(medicine.stock_status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(medicine)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {userIsAdmin ? (
                              <>
                                <button
                                  onClick={() => handleEdit(medicine)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit Medicine"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(medicine.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Medicine"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-500 italic px-2">Admin only</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Add Medicine Modal - Multistep */}
      <MedicineFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        categories={categories}
        submitting={submitting}
        mode="add"
      />

      {/* View Medicine Modal */}
      {
        showViewModal && selectedMedicine && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
              {/* Header with gradient */}
              <div className="sticky top-0 bg-gradient-to-b from-primary-700 to-primary-800 px-6 py-6 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Medicine Details</h2>
                    <p className="text-primary-100 text-sm">{selectedMedicine.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedMedicine(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <div>
                    {getStatusBadge(selectedMedicine.stock_status)}
                  </div>
                  {selectedMedicine.barcode && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Barcode: <span className="font-mono font-semibold">{selectedMedicine.barcode}</span>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-primary-600 dark:text-primary-400">📋</span>
                    </div>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Medicine Name</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{selectedMedicine.name}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Generic Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedMedicine.generic_name || 'N/A'}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedMedicine.category_name}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Manufacturer</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedMedicine.manufacturer || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-green-600 dark:text-green-400">💰</span>
                    </div>
                    Pricing Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Price (Carton)</p>
                      <p className="font-bold text-green-600 dark:text-green-400 text-xl">TZS {selectedMedicine.purchase_price_per_carton?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Units Per Carton</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-xl">{selectedMedicine.units_per_carton}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selling Price (Full)</p>
                      <p className="font-bold text-green-600 dark:text-green-400 text-xl">TZS {selectedMedicine.selling_price_full?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selling Price (Half)</p>
                      <p className="font-bold text-green-600 dark:text-green-400 text-xl">TZS {selectedMedicine.selling_price_half?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-blue-600 dark:text-blue-400">📦</span>
                    </div>
                    Stock Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Stock</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400 text-xl">{selectedMedicine.quantity_in_stock} units</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reorder Level</p>
                      <p className="font-bold text-orange-600 dark:text-orange-400 text-xl">{selectedMedicine.reorder_level} units</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expiry Date</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{new Date(selectedMedicine.expiry_date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock Status</p>
                      <div className="mt-1">{getStatusBadge(selectedMedicine.stock_status)}</div>
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                {selectedMedicine.diseases_treated && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-purple-600 dark:text-purple-400">💊</span>
                      </div>
                      Medical Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Diseases Treated</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedMedicine.diseases_treated}</p>
                      </div>
                      {selectedMedicine.dosage_form && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dosage Form</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{selectedMedicine.dosage_form}</p>
                        </div>
                      )}
                      {selectedMedicine.strength && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Strength</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{selectedMedicine.strength}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedMedicine(null);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Medicine Modal - Multistep */}
      <MedicineFormModal
        isOpen={showEditModal && selectedMedicine !== null}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMedicine(null);
          resetForm();
        }}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleUpdate}
        categories={categories}
        submitting={submitting}
        mode="edit"
      />

      {/* Import Preview Modal */}
      {
        showImportPreview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">Import Preview</h2>
                <div className="flex gap-4 text-sm font-medium">
                  <span className="text-gray-600">Total: {importStats.total}</span>
                  <span className="text-green-600">Valid: {importStats.valid}</span>
                  <span className="text-red-600">Invalid: {importStats.invalid}</span>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 sticky top-0 text-gray-700 font-semibold border-b">
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Price (Full)</th>
                      <th className="p-3">Price (Half)</th>
                      <th className="p-3">Price (Single)</th>
                      <th className="p-3">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.map((row, idx) => (
                      <tr key={idx} className={`border-b ${!row.isValid ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                        <td className="p-3">
                          {row.isValid ? <span className="text-green-500 font-bold">✓</span> : <AlertCircle className="w-4 h-4 text-red-500" />}
                        </td>
                        <td className="p-3 font-medium">{row.name || <span className="text-red-400 italic">Missing</span>}</td>
                        <td className="p-3">{row.category}</td>
                        <td className="p-3">{row.stock}</td>
                        <td className="p-3 font-semibold text-gray-900">{row.price_full ? row.price_full.toLocaleString() : <span className="text-red-400 italic">Missing</span>}</td>
                        <td className="p-3 text-gray-500">{row.price_half ? row.price_half.toLocaleString() : '-'}</td>
                        <td className="p-3 text-gray-500">{row.price_single ? row.price_single.toLocaleString() : '-'}</td>
                        <td className="p-3 text-gray-600">{row.expiry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => { setShowImportPreview(false); setImportData([]); }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={processImport}
                  disabled={importing || importStats.valid === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Confirm Import ({importStats.valid})</span>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Import Modal File Input */}
      {
        showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">Import Medicines</h2>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors bg-gray-50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileRead}
                    accept=".csv"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="font-medium text-gray-900">Click to upload CSV</p>
                    <p className="text-sm text-gray-500 mt-2">Format: .csv (Comma Separated)</p>
                  </label>
                </div>

                <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-800 mb-1">Required Format:</p>
                  <code className="block bg-white p-2 rounded border border-blue-100 text-xs text-blue-600 break-words whitespace-pre-wrap font-mono">
                    name, category, stock, price_full, price_half, price_single, expiry_date, manufacturer, purchase_price, units_per_carton, reorder_level, diseases_treated, dosage_form, strength, barcode, shelf_location
                  </code>
                  <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                    * price_half & price_single are optional but recommended for breaking bulk.
                  </p>
                </div>

                <button
                  onClick={() => setShowImportModal(false)}
                  className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Export Modal */}
      {
        showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Medicines</h2>
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
                  <span>Export to Excel (CSV)</span>
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
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Advanced Filter Modal */}
      {
        showFilterModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
                    <p className="text-sm text-gray-500">Refine your medicine list</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <Trash2 className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Quick Date Shortcuts */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> Date Period
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'This Month', type: 'month' },
                      { label: 'Last Month', type: 'prev_month' },
                      { label: 'This Year', type: 'year' },
                      { label: 'All Time', type: 'all' }
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => {
                          const now = new Date();
                          if (btn.type === 'month') {
                            setFilters({ ...filters, month: (now.getMonth() + 1).toString(), year: now.getFullYear().toString(), startDate: '', endDate: '' });
                          } else if (btn.type === 'prev_month') {
                            const prev = new Date();
                            prev.setMonth(now.getMonth() - 1);
                            setFilters({ ...filters, month: (prev.getMonth() + 1).toString(), year: prev.getFullYear().toString(), startDate: '', endDate: '' });
                          } else if (btn.type === 'year') {
                            setFilters({ ...filters, year: now.getFullYear().toString(), month: '', startDate: '', endDate: '' });
                          } else {
                            setFilters({ ...filters, startDate: '', endDate: '', month: '', year: '' });
                          }
                        }}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Quarters & Halves */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {[
                      { label: 'Q1 (Jan-Mar)', m: '1', m2: '3' },
                      { label: 'Q2 (Apr-Jun)', m: '4', m2: '6' },
                      { label: 'Q3 (Jul-Sep)', m: '7', m2: '9' },
                      { label: 'Q4 (Oct-Dec)', m: '10', m2: '12' },
                    ].map(q => (
                      <button
                        key={q.label}
                        onClick={() => {
                          const year = new Date().getFullYear();
                          // Set specific start/end dates for range
                          const start = new Date(year, parseInt(q.m) - 1, 1).toISOString().split('T')[0];
                          const end = new Date(year, parseInt(q.m2), 0).toISOString().split('T')[0];
                          setFilters({ ...filters, startDate: start, endDate: end, month: '', year: '' });
                        }}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status & Price Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Status */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> Stock Status
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Active', 'Low Stock', 'Expired', 'Expiring Soon'].map(status => (
                        <label key={status} className={`
                        flex items-center p-3 border rounded-xl cursor-pointer transition-all
                        ${filters.status === status.toLowerCase().replace(' ', '_')
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300'}
                      `}>
                          <input
                            type="radio"
                            name="status"
                            className="hidden"
                            checked={filters.status === status.toLowerCase().replace(' ', '_')}
                            onChange={() => setFilters({ ...filters, status: status.toLowerCase().replace(' ', '_') })}
                          />
                          <span className="text-sm font-medium">{status}</span>
                        </label>
                      ))}
                      <label className={`
                        flex items-center p-3 border rounded-xl cursor-pointer transition-all col-span-2
                        ${filters.status === ''
                          ? 'border-gray-800 bg-gray-50 ring-1 ring-gray-800'
                          : 'border-gray-200 hover:border-gray-300'}
                      `}>
                        <input
                          type="radio"
                          name="status"
                          className="hidden"
                          checked={filters.status === ''}
                          onChange={() => setFilters({ ...filters, status: '' })}
                        />
                        <span className="text-sm font-medium text-center w-full">Show All Statuses</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-green-600">TZS</span> Price Range
                    </h3>
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Min</span>
                        <input
                          type="number"
                          value={filters.minPrice}
                          onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="0"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Max</span>
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Any"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exact Dates */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 bg-gray-50 inline-block px-3 py-1 rounded-full">Custom Date Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">From Date</label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">To Date</label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50 rounded-b-2xl mt-auto">
                <button
                  onClick={() => setFilters({
                    minPrice: '', maxPrice: '', startDate: '', endDate: '', month: '', year: '', status: ''
                  })}
                  className="text-red-600 font-medium hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Reset All Filters
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      fetchMedicines();
                      setShowFilterModal(false);
                    }}
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }


    </div >
  );
}
