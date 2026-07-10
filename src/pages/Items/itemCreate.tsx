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
    <div
      className="rounded-xl overflow-visible themed-transition"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-4 transition-colors themed-transition"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" style={{ color: 'var(--gold)' }} />
          <h2 className="text-base font-semibold themed-transition" style={{ color: 'var(--text)' }}>
            {title}
          </h2>
          {required && (
            <span className="text-xs ml-1" style={{ color: 'var(--danger)' }}>
              *
            </span>
          )}
          {tooltip && (
            <div className="group relative">
              <Info className="h-4 w-4 themed-transition" style={{ color: 'var(--text-muted)' }} />
              <div
                className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2 rounded-lg text-xs z-10 themed-transition"
                style={{ background: 'var(--text)', color: 'var(--card)' }}
              >
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 themed-transition" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown className="h-5 w-5 themed-transition" style={{ color: 'var(--text-muted)' }} />
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
  const labelClasses =
    'block text-sm font-medium mb-1 themed-transition';
  
  const getInputClasses = () => {
    let classes = `w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition`;
    classes += ` ${error ? 'border-red-500' : 'border'}`;
    classes += ` ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;
    classes += ` ${readOnly ? 'opacity-80' : ''}`;
    return classes;
  };

  const inputStyles = {
    border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
    background: disabled ? 'var(--hover-bg)' : 'var(--card)',
    color: 'var(--text)',
  };

  if (type === 'searchable-select' && options) {
    return (
      <div className="relative z-50">
        <label className={labelClasses} style={{ color: 'var(--text)' }}>
          {label}
          {required && <span className="ml-1" style={{ color: 'var(--danger)' }}>*</span>}
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchableDropdown
              options={options}
              value={value as string}
              onChange={(option) => {
                const event = {
                  target: { name, value: option.value },
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
              className="flex-shrink-0 px-3 py-2 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap transition-colors themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
              Custom
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm flex items-center gap-1" style={{ color: 'var(--danger)' }}>
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
        <label className={labelClasses} style={{ color: 'var(--text)' }}>
          {label}
          {required && <span className="ml-1" style={{ color: 'var(--danger)' }}>*</span>}
        </label>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`${getInputClasses()} resize-y`}
          style={inputStyles}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = 'var(--focus-ring)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {error && (
          <p className="mt-1 text-sm flex items-center gap-1" style={{ color: 'var(--danger)' }}>
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
        <label className={labelClasses} style={{ color: 'var(--text)' }}>
          {label}
          {required && <span className="ml-1" style={{ color: 'var(--danger)' }}>*</span>}
        </label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={getInputClasses()}
          style={inputStyles}
          disabled={disabled}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = 'var(--focus-ring)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm flex items-center gap-1" style={{ color: 'var(--danger)' }}>
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className={labelClasses} style={{ color: 'var(--text)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        className={getInputClasses()}
        style={inputStyles}
        disabled={disabled}
        readOnly={readOnly}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.boxShadow = 'var(--focus-ring)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <p className="mt-1 text-sm flex items-center gap-1" style={{ color: 'var(--danger)' }}>
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
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}) => {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border themed-transition"
      style={{
        background: 'var(--hover-bg)',
        border: '1px solid var(--border)',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded focus:ring-2 themed-transition"
        style={{
          color: 'var(--primary)',
          borderColor: 'var(--border)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = 'var(--focus-ring)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      <div>
        <label className="text-sm font-medium cursor-pointer themed-transition" style={{ color: 'var(--text)' }}>
          {label}
        </label>
        {description && (
          <p className="text-xs mt-0.5 themed-transition" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
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
    resetForm,
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
  const handleCustomCategory = useCallback(
    (customValue: string) => {
      const event = {
        target: { name: 'category', value: customValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    },
    [handleInputChange]
  );

  // Handle custom metal type entry
  const handleCustomMetalType = useCallback(
    (customValue: string) => {
      const event = {
        target: { name: 'metalType', value: customValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    },
    [handleInputChange]
  );

  // Handle custom purity entry
  const handleCustomPurity = useCallback(
    (customValue: string) => {
      const event = {
        target: { name: 'purity', value: customValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    },
    [handleInputChange]
  );

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
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleNavigateCancel}
            className="p-2 rounded-lg transition-colors themed-transition"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5 themed-transition" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold themed-transition" style={{ color: 'var(--text)' }}>
              Create New Item
            </h1>
            <p className="text-sm mt-0.5 themed-transition" style={{ color: 'var(--text-secondary)' }}>
              Add a new item to your inventory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hover-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Clear form"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleNavigateCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
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
        <div
          className="mb-6 p-4 rounded-lg flex items-start gap-3 themed-transition"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
          }}
        >
          <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: 'var(--danger)' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
              Please fix the following errors:
            </p>
            <ul className="mt-1 text-sm list-disc list-inside" style={{ color: 'var(--danger)' }}>
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
          <div className="mt-6 pt-6 themed-transition" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                <div>
                  <h3 className="text-sm font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                    Metal / Material
                  </h3>
                  <p className="text-xs themed-transition" style={{ color: 'var(--text-secondary)' }}>
                    What material is this item made of?
                  </p>
                </div>
                <span className="text-xs ml-1" style={{ color: 'var(--danger)' }}>
                  *
                </span>
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

        {/* Weight Information */}
        <Section
          id="weight"
          title="Weight Information"
          icon={Scale}
          tooltip="Specify the weight and dimensions of the item"
          isExpanded={expandedSections.includes('weight')}
          onToggle={toggleSection}
        >
          <ToggleCheckbox
            label="Include Weight Details"
            checked={showWeightInfo}
            onChange={setShowWeightInfo}
            description="Enable to specify weight and dimensions"
          />
          {showWeightInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Gross Weight"
                name="grossWeight"
                type="number"
                value={formData.grossWeight || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
              />
              <InputField
                label="Net Weight"
                name="netWeight"
                type="number"
                value={formData.netWeight || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
              />
              <InputField
                label="Stone Weight"
                name="stoneWeight"
                type="number"
                value={formData.stoneWeight || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
              />
              <InputField
                label="Unit"
                name="unit"
                type="select"
                value={formData.unit || ''}
                onChange={handleInputChange}
                options={UNIT_OPTIONS}
                disabled={isLoading}
              />
            </div>
          )}
        </Section>

        {/* Diamond Information */}
        <Section
          id="diamond"
          title="Diamond Information"
          icon={Sparkles}
          tooltip="Specify diamond details for the item"
          isExpanded={expandedSections.includes('diamond')}
          onToggle={toggleSection}
        >
          <ToggleCheckbox
            label="Include Diamond Details"
            checked={showDiamondInfo}
            onChange={setShowDiamondInfo}
            description="Enable to specify diamond information"
          />
          {showDiamondInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Diamond Pieces"
                name="diamondPieces"
                type="number"
                value={formData.diamondPieces || ''}
                onChange={handleInputChange}
                placeholder="0"
                disabled={isLoading}
              />
              <InputField
                label="Carat Weight"
                name="caratWeight"
                type="number"
                value={formData.caratWeight || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
              />
            </div>
          )}
        </Section>

        {/* Pricing Information */}
        <Section
          id="pricing"
          title="Making Charge & Pricing"
          icon={DollarSign}
          tooltip="Configure pricing and charges for the item"
          isExpanded={expandedSections.includes('pricing')}
          onToggle={toggleSection}
        >
          <ToggleCheckbox
            label="Include Pricing Details"
            checked={showPricingInfo}
            onChange={setShowPricingInfo}
            description="Enable to specify pricing and charges"
          />
          {showPricingInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Selling Price"
                name="sellingPrice"
                type="number"
                value={formData.sellingPrice || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                required
                error={errors.sellingPrice}
                disabled={isLoading}
              />
              <InputField
                label="MRP"
                name="mrp"
                type="number"
                value={formData.mrp || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
              />
              <InputField
                label="Gold Rate"
                name="goldRate"
                type="number"
                value={formData.goldRate || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
              />
              <InputField
                label="Making Charge Type"
                name="mcType"
                type="select"
                value={formData.mcType || ''}
                onChange={handleInputChange}
                options={MC_TYPE_OPTIONS}
                disabled={isLoading}
              />
              <InputField
                label="Making Charge Value"
                name="mcValue"
                type="number"
                value={formData.mcValue || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                disabled={isLoading}
              />
              <InputField
                label="Currency"
                name="currency"
                type="text"
                value={formData.currency || 'INR'}
                onChange={handleManualChange}
                placeholder="INR"
                disabled={isLoading}
              />
            </div>
          )}
        </Section>

        {/* Sales Information */}
        <Section
          id="sales"
          title="Sales Information"
          icon={ShoppingBag}
          isExpanded={expandedSections.includes('sales')}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Sales Account"
              name="salesAccount"
              type="select"
              value={formData.salesAccount || ''}
              onChange={handleInputChange}
              options={ACCOUNT_OPTIONS}
              disabled={isLoading}
            />
          </div>
        </Section>

        {/* Purchase Information */}
        <Section
          id="purchase"
          title="Purchase Information"
          icon={Truck}
          isExpanded={expandedSections.includes('purchase')}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Purchase Account"
              name="purchaseAccount"
              type="select"
              value={formData.purchaseAccount || ''}
              onChange={handleInputChange}
              options={PURCHASE_ACCOUNT_OPTIONS}
              disabled={isLoading}
            />
            <InputField
              label="Vendor"
              name="vendor"
              type="select"
              value={formData.vendor || ''}
              onChange={handleInputChange}
              options={VENDOR_OPTIONS}
              disabled={isLoading}
            />
          </div>
        </Section>

        {/* Inventory & Tax */}
        <Section
          id="inventory"
          title="Inventory & Tax"
          icon={ShoppingCart}
          tooltip="Configure inventory levels and tax information"
          isExpanded={expandedSections.includes('inventory')}
          onToggle={toggleSection}
        >
          <ToggleCheckbox
            label="Include Inventory Details"
            checked={showInventoryInfo}
            onChange={setShowInventoryInfo}
            description="Enable to specify inventory and tax information"
          />
          {showInventoryInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Opening Stock"
                name="openingStock"
                type="number"
                value={formData.openingStock || ''}
                onChange={handleInputChange}
                placeholder="0"
                disabled={isLoading}
              />
              <InputField
                label="Reorder Level"
                name="reorderLevel"
                type="number"
                value={formData.reorderLevel || ''}
                onChange={handleInputChange}
                placeholder="0"
                disabled={isLoading}
              />
              <InputField
                label="HSN Code"
                name="hsnCode"
                type="text"
                value={formData.hsnCode || ''}
                onChange={handleManualChange}
                placeholder="e.g., 7113"
                disabled={isLoading}
              />
              <InputField
                label="GST Percentage"
                name="gstPercentage"
                type="select"
                value={formData.gstPercentage || ''}
                onChange={handleInputChange}
                options={GST_OPTIONS}
                disabled={isLoading}
              />
            </div>
          )}
        </Section>

        {/* Image Upload */}
        <Section
          id="images"
          title="Images"
          icon={ImageIcon}
          tooltip="Upload images of the item"
          isExpanded={expandedSections.includes('images')}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer themed-transition"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--hover-bg)',
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border)';
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  handleImageUpload(files);
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleImageUpload(Array.from(files));
                  }
                }}
                className="hidden"
                id="image-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex flex-col items-center gap-2"
              >
                <Upload className="h-12 w-12 themed-transition" style={{ color: 'var(--text-muted)' }} />
                <div>
                  <p className="text-sm font-medium themed-transition" style={{ color: 'var(--text)' }}>
                    Click or drag to upload images
                  </p>
                  <p className="text-xs themed-transition" style={{ color: 'var(--text-secondary)' }}>
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              </label>
            </div>

            {/* Image Preview */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden themed-transition"
                    style={{
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      style={{
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
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