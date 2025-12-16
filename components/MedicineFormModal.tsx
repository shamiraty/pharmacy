'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  categories: any[];
  submitting: boolean;
  mode: 'add' | 'edit';
}

export default function MedicineFormModal({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  categories,
  submitting,
  mode,
}: MedicineFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      onSubmit(e);
      setCurrentStep(1);
    } else {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Steps */}
        <div className="sticky top-0 bg-gradient-to-b from-primary-700 to-primary-800 text-white px-6 py-4 rounded-t-xl z-20 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {mode === 'add' ? 'Add New Medicine' : 'Edit Medicine'}
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="relative flex justify-between">
            {/* Connecting Line */}
            <div className="absolute top-5 left-0 w-full h-1 bg-white/20 -z-0 rounded"></div>
            <div
              className="absolute top-5 left-0 h-1 bg-green-400 -z-0 rounded transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>

            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center z-10 w-24">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${currentStep > step
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step
                        ? 'bg-white border-white text-primary-700 shadow-lg scale-110'
                        : 'bg-primary-900/50 border-white/30 text-white/50 backdrop-blur-sm'
                    }`}
                >
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </div>
                <div className={`mt-2 text-xs font-semibold text-center transition-opacity duration-300 ${currentStep === step ? 'opacity-100 text-white' : 'opacity-70 text-blue-100 hidden md:block'
                  }`}>
                  {step === 1 && 'Basic Info'}
                  {step === 2 && 'Pricing'}
                  {step === 3 && 'Stock/Medical'}
                  {step === 4 && 'Additional'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-200">
                📋 Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    name="generic_name"
                    value={formData.generic_name}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-200">
                💰 Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price per Carton
                  </label>
                  <input
                    type="number"
                    name="purchase_price_per_carton"
                    value={formData.purchase_price_per_carton}
                    onChange={onInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units per Carton *
                  </label>
                  <input
                    type="number"
                    name="units_per_carton"
                    value={formData.units_per_carton}
                    onChange={onInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Dose Price *
                  </label>
                  <input
                    type="number"
                    name="selling_price_full"
                    value={formData.selling_price_full}
                    onChange={onInputChange}
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Half Dose Price
                  </label>
                  <input
                    type="number"
                    name="selling_price_half"
                    value={formData.selling_price_half}
                    onChange={onInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Single Unit Price
                  </label>
                  <input
                    type="number"
                    name="selling_price_single"
                    value={formData.selling_price_single}
                    onChange={onInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Stock & Medical Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-200">
                📦 Stock & Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity in Stock
                  </label>
                  <input
                    type="number"
                    name="quantity_in_stock"
                    value={formData.quantity_in_stock}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    name="reorder_level"
                    value={formData.reorder_level}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diseases Treated
                  </label>
                  <textarea
                    name="diseases_treated"
                    value={formData.diseases_treated}
                    onChange={onInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage Form
                  </label>
                  <input
                    type="text"
                    name="dosage_form"
                    value={formData.dosage_form}
                    onChange={onInputChange}
                    placeholder="e.g., Tablet, Syrup, Injection"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strength
                  </label>
                  <input
                    type="text"
                    name="strength"
                    value={formData.strength}
                    onChange={onInputChange}
                    placeholder="e.g., 500mg, 250mg/5ml"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Instructions
                  </label>
                  <textarea
                    name="usage_instructions"
                    value={formData.usage_instructions}
                    onChange={onInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Side Effects
                  </label>
                  <textarea
                    name="side_effects"
                    value={formData.side_effects}
                    onChange={onInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-200">
                📅 Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacture Date
                  </label>
                  <input
                    type="date"
                    name="manufacture_date"
                    value={formData.manufacture_date}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={onInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barcode
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    name="shelf_location"
                    value={formData.shelf_location}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? handleClose : handlePrevious}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              {currentStep === 1 ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>{currentStep === totalSteps ? (submitting ? 'Saving...' : `${mode === 'add' ? 'Add' : 'Update'} Medicine`) : 'Next'}</span>
                {currentStep < totalSteps && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
