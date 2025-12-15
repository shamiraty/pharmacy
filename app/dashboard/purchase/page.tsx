'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Calendar, Eye, X, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';

interface Purchase {
  id: number;
  medicine_id: number;
  medicine_name: string;
  supplier: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  purchase_date: string;
  batch_number?: string;
  expiry_date?: string;
  notes?: string;
}

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/purchases');
      const data = await response.json();

      if (data.success) {
        setPurchases(data.data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      Swal.fire('Error', 'Failed to fetch purchases', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowViewModal(true);
  };

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const paginatedPurchases = purchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalAmount = purchases.reduce((sum, p) => sum + p.total_cost, 0);
  const thisMonthPurchases = purchases.filter(p => {
    const purchaseDate = new Date(p.purchase_date);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Records</h1>
          <p className="text-gray-600 mt-1">Track medicine purchases and suppliers</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Purchase</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100 mb-1">Total Purchases</p>
              <h3 className="text-3xl font-bold">{purchases.length}</h3>
            </div>
            <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100 mb-1">This Month</p>
              <h3 className="text-3xl font-bold">{thisMonthPurchases.length}</h3>
            </div>
            <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100 mb-1">Total Amount</p>
              <h3 className="text-3xl font-bold">TZS {totalAmount.toLocaleString()}</h3>
            </div>
            <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading purchases..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Tarehe
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Dawa
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Supplier
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Kiasi
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Bei ya Jumla
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No purchase records found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-700">
                        {new Date(purchase.purchase_date).toLocaleDateString('sw-TZ')}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {purchase.medicine_name}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{purchase.supplier}</td>
                      <td className="py-4 px-6 text-gray-700">{purchase.quantity}</td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        TZS {purchase.total_cost.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleView(purchase)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && purchases.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={purchases.length}
          />
        )}
      </div>

      {/* View Purchase Modal */}
      {showViewModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Purchase Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPurchase(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Taarifa za Msingi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Dawa</p>
                    <p className="font-medium text-blue-900">{selectedPurchase.medicine_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Supplier</p>
                    <p className="font-medium text-blue-900">{selectedPurchase.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Tarehe ya Ununuzi</p>
                    <p className="font-medium text-blue-900">
                      {new Date(selectedPurchase.purchase_date).toLocaleDateString('sw-TZ')}
                    </p>
                  </div>
                  {selectedPurchase.batch_number && (
                    <div>
                      <p className="text-sm text-blue-700">Batch Number</p>
                      <p className="font-medium text-blue-900">{selectedPurchase.batch_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Kiasi na Bei</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Kiasi Kilichonunuliwa</p>
                    <p className="font-medium text-green-900 text-xl">{selectedPurchase.quantity} vitengo</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Bei kwa Kitengo</p>
                    <p className="font-medium text-green-900 text-xl">
                      TZS {selectedPurchase.unit_price?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-green-700">Jumla ya Bei</p>
                    <p className="font-bold text-green-900 text-2xl">
                      TZS {selectedPurchase.total_cost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(selectedPurchase.expiry_date || selectedPurchase.notes) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Taarifa za Ziada</h3>
                  <div className="space-y-3">
                    {selectedPurchase.expiry_date && (
                      <div>
                        <p className="text-sm text-gray-600">Tarehe ya Kumalizika</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedPurchase.expiry_date).toLocaleDateString('sw-TZ')}
                        </p>
                      </div>
                    )}
                    {selectedPurchase.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Maelezo</p>
                        <p className="font-medium text-gray-900">{selectedPurchase.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPurchase(null);
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
