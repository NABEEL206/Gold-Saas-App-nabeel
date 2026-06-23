// src/pages/Items/ItemEdit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Package,
  Gem,
  Scale,
  Sparkles,
  DollarSign,
  ShoppingCart,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useItemEdit } from '../../hooks/items/useItemEdit';

// ==================== CONSTANTS ====================

const ITEM_TYPES = [
  { value: 'Gold', label: 'Gold' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Diamond', label: 'Diamond' },
  { value: 'Platinum', label: 'Platinum' },
  { value: 'Other', label: 'Other' },
];

const CATEGORIES = [
  { value: 'Rings', label: 'Rings' },
  { value: 'Necklaces', label: 'Necklaces' },
  { value: 'Earrings', label: 'Earrings' },
  { value: 'Bracelets', label: 'Bracelets' },
  { value: 'Pendants', label: 'Pendants' },
  { value: 'Chains', label: 'Chains' },
  { value: 'Bangles', label: 'Bangles' },
  { value: 'Sets', label: 'Sets' },
  { value: 'Other', label: 'Other' },
];

const METAL_TYPES = [
  { value: 'Gold', label: 'Gold' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Platinum', label: 'Platinum' },
  { value: 'Palladium', label: 'Palladium' },
  { value: 'Rhodium', label: 'Rhodium' },
  { value: 'Other', label: 'Other' },
];

const PURITIES = [
  { value: '24K', label: '24K (99.9%)' },
  { value: '22K', label: '22K (91.6%)' },
  { value: '18K', label: '18K (75%)' },
  { value: '14K', label: '14K (58.5%)' },
  { value: '10K', label: '10K (41.7%)' },
  { value: '999', label: '999 (Fine Silver)' },
  { value: '958', label: '958 (Britannia Silver)' },
  { value: '925', label: '925 (Sterling Silver)' },
  { value: '900', label: '900 (Coin Silver)' },
  { value: '950', label: '950 (Platinum)' },
  { value: '850', label: '850 (Platinum)' },
];

const UNITS = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'ct', label: 'Carats (ct)' },
  { value: 'mg', label: 'Milligrams (mg)' },
  { value: 'pc', label: 'Pieces (pc)' },
];

const GST_PERCENTAGES = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18%' },
  { value: '28', label: '28%' },
];

const CURRENCIES = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'AED', label: 'AED' },
];

const MC_TYPES = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'percentage', label: 'Percentage' },
];

// ==================== COMPONENTS ====================

