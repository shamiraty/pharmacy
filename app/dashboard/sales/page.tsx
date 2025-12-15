'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
  X,
  Printer,
  Download,
} from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCurrentUserId } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  selling_price_full: number;
  selling_price_half: number;
  selling_price_single: number;
  quantity_in_stock: number;
  diseases_treated: string;
  purchase_price_per_unit: number;
  expiry_date: string;
}

interface CartItem {
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  unit_type: 'full' | 'half' | 'single';
  unit_price: number;
  total_price: number;
  cost_price: number;
}

export default function SalesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchTerm, diseaseSearch, medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/medicines');
      const data = await response.json();

      if (data.success) {
        const activeMedicines = data.data.filter(
          (m: Medicine) =>
            m.quantity_in_stock > 0 &&
            new Date(m.expiry_date) > new Date()
        );
        setMedicines(activeMedicines);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (diseaseSearch) {
      filtered = filtered.filter((m) =>
        m.diseases_treated?.toLowerCase().includes(diseaseSearch.toLowerCase())
      );
    }

    setFilteredMedicines(filtered);
  };

  const addToCart = (medicine: Medicine, unitType: 'full' | 'half' | 'single') => {
    let unitPrice = 0;

    switch (unitType) {
      case 'full':
        unitPrice = medicine.selling_price_full;
        break;
      case 'half':
        unitPrice = medicine.selling_price_half || medicine.selling_price_full / 2;
        break;
      case 'single':
        unitPrice = medicine.selling_price_single || medicine.selling_price_full;
        break;
    }

    const existingItemIndex = cart.findIndex(
      (item) => item.medicine_id === medicine.id && item.unit_type === unitType
    );

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      newCart[existingItemIndex].total_price =
        newCart[existingItemIndex].quantity * unitPrice;
      setCart(newCart);
    } else {
      const newItem: CartItem = {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        quantity: 1,
        unit_type: unitType,
        unit_price: unitPrice,
        total_price: unitPrice,
        cost_price: medicine.purchase_price_per_unit || 0,
      };
      setCart([...cart, newItem]);
    }

    Swal.fire({
      icon: 'success',
      title: 'Added!',
      text: `${medicine.name} added to cart`,
      timer: 1000,
      showConfirmButton: false,
    });
  };

  const updateQuantity = (index: number, change: number) => {
    const newCart = [...cart];
    newCart[index].quantity += change;

    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].total_price = newCart[index].quantity * newCart[index].unit_price;
    }

    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    const total = calculateTotal();
    return paid - total;
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const timestamp = date.getTime();
    return `INV-${timestamp}`;
  };

  const processSale = async () => {
    if (cart.length === 0) {
      Swal.fire('Error', 'Cart is empty', 'error');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;

    if (paid < total) {
      Swal.fire('Error', 'Amount paid is less than total', 'error');
      return;
    }

    try {
      setProcessing(true);

      // Show loading alert
      Swal.fire({
        title: 'Processing Sale...',
        text: 'Please wait while we process your transaction',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const invoiceNumber = generateInvoiceNumber();

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
          items: cart,
          total_amount: total,
          amount_paid: paid,
          payment_method: paymentMethod,
          served_by: getCurrentUserId(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Log activity
        await logActivity('sale_completed', `Sale ${invoiceNumber} - TZS ${total.toLocaleString()}`);

        setCompletedSale({
          invoiceNumber,
          customerName,
          customerPhone,
          items: [...cart],
          total,
          paid,
          change: paid - total
        });

        Swal.close(); // Close the loading alert
        setShowInvoicePreview(true);
        // Reset calls will be handled on modal close
      } else {
        Swal.fire('Error', data.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to process sale', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const printInvoice = (invoiceNumber: string, total: number, paid: number) => {
    try {
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
      doc.text(`Invoice #: ${invoiceNumber}`, 20, 50);
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}`, 20, 56);

      doc.setFont('helvetica', 'normal');
      doc.text(`Customer: ${customerName || 'Walk-in Customer'}`, 20, 62);
      if (customerPhone) {
        doc.text(`Phone: ${customerPhone}`, 20, 68);
      }

      // Items Table
      autoTable(doc, {
        startY: 75,
        head: [['Medicine', 'Quantity', 'Type', 'Unit Price', 'Total']],
        body: cart.map((item) => [
          item.medicine_name,
          item.quantity,
          item.unit_type,
          `TZS ${item.unit_price.toLocaleString()}`,
          `TZS ${item.total_price.toLocaleString()}`,
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
          0: { cellWidth: 60 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 40, halign: 'right' },
          4: { cellWidth: 40, halign: 'right' },
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
      doc.text(`TZS ${total.toLocaleString()}`, 185, summaryY, { align: 'right' });

      summaryY += 7;
      doc.text('PAID:', summaryX, summaryY);
      doc.text(`TZS ${paid.toLocaleString()}`, 185, summaryY, { align: 'right' });

      summaryY += 7;
      doc.setLineWidth(0.5);
      doc.line(summaryX, summaryY - 2, 190, summaryY - 2);

      doc.setFontSize(12);
      doc.text('CHANGE:', summaryX, summaryY + 3);
      doc.text(`TZS ${(paid - total).toLocaleString()}`, 185, summaryY + 3, { align: 'right' });

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

      // Print Logic
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to generate PDF', 'error');
    }
  };

  const downloadInvoice = (invoiceNumber: string, total: number, paid: number) => {
    try {
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
      doc.text(`Invoice #: ${invoiceNumber}`, 20, 50);
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}`, 20, 56);

      doc.setFont('helvetica', 'normal');
      doc.text(`Customer: ${customerName || 'Walk-in Customer'}`, 20, 62);
      if (customerPhone) {
        doc.text(`Phone: ${customerPhone}`, 20, 68);
      }

      // Items Table
      autoTable(doc, {
        startY: 75,
        head: [['Medicine', 'Quantity', 'Type', 'Unit Price', 'Total']],
        body: cart.map((item) => [
          item.medicine_name,
          item.quantity,
          item.unit_type,
          `TZS ${item.unit_price.toLocaleString()}`,
          `TZS ${item.total_price.toLocaleString()}`,
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
          0: { cellWidth: 60 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 40, halign: 'right' },
          4: { cellWidth: 40, halign: 'right' },
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
      doc.text(`TZS ${total.toLocaleString()}`, 185, summaryY, { align: 'right' });

      summaryY += 7;
      doc.text('PAID:', summaryX, summaryY);
      doc.text(`TZS ${paid.toLocaleString()}`, 185, summaryY, { align: 'right' });

      summaryY += 7;
      doc.setLineWidth(0.5);
      doc.line(summaryX, summaryY - 2, 190, summaryY - 2);

      doc.setFontSize(12);
      doc.text('CHANGE:', summaryX, summaryY + 3);
      doc.text(`TZS ${(paid - total).toLocaleString()}`, 185, summaryY + 3, { align: 'right' });

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

      doc.save(`${invoiceNumber}.pdf`);

      Swal.fire({
        title: 'Success!',
        text: 'Invoice downloaded successfully',
        icon: 'success',
        timer: 2000,
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to generate PDF', 'error');
    }
  };

  const generateInvoiceHTML = (invoiceNumber: string, total: number, paid: number) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #0ea5e9; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0ea5e9; color: white; }
          .totals { text-align: right; margin-top: 20px; }
          .totals div { margin: 5px 0; }
          .footer { text-align: center; margin-top: 30px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PharmaCare</h1>
          <p>Pharmacy Management System</p>
        </div>

        <div class="info">
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Customer:</strong> ${customerName || 'Walk-in Customer'}</p>
          ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Type</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${cart
        .map(
          (item) => `
              <tr>
                <td>${item.medicine_name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit_type}</td>
                <td>TZS ${item.unit_price.toLocaleString()}</td>
                <td>TZS ${item.total_price.toLocaleString()}</td>
              </tr>
            `
        )
        .join('')}
          </tbody>
        </table>

        <div class="totals">
          <div><strong>Total:</strong> TZS ${total.toLocaleString()}</div>
          <div><strong>Paid:</strong> TZS ${paid.toLocaleString()}</div>
          <div><strong>Change:</strong> TZS ${calculateChange().toLocaleString()}</div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-600 mt-1">Process medicine sales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Medicine Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by medicine name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by disease..."
                  value={diseaseSearch}
                  onChange={(e) => setDiseaseSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {diseaseSearch && (
                  <button
                    onClick={() => setDiseaseSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Medicines Grid */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <span>Available Medicines ({filteredMedicines.length})</span>
              {filteredMedicines.length === 0 && searchTerm && (
                <span className="text-sm text-red-500 font-normal">No results</span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                      </div>
                      <div className="ml-3">
                        <div className="h-6 w-16 bg-gray-100 rounded"></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-auto">
                      <div className="h-12 bg-gray-100 rounded-lg"></div>
                      <div className="h-12 bg-gray-50 rounded-lg border border-gray-100"></div>
                      <div className="h-12 bg-gray-50 rounded-lg border border-gray-100"></div>
                    </div>
                  </div>
                ))
              ) : filteredMedicines.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <div className="text-gray-300 text-5xl mb-4">💊</div>
                  <p className="text-gray-500 font-medium">No medicines found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                            {medicine.name}
                          </h4>
                          {medicine.generic_name && (
                            <p className="text-sm text-gray-500 mt-1 font-medium">{medicine.generic_name}</p>
                          )}
                        </div>
                        <div className="ml-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${medicine.quantity_in_stock > 20
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : medicine.quantity_in_stock > 10
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            {medicine.quantity_in_stock} stock
                          </span>
                        </div>
                      </div>

                      {medicine.diseases_treated && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                          <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 line-clamp-1 flex-1">
                            {medicine.diseases_treated}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 mt-auto">
                        <button
                          onClick={() => addToCart(medicine, 'full')}
                          className="flex flex-col items-center justify-center p-2 rounded-lg bg-gradient-to-b from-primary-700 to-primary-800 text-white hover:from-primary-800 hover:to-primary-900 active:from-primary-900 active:to-black transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <span className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Full</span>
                          <span className="text-xs font-bold">
                            {medicine.selling_price_full.toLocaleString()}
                          </span>
                        </button>

                        {medicine.selling_price_half ? (
                          <button
                            onClick={() => addToCart(medicine, 'half')}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-gradient-to-b from-primary-700 to-primary-800 text-white hover:from-primary-800 hover:to-primary-900 active:from-primary-900 active:to-black transition-all duration-200 shadow-md hover:shadow-lg opacity-90"
                          >
                            <span className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Half</span>
                            <span className="text-xs font-bold">
                              {medicine.selling_price_half.toLocaleString()}
                            </span>
                          </button>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed">
                            <span className="text-xs">-</span>
                          </div>
                        )}

                        {medicine.selling_price_single ? (
                          <button
                            onClick={() => addToCart(medicine, 'single')}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-gradient-to-b from-primary-700 to-primary-800 text-white hover:from-primary-800 hover:to-primary-900 active:from-primary-900 active:to-black transition-all duration-200 shadow-md hover:shadow-lg opacity-90"
                          >
                            <span className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Unit</span>
                            <span className="text-xs font-bold">
                              {medicine.selling_price_single.toLocaleString()}
                            </span>
                          </button>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed">
                            <span className="text-xs">-</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Cart & Checkout */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Phone Number (Optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Cart */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="bg-primary-100 p-2 rounded-lg mr-2">
                  <ShoppingCart className="w-5 h-5 text-primary-600" />
                </div>
                <span>Cart <span className="text-primary-600">({cart.length})</span></span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-red-600 text-sm hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-4 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="text-gray-500 font-medium">Cart is empty</p>
                  <p className="text-sm text-gray-400 mt-1">Add medicines to start</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">
                        {item.medicine_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.unit_type === 'full' ? 'bg-blue-100 text-blue-700' :
                          item.unit_type === 'half' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {item.unit_type}
                        </span>
                        <span className="text-xs text-gray-600">
                          @ TZS {item.unit_price.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-primary-600 mt-1">
                        TZS {item.total_price.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 font-bold text-gray-900 bg-gray-100 rounded-lg min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="border-t-2 border-gray-300 pt-4 space-y-3">
              {/* Grand Total Display */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white shadow-lg">
                <div className="text-sm font-medium opacity-90">Total Amount</div>
                <div className="text-3xl font-bold mt-1">
                  TZS {calculateTotal().toLocaleString()}
                </div>
                {cart.length > 0 && (
                  <div className="text-xs opacity-75 mt-1">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
                  </div>
                )}
              </div>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile_money">Mobile Money</option>
              </select>

              <input
                type="number"
                placeholder="Amount Paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {amountPaid && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Change:</span>
                  <span
                    className={`font-medium ${calculateChange() < 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                  >
                    TZS {calculateChange().toLocaleString()}
                  </span>
                </div>
              )}

              <button
                onClick={processSale}
                disabled={cart.length === 0 || processing || calculateChange() < 0}
                className="w-full px-4 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Sale...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-5 h-5" />
                    <span>Complete Sale</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview Modal */
        showInvoicePreview && completedSale && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 p-1.5 rounded-full"><Printer className="w-5 h-5" /></span>
                    Sale Completed
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Invoice #{completedSale.invoiceNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setShowInvoicePreview(false);
                    setCart([]);
                    setCustomerName('');
                    setCustomerPhone('');
                    setAmountPaid('');
                    fetchMedicines();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Invoice Preview Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
                <div className="bg-white p-8 shadow-lg border border-gray-200 mx-auto max-w-2xl min-h-[500px] text-gray-900">

                  {/* Invoice Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-wider text-gray-900">PHARMCARE MANAGEMENT SYSTEM</h1>
                    <div className="text-sm text-gray-600 mt-2">
                      <p>Location: Dar es Salaam, Tanzania</p>
                      <p>Phone: +255 123 456 789 | Email: info@pharmcare.com</p>
                    </div>
                    <div className="border-b-2 border-gray-100 my-4 w-full"></div>
                    <h2 className="text-xl font-bold text-gray-800">SALES INVOICE</h2>
                  </div>

                  {/* Meta Info */}
                  <div className="flex justify-between mb-8 text-sm">
                    <div>
                      <p className="font-bold text-gray-700">Bill To:</p>
                      <p className="text-gray-900 font-medium">{completedSale.customerName || 'Walk-in Customer'}</p>
                      <p className="text-gray-600">{completedSale.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p><span className="font-bold text-gray-700">Invoice #:</span> {completedSale.invoiceNumber}</p>
                      <p><span className="font-bold text-gray-700">Date:</span> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="mb-8">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-800 text-gray-900">
                          <th className="py-2 text-left">Medicine</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Unit Price</th>
                          <th className="py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {completedSale.items.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-3">{item.medicine_name} <span className="text-xs text-gray-500">({item.unit_type})</span></td>
                            <td className="py-3 text-center">{item.quantity}</td>
                            <td className="py-3 text-right">TZS {item.unit_price.toLocaleString()}</td>
                            <td className="py-3 text-right font-medium">TZS {item.total_price.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-1/2 space-y-3">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-700">SUBTOTAL:</span>
                        <span className="font-medium">TZS {completedSale.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-700">PAID:</span>
                        <span className="font-medium">TZS {completedSale.paid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="font-bold text-gray-900 text-lg">CHANGE:</span>
                        <span className="font-bold text-gray-900 text-lg">TZS {completedSale.change.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
                    <p className="italic">Thank you for your business!</p>
                    <p>PharmaCare Management System - All Rights Reserved</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadInvoice(completedSale.invoiceNumber, completedSale.total, completedSale.paid)}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => printInvoice(completedSale.invoiceNumber, completedSale.total, completedSale.paid)}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-200"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setShowInvoicePreview(false);
                    setCart([]);
                    setCustomerName('');
                    setCustomerPhone('');
                    setAmountPaid('');
                    fetchMedicines();
                  }}
                  className="col-span-2 text-center text-gray-500 hover:text-gray-700 text-sm font-medium py-2"
                >
                  Close & New Sale
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
