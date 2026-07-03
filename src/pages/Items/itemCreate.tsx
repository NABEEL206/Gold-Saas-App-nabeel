// src/pages/Items/ItemCreate.tsx
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Truck,
  Plus,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../components/common/Searchabledropdown';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useItemCreate } from '../../hooks/items/useItemCreate';
import { useToastAndConfirm } from '../../hooks/ToastConfirmModal/useToastAndConfirm';

// Constants with proper types for SearchableDropdown
const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: 'Rings', label: '💍 Rings', group: 'Jewelry' },
  { value: 'Necklaces', label: '📿 Necklaces', group: 'Jewelry' },
  { value: 'Earrings', label: '💎 Earrings', group: 'Jewelry' },
  { value: 'Bracelets', label: '📿 Bracelets', group: 'Jewelry' },
  { value: 'Pendants', label: '🔱 Pendants', group: 'Jewelry' },
  { value: 'Chains', label: '⛓️ Chains', group: 'Jewelry' },
  { value: 'Bangles', label: '🔄 Bangles', group: 'Jewelry' },
  { value: 'Sets', label: '📦 Sets', group: 'Jewelry' },
  { value: 'Other', label: '📌 Other', group: 'Jewelry' },
];

const METAL_TYPE_OPTIONS: DropdownOption[] = [
  { value: 'Gold', label: '🥇 Gold', group: 'Precious Metals' },
  { value: 'Silver', label: '🥈 Silver', group: 'Precious Metals' },
  { value: 'Platinum', label: '💎 Platinum', group: 'Precious Metals' },
  { value: 'Palladium', label: '🔘 Palladium', group: 'Precious Metals' },
  { value: 'Rhodium', label: '🔘 Rhodium', group: 'Precious Metals' },
  { value: 'Diamond', label: '💎 Diamond', group: 'Stones' },
  { value: 'Other', label: '📌 Other', group: 'Other' },
];

const PURITY_OPTIONS: DropdownOption[] = [
  { value: '24K', label: '24K (99.9%)', group: 'Gold' },
  { value: '22K', label: '22K (91.6%)', group: 'Gold' },
  { value: '18K', label: '18K (75%)', group: 'Gold' },
  { value: '14K', label: '14K (58.5%)', group: 'Gold' },
  { value: '10K', label: '10K (41.7%)', group: 'Gold' },
  { value: '999', label: '999 (Fine Silver)', group: 'Silver' },
  { value: '958', label: '958 (Britannia Silver)', group: 'Silver' },
  { value: '925', label: '925 (Sterling Silver)', group: 'Silver' },
  { value: '900', label: '900 (Coin Silver)', group: 'Silver' },
  { value: '950', label: '950 (Platinum)', group: 'Platinum' },
  { value: '850', label: '850 (Platinum)', group: 'Platinum' },
];

const UNIT_OPTIONS: DropdownOption[] = [
  { value: 'g', label: 'Grams (g)', group: 'Weight' },
  { value: 'kg', label: 'Kilograms (kg)', group: 'Weight' },
  { value: 'oz', label: 'Ounces (oz)', group: 'Weight' },
  { value: 'ct', label: 'Carats (ct)', group: 'Weight' },
  { value: 'mg', label: 'Milligrams (mg)', group: 'Weight' },
  { value: 'pc', label: 'Pieces (pc)', group: 'Count' },
];

const GST_OPTIONS: DropdownOption[] = [
  { value: '0', label: '0%', group: 'GST' },
  { value: '5', label: '5%', group: 'GST' },
  { value: '12', label: '12%', group: 'GST' },
  { value: '18', label: '18%', group: 'GST' },
  { value: '28', label: '28%', group: 'GST' },
];

const MC_TYPE_OPTIONS: DropdownOption[] = [
  { value: 'fixed', label: 'Fixed Amount', group: 'Making Charge' },
  { value: 'percentage', label: 'Percentage', group: 'Making Charge' },
];

const ACCOUNT_OPTIONS: DropdownOption[] = [
  { value: 'sales', label: 'Sales', group: 'Accounts' },
  { value: 'revenue', label: 'Revenue', group: 'Accounts' },
  { value: 'income', label: 'Income', group: 'Accounts' },
];

const PURCHASE_ACCOUNT_OPTIONS: DropdownOption[] = [
  { value: 'cogs', label: 'Cost of Goods Sold', group: 'Accounts' },
  { value: 'inventory', label: 'Inventory', group: 'Accounts' },
  { value: 'purchases', label: 'Purchases', group: 'Accounts' },
];

const VENDOR_OPTIONS: DropdownOption[] = [
  { value: 'preferred_vendor', label: 'Preferred Vendor', group: 'Vendors' },
  { value: 'supplier_a', label: 'Supplier A', group: 'Vendors' },
  { value: 'supplier_b', label: 'Supplier B', group: 'Vendors' },
  { value: 'wholesaler', label: 'Wholesaler', group: 'Vendors' },
];

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
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
      {isExpanded && <div className="px-6 pb-6 overflow-visible">{children}</div>}
    </div>
  );
};

// InputField Component
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
  onCustomValueChange,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'searchable-select';
  placeholder?: string;
  required?: boolean;
  error?: string;
  step?: string;
  options?: DropdownOption[];
  readOnly?: boolean;
  disabled?: boolean;
  onCustomValueChange?: (value: string) => void;
}) => {
  const baseClasses = `w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
    rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent 
    text-sm transition-colors ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`;

  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  if (type === 'searchable-select' && options) {
    return (
      <div className="relative z-50">
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchableDropdown
              options={options}
              value={value as string}
              onChange={(option) => {
                const event = {
                  target: { name, value: option.value }
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
              }}
              placeholder={`Search ${label.toLowerCase()}...`}
              triggerPlaceholder={`Select ${label.toLowerCase()}`}
              disabled={disabled}
              className="w-full"
            />
          </div>
          {onCustomValueChange && (
            <button
              type="button"
              onClick={() => {
                const customValue = prompt(`Enter custom ${label.toLowerCase()}:`);
                if (customValue && customValue.trim()) {
                  onCustomValueChange(customValue.trim());
                }
              }}
              className="flex-shrink-0 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm flex items-center gap-1 whitespace-nowrap"
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
              Custom
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
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
        {error && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === 'select' && options) {
    return (
      <div>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
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
        {error && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
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
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// ToggleCheckbox Component
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

const ItemCreate: React.FC = () => {
  const navigate = useNavigate();
  const { 
    success, 
    error: showError, 
    warning, 
    withConfirmation, 
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();
  
  const {
    formData,
    errors,
    loading: hookLoading,
    expandedSections,
    imageUrls,
    setLoading,
    toggleSection,
    handleInputChange,
    handleManualChange,
    handleImageUpload,
    removeImage,
    validateForm,
    resetForm
  } = useItemCreate();

  const [localLoading, setLocalLoading] = useState(false);
  
  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentState = JSON.stringify(formData);
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = currentState;
    }
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData]);
  
  // State for conditional fields
  const [showMetalInfo, setShowMetalInfo] = useState(true);
  const [showWeightInfo, setShowWeightInfo] = useState(false);
  const [showDiamondInfo, setShowDiamondInfo] = useState(false);
  const [showPricingInfo, setShowPricingInfo] = useState(false);
  const [showInventoryInfo, setShowInventoryInfo] = useState(false);
  
  const isLoading = hookLoading || localLoading;

  // Handle custom category entry
  const handleCustomCategory = useCallback((customValue: string) => {
    const event = {
      target: { name: 'category', value: customValue }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  }, [handleInputChange]);

  // Handle custom metal type entry
  const handleCustomMetalType = useCallback((customValue: string) => {
    const event = {
      target: { name: 'metalType', value: customValue }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  }, [handleInputChange]);

  // Handle custom purity entry
  const handleCustomPurity = useCallback((customValue: string) => {
    const event = {
      target: { name: 'purity', value: customValue }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  }, [handleInputChange]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        showError('Please fill in all required fields');
        return;
      }

      await withLoading(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          console.log('Form Data:', formData);
          resetForm();
          navigate('/items');
        },
        'Creating item...',
        'Item created successfully!',
        'Failed to create item. Please try again.'
      );
    },
    [validateForm, formData, navigate, resetForm, showError, withLoading]
  );

  // Cancel handler with unsaved changes confirmation
  const handleNavigateCancel = useCallback(async () => {
    if (!hasChanges) {
      navigate('/items');
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/items');
      }
    );
  }, [hasChanges, navigate, withConfirmation]);

  // Clear form handler
  const handleClearForm = useCallback(async () => {
    if (!hasChanges) return;

    await withConfirmation(
      {
        title: 'Clear Form',
        message: 'Are you sure you want to clear all entered data?',
        confirmText: 'Clear',
        variant: 'warning',
      },
      async () => {
        resetForm();
        initialSnapshotRef.current = null;
        success('Form cleared successfully.');
      }
    );
  }, [hasChanges, resetForm, success, withConfirmation]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Creating item..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleNavigateCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Item</h1>
            <p className="text-sm text-gray-500 mt-0.5">Add a new item to your inventory</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear form"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleNavigateCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
            <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Form */}
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
          {/* ... (same form fields as before) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Item Code"
              name="itemCode"
              type="text"
              value={formData.itemCode}
              onChange={handleManualChange}
              placeholder="e.g., GOLD-RING-001"
              required
              error={errors.itemCode}
              disabled={isLoading}
            />
            <InputField
              label="Item Name"
              name="itemName"
              type="text"
              value={formData.itemName}
              onChange={handleManualChange}
              placeholder="e.g., Gold Diamond Ring"
              required
              error={errors.itemName}
              disabled={isLoading}
            />
            <InputField
              label="Category (What type of jewelry?)"
              name="category"
              type="searchable-select"
              value={formData.category}
              onChange={handleInputChange}
              required
              error={errors.category}
              options={CATEGORY_OPTIONS}
              disabled={isLoading}
              onCustomValueChange={handleCustomCategory}
            />
            <InputField
              label="Brand"
              name="brand"
              type="text"
              value={formData.brand}
              onChange={handleManualChange}
              placeholder="Enter brand name"
              disabled={isLoading}
            />
            <InputField
              label="Design Code"
              name="designCode"
              type="text"
              value={formData.designCode}
              onChange={handleManualChange}
              placeholder="Enter design code"
              disabled={isLoading}
            />
          </div>

          {/* Metal Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Metal / Material</h3>
                  <p className="text-xs text-gray-500">What material is this item made of?</p>
                </div>
                <span className="text-xs text-red-500 ml-1">*</span>
              </div>
              <ToggleCheckbox
                label="Include Metal Details"
                checked={showMetalInfo}
                onChange={setShowMetalInfo}
                description="Enable to specify metal type and purity"
              />
            </div>

            {showMetalInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Metal / Material Type"
                  name="metalType"
                  type="searchable-select"
                  value={formData.metalType}
                  onChange={handleInputChange}
                  required={showMetalInfo}
                  error={errors.metalType}
                  options={METAL_TYPE_OPTIONS}
                  disabled={isLoading}
                  onCustomValueChange={handleCustomMetalType}
                />
                <InputField
                  label="Purity / Karat"
                  name="purity"
                  type="searchable-select"
                  value={formData.purity}
                  onChange={handleInputChange}
                  required={showMetalInfo}
                  error={errors.purity}
                  options={PURITY_OPTIONS}
                  disabled={isLoading}
                  onCustomValueChange={handleCustomPurity}
                />
              </div>
            )}
          </div>
        </Section>

        {/* Weight Information, Diamond Information, Making Charge & Pricing, Sales Information, Purchase Information, Inventory & Tax, Image Upload sections remain the same... */}
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={onModalCancel}
        onConfirm={onModalConfirm}
        title={modalOptions?.title}
        message={modalOptions?.message ?? ''}
        confirmText={modalOptions?.confirmText}
        cancelText={modalOptions?.cancelText}
        variant={modalOptions?.variant}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default ItemCreate;