// Section Component
const Section = ({ 
  id, 
  title, 
  icon: Icon, 
  children, 
  required = false, 
  tooltip = '',
  isExpanded,
  onToggle,
}: { 
  id: string; 
  title: string; 
  icon: any; 
  children: React.ReactNode;
  required?: boolean;
  tooltip?: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {required && <span className="text-xs text-red-500 ml-1">*</span>}
          {tooltip && (
            <div className="group relative">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

// Input Field Component
const InputField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  required = false, 
  error, 
  step, 
  options,
  readOnly = false,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  error?: string;
  step?: string;
  options?: Array<{ value: string; label: string }>;
  readOnly?: boolean;
  disabled?: boolean;
}) => {
  const baseClasses = `w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
    rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent 
    text-sm transition-colors ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`;

  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`${baseClasses} resize-y`}
          disabled={disabled}
          readOnly={readOnly}
        />
      ) : type === 'select' && options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={baseClasses}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          className={baseClasses}
          disabled={disabled}
          readOnly={readOnly}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Toggle Checkbox Component
const ToggleCheckbox = ({ 
  label, 
  checked, 
  onChange, 
  description 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  description?: string;
}) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
      />
      <div>
        <label className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const ItemEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const {
    loading,
    saving,
    formData,
    errors,
    item,
    imageUrls,
    expandedSections,
    showSalesInfo,
    showDescription,
    showMRP,
    fetchItem,
    updateItem,
    deleteItem,
    toggleSection,
    toggleSalesInfo,
    handleInputChange,
    handleManualChange,
    handleImageUpload,
    removeImage,
    validateForm,
  } = useItemEdit();

  // Local states
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showMetalInfo, setShowMetalInfo] = useState(false);
  const [showWeightInfo, setShowWeightInfo] = useState(false);
  const [showDiamondInfo, setShowDiamondInfo] = useState(false);
  const [showPricingInfo, setShowPricingInfo] = useState(false);
  const [showInventoryInfo, setShowInventoryInfo] = useState(false);

  // Fetch item on mount
  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id, fetchItem]);

  // Set conditional field states based on item data
  useEffect(() => {
    if (item) {
      setShowMetalInfo(!!item.metalType || !!item.purity);
      setShowWeightInfo(!!item.grossWeight || !!item.netWeight || !!item.stoneWeight);
      setShowDiamondInfo(!!item.diamondPieces || !!item.caratWeight);
      setShowPricingInfo(!!item.mcType || !!item.mcValue || !!item.goldRate);
      setShowInventoryInfo(!!item.openingStock || !!item.hsnCode || !!item.gstPercentage);
    }
  }, [item]);

  // ==================== HANDLERS ====================

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        const firstError = Object.keys(errors)[0];
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (element as HTMLElement).focus();
        }
        return;
      }

      try {
        await updateItem();
        navigate('/items');
      } catch (error) {
        console.error('Error updating item:', error);
      }
    },
    [validateForm, errors, updateItem, navigate]
  );

  const handleDelete = async () => {
    if (!item) return;
    if (window.confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
      setDeleteLoading(true);
      try {
        await deleteItem();
        navigate('/items');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleNavigateBack = () => navigate('/items');
  const handleNavigateCancel = () => navigate('/items');
  const handleViewItem = () => {
    if (item) {
      navigate(`/items/${item.id}`);
    }
  };

  // ==================== RENDER ====================

  // Loading State
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading item..." />
      </div>
    );
  }

  // Error State
  if (!item) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700">Item Not Found</h3>
          <p className="text-sm text-red-600 mt-1">The item you are trying to edit does not exist.</p>
          <button
            onClick={() => navigate('/items')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleNavigateBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Editing: {item.itemCode} - {item.itemName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewItem}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View Item
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
          <button
            onClick={handleNavigateCancel}
            disabled={saving}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Update Item'}
          </button>
        </div>
      </div>

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <Section
          id="basic"
          title="Basic Information"
          icon={Package}
          required
          isExpanded={expandedSections.includes('basic')}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Item Code"
              name="itemCode"
              type="text"
              value={formData.itemCode}
              onChange={handleManualChange}
              placeholder="Enter item code"
              required
              error={errors.itemCode}
              disabled={saving}
            />
            <InputField
              label="Item Name"
              name="itemName"
              type="text"
              value={formData.itemName}
              onChange={handleManualChange}
              placeholder="Enter item name"
              required
              error={errors.itemName}
              disabled={saving}
            />
            <InputField
              label="Item Type"
              name="itemType"
              type="select"
              value={formData.itemType}
              onChange={handleInputChange}
              required
              error={errors.itemType}
              options={ITEM_TYPES}
              disabled={saving}
            />
            <InputField
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleInputChange}
              required
              error={errors.category}
              options={CATEGORIES}
              disabled={saving}
            />
            <InputField
              label="Brand"
              name="brand"
              type="text"
              value={formData.brand}
              onChange={handleManualChange}
              placeholder="Enter brand name"
              disabled={saving}
            />
            <InputField
              label="Design Code"
              name="designCode"
              type="text"
              value={formData.designCode}
              onChange={handleManualChange}
              placeholder="Enter design code"
              disabled={saving}
            />
          </div>
        </Section>

        {/* Metal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900">Metal Information</h2>
              </div>
              <ToggleCheckbox
                label="Include Metal Details"
                checked={showMetalInfo}
                onChange={setShowMetalInfo}
                description="Enable to add metal type and purity information"
              />
            </div>
          </div>

          {showMetalInfo && (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Metal Type"
                  name="metalType"
                  type="select"
                  value={formData.metalType}
                  onChange={handleInputChange}
                  required={showMetalInfo}
                  error={errors.metalType}
                  options={METAL_TYPES}
                  disabled={saving}
                />
                <InputField
                  label="Purity/Karat"
                  name="purity"
                  type="select"
                  value={formData.purity}
                  onChange={handleInputChange}
                  required={showMetalInfo}
                  error={errors.purity}
                  options={PURITIES}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>

        {/* Weight Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900">Weight Information</h2>
              </div>
              <ToggleCheckbox
                label="Include Weight Details"
                checked={showWeightInfo}
                onChange={setShowWeightInfo}
                description="Enable to add weight measurements"
              />
            </div>
          </div>

          {showWeightInfo && (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField
                  label="Gross Weight"
                  name="grossWeight"
                  type="number"
                  value={formData.grossWeight}
                  onChange={handleManualChange}
                  placeholder="0.00"
                  step="0.01"
                  required={showWeightInfo}
                  error={errors.grossWeight}
                  disabled={saving}
                />
                <InputField
                  label="Stone Weight"
                  name="stoneWeight"
                  type="number"
                  value={formData.stoneWeight}
                  onChange={handleManualChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={saving}
                />
                <InputField
                  label="Net Weight"
                  name="netWeight"
                  type="number"
                  value={formData.netWeight}
                  onChange={handleManualChange}
                  placeholder="0.00"
                  step="0.01"
                  required={showWeightInfo}
                  error={errors.netWeight}
                  disabled={saving}
                />
                <InputField
                  label="Unit"
                  name="unit"
                  type="select"
                  value={formData.unit}
                  onChange={handleManualChange}
                  options={UNITS}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>

        {/* Diamond Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900">Diamond Information</h2>
              </div>
              <ToggleCheckbox
                label="Include Diamond Details"
                checked={showDiamondInfo}
                onChange={setShowDiamondInfo}
                description="Enable to add diamond specifications"
              />
            </div>
          </div>

          {showDiamondInfo && (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Pieces"
                  name="diamondPieces"
                  type="number"
                  value={formData.diamondPieces}
                  onChange={handleManualChange}
                  placeholder="0"
                  disabled={saving}
                />
                <InputField
                  label="Carat Weight"
                  name="caratWeight"
                  type="number"
                  value={formData.caratWeight}
                  onChange={handleManualChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>

        {/* Making Charge & Pricing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900">Making Charge & Pricing</h2>
              </div>
              <ToggleCheckbox
                label="Include Pricing Details"
                checked={showPricingInfo}
                onChange={setShowPricingInfo}
                description="Enable to add making charge and pricing"
              />
            </div>
          </div>

          {showPricingInfo && (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField
                  label="MC Type"
                  name="mcType"
                  type="select"
                  value={formData.mcType}
                  onChange={handleInputChange}
                  options={MC_TYPES}
                  disabled={saving}
                />
                <InputField
                  label="MC Value"
                  name="mcValue"
                  type="number"
                  value={formData.mcValue}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={saving}
                />
                <InputField
                  label="Gold Rate"
                  name="goldRate"
                  type="number"
                  value={formData.goldRate}
                  onChange={handleInputChange}
                  placeholder="Enter gold rate"
                  step="0.01"
                  disabled={saving}
                />
                <InputField
                  label="Selling Price"
                  name="sellingPrice"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={handleManualChange}
                  placeholder="Enter selling price"
                  step="0.01"
                  required={showPricingInfo}
                  error={errors.sellingPrice}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sales Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900">Sales Information</h2>
              </div>
              <button
                type="button"
                onClick={toggleSalesInfo}
                disabled={saving}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                {showSalesInfo ? (
                  <>
                    <ToggleRight className="h-5 w-5 text-amber-500" />
                    <span className="text-amber-500">Enabled</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400">Disabled</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Enable to add sales-related information</p>
          </div>

          {showSalesInfo && (
            <div className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      {formData.currency || 'INR'}
                    </span>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleManualChange}
                      placeholder="0.00"
                      step="0.01"
                      disabled={saving}
                      className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleManualChange}
                      disabled={saving}
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-sm border-0 bg-transparent focus:ring-0 disabled:opacity-50"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.value} value={curr.value}>
                          {curr.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">MRP</label>
                    <button
                      type="button"
                      onClick={() => toggleSection('mrp')}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showMRP ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      {showMRP ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showMRP && (
                    <input
                      type="number"
                      name="mrp"
                      value={formData.mrp}
                      onChange={handleManualChange}
                      placeholder="Enter MRP"
                      step="0.01"
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <button
                    type="button"
                    onClick={() => toggleSection('description')}
                    disabled={saving}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showDescription ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {showDescription ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showDescription && (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleManualChange}
                    placeholder="Enter item description..."
                    rows={3}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-y disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inventory & Tax */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900">Inventory & Tax</h2>
              </div>
              <ToggleCheckbox
                label="Include Inventory Details"
                checked={showInventoryInfo}
                onChange={setShowInventoryInfo}
                description="Enable to add stock and tax information"
              />
            </div>
          </div>

          {showInventoryInfo && (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField
                  label="Opening Stock"
                  name="openingStock"
                  type="number"
                  value={formData.openingStock}
                  onChange={handleManualChange}
                  placeholder="0"
                  disabled={saving}
                />
                <InputField
                  label="Reorder Level"
                  name="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={handleManualChange}
                  placeholder="0"
                  disabled={saving}
                />
                <InputField
                  label="HSN Code"
                  name="hsnCode"
                  type="text"
                  value={formData.hsnCode}
                  onChange={handleManualChange}
                  placeholder="Enter HSN code"
                  required={showInventoryInfo}
                  error={errors.hsnCode}
                  disabled={saving}
                />
                <InputField
                  label="GST %"
                  name="gstPercentage"
                  type="select"
                  value={formData.gstPercentage}
                  onChange={handleManualChange}
                  options={GST_PERCENTAGES}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-semibold text-gray-900">Image Upload</h2>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${!saving ? 'hover:border-amber-500' : 'opacity-50'} transition-colors`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={saving}
              />
              <label htmlFor="image-upload" className={`cursor-pointer flex flex-col items-center gap-3 ${saving ? 'cursor-not-allowed' : ''}`}>
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                </div>
              </label>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Item ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={saving}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleNavigateCancel}
            disabled={saving}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Updating...' : 'Update Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemEdit;