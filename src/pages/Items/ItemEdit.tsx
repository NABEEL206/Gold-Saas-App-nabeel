// src/pages/Items/ItemEdit.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Plus,
  Truck,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../components/common/Searchabledropdown';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useItemEdit } from '../../hooks/items/useItemEdit';
import { useToastAndConfirm } from '../../hooks/ToastConfirmModal/useToastAndConfirm';

// Constants with proper types for SearchableDropdown
const ITEM_TYPE_OPTIONS: DropdownOption[] = [
  { value: 'Gold', label: 'Gold', group: 'Metal' },
  { value: 'Silver', label: 'Silver', group: 'Metal' },
  { value: 'Diamond', label: 'Diamond', group: 'Stone' },
  { value: 'Platinum', label: 'Platinum', group: 'Metal' },
  { value: 'Other', label: 'Other', group: 'Other' },
];

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: 'Rings', label: 'Rings', group: 'Jewelry' },
  { value: 'Necklaces', label: 'Necklaces', group: 'Jewelry' },
  { value: 'Earrings', label: 'Earrings', group: 'Jewelry' },
  { value: 'Bracelets', label: 'Bracelets', group: 'Jewelry' },
  { value: 'Pendants', label: 'Pendants', group: 'Jewelry' },
  { value: 'Chains', label: 'Chains', group: 'Jewelry' },
  { value: 'Bangles', label: 'Bangles', group: 'Jewelry' },
  { value: 'Sets', label: 'Sets', group: 'Jewelry' },
  { value: 'Other', label: 'Other', group: 'Jewelry' },
];

const METAL_TYPE_OPTIONS: DropdownOption[] = [
  { value: 'Gold', label: 'Gold', group: 'Precious Metals' },
  { value: 'Silver', label: 'Silver', group: 'Precious Metals' },
  { value: 'Platinum', label: 'Platinum', group: 'Precious Metals' },
  { value: 'Palladium', label: 'Palladium', group: 'Precious Metals' },
  { value: 'Rhodium', label: 'Rhodium', group: 'Precious Metals' },
  { value: 'Other', label: 'Other', group: 'Other' },
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

const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: 'INR', label: 'INR', group: 'Currency' },
  { value: 'USD', label: 'USD', group: 'Currency' },
  { value: 'EUR', label: 'EUR', group: 'Currency' },
  { value: 'GBP', label: 'GBP', group: 'Currency' },
  { value: 'AED', label: 'AED', group: 'Currency' },
];

const MC_TYPE_OPTIONS: DropdownOption[] = [
  { value: 'fixed', label: 'Fixed', group: 'Making Charge' },
  { value: 'percentage', label: 'Percentage', group: 'Making Charge' },
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
  const labelClasses = 'block text-sm font-medium mb-1 themed-transition';
  
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
              className="flex-shrink-0 px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors themed-transition"
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

// Toggle Checkbox Component
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

// ==================== MAIN COMPONENT ====================

const ItemEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    success,
    error: showError,
    withConfirmation,
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

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
    resetForm,
  } = useItemEdit();

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading && item && initialSnapshotRef.current === null) {
      initialSnapshotRef.current = JSON.stringify(formData);
    }
    if (initialSnapshotRef.current !== null) {
      setHasChanges(JSON.stringify(formData) !== initialSnapshotRef.current);
    }
  }, [formData, loading, item]);

  const [showMetalInfo, setShowMetalInfo] = useState(false);
  const [showWeightInfo, setShowWeightInfo] = useState(false);
  const [showDiamondInfo, setShowDiamondInfo] = useState(false);
  const [showPricingInfo, setShowPricingInfo] = useState(false);
  const [showInventoryInfo, setShowInventoryInfo] = useState(false);

  const handleCustomCategory = useCallback(
    (customValue: string) => {
      const event = {
        target: { name: 'category', value: customValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    },
    [handleInputChange]
  );

  const handleCustomItemType = useCallback(
    (customValue: string) => {
      const event = {
        target: { name: 'itemType', value: customValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    },
    [handleInputChange]
  );

  const handleCustomMetalType = useCallback(
    (customValue: string) => {
      const event = {
        target: { name: 'metalType', value: customValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    },
    [handleInputChange]
  );

  const handleCustomPurity = useCallback(
    (customValue: string) => {
      const event = {
        target: { name: 'purity', value: customValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    },
    [handleInputChange]
  );

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id, fetchItem]);

  useEffect(() => {
    if (item) {
      setShowMetalInfo(!!item.metalType || !!item.purity);
      setShowWeightInfo(!!item.grossWeight || !!item.netWeight || !!item.stoneWeight);
      setShowDiamondInfo(!!item.diamondPieces || !!item.caratWeight);
      setShowPricingInfo(!!item.mcType || !!item.mcValue || !!item.goldRate);
      setShowInventoryInfo(!!item.openingStock || !!item.hsnCode || !!item.gstPercentage);
    }
  }, [item]);

  useEffect(() => {
    if (errors.submit) {
      showError(errors.submit);
    }
  }, [errors.submit, showError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        showError('Please fix the validation errors');
        return;
      }

      await withLoading(
        async () => {
          await updateItem();
          navigate('/items');
        },
        'Updating item...',
        `"${item?.itemName}" updated successfully!`,
        'Failed to update item. Please try again.'
      );
    },
    [validateForm, updateItem, navigate, item, showError, withLoading]
  );

  const handleDelete = async () => {
    if (!item) return;

    await withConfirmation(
      {
        title: 'Delete Item',
        message: `Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteItem();
            navigate('/items');
          },
          'Deleting item...',
          `"${item.itemName}" deleted successfully!`,
          `Failed to delete "${item.itemName}"`
        );
      }
    );
  };

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

  const handleResetForm = useCallback(async () => {
    if (!hasChanges) return;

    await withConfirmation(
      {
        title: 'Reset Form',
        message: 'Are you sure you want to reset all changes to the original values?',
        confirmText: 'Reset',
        variant: 'warning',
      },
      async () => {
        if (resetForm) {
          resetForm();
        }
        initialSnapshotRef.current = null;
        success('Form reset to original values.');
      }
    );
  }, [hasChanges, resetForm, success, withConfirmation]);

  const handleViewItem = () => {
    if (item) {
      navigate(`/items/${item.id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading item..." />
      </div>
    );
  }

  if (!item) {
    return (
      <div
        className="p-6 flex items-center justify-center min-h-[400px] themed-transition"
        style={{ background: 'var(--background)' }}
      >
        <div className="text-center">
          <AlertCircle
            className="h-12 w-12 mx-auto mb-3 themed-transition"
            style={{ color: 'var(--text-muted)' }}
          />
          <h3 className="text-lg font-semibold themed-transition" style={{ color: 'var(--text)' }}>
            Item Not Found
          </h3>
          <p className="text-sm mt-1 themed-transition" style={{ color: 'var(--text-secondary)' }}>
            The item you are trying to edit does not exist.
          </p>
          <button
            onClick={() => navigate('/items')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors themed-transition"
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
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Items
          </button>
        </div>
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
              Edit Item
            </h1>
            <p className="text-sm mt-0.5 themed-transition" style={{ color: 'var(--text-secondary)' }}>
              Editing: {item.itemCode} - {item.itemName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewItem}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors themed-transition"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--card)';
            }}
          >
            <Eye className="h-4 w-4" />
            View Item
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
            style={{
              color: 'var(--danger)',
              background: 'var(--card)',
              border: '1px solid var(--danger)',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--card)';
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          {hasChanges && (
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hover-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Reset changes"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={handleNavigateCancel}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 themed-transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'var(--hover-bg)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Update Item'}
          </button>
        </div>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 &&
        Object.keys(errors).some((key) => key !== 'submit') && (
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
                {Object.entries(errors)
                  .filter(([key]) => key !== 'submit')
                  .map(([key, value]) => (
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
              type="searchable-select"
              value={formData.itemType}
              onChange={handleInputChange}
              required
              error={errors.itemType}
              options={ITEM_TYPE_OPTIONS}
              disabled={saving}
              onCustomValueChange={handleCustomItemType}
            />
            <InputField
              label="Category"
              name="category"
              type="searchable-select"
              value={formData.category}
              onChange={handleInputChange}
              required
              error={errors.category}
              options={CATEGORY_OPTIONS}
              disabled={saving}
              onCustomValueChange={handleCustomCategory}
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
        <div
          className="rounded-xl overflow-hidden themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="px-6 py-4 themed-transition"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                <h2 className="text-base font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                  Metal Information
                </h2>
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
                  type="searchable-select"
                  value={formData.metalType}
                  onChange={handleInputChange}
                  required={showMetalInfo}
                  error={errors.metalType}
                  options={METAL_TYPE_OPTIONS}
                  disabled={saving}
                  onCustomValueChange={handleCustomMetalType}
                />
                <InputField
                  label="Purity/Karat"
                  name="purity"
                  type="searchable-select"
                  value={formData.purity}
                  onChange={handleInputChange}
                  required={showMetalInfo}
                  error={errors.purity}
                  options={PURITY_OPTIONS}
                  disabled={saving}
                  onCustomValueChange={handleCustomPurity}
                />
              </div>
            </div>
          )}
        </div>

        {/* Weight Information */}
        <div
          className="rounded-xl overflow-hidden themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="px-6 py-4 themed-transition"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                <h2 className="text-base font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                  Weight Information
                </h2>
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
                  type="searchable-select"
                  value={formData.unit}
                  onChange={handleManualChange}
                  options={UNIT_OPTIONS}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>

        {/* Diamond Information */}
        <div
          className="rounded-xl overflow-hidden themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="px-6 py-4 themed-transition"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                <h2 className="text-base font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                  Diamond Information
                </h2>
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
        <div
          className="rounded-xl overflow-hidden themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="px-6 py-4 themed-transition"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                <h2 className="text-base font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                  Making Charge & Pricing
                </h2>
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
                  type="searchable-select"
                  value={formData.mcType}
                  onChange={handleInputChange}
                  options={MC_TYPE_OPTIONS}
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
        <div
          className="rounded-xl overflow-hidden themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="px-6 py-4 themed-transition"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                <h2 className="text-base font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                  Sales Information
                </h2>
              </div>
              <button
                type="button"
                onClick={toggleSalesInfo}
                disabled={saving}
                className="flex items-center gap-2 text-sm transition-colors disabled:opacity-50 themed-transition"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {showSalesInfo ? (
                  <>
                    <ToggleRight className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--primary)' }}>Enabled</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Disabled</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {showSalesInfo && (
            <div className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1 themed-transition"
                    style={{ color: 'var(--text)' }}
                  >
                    Selling Price <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm themed-transition"
                      style={{ color: 'var(--text-secondary)' }}
                    >
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
                      className="w-full pl-16 pr-28 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                      style={{
                        border: '1px solid var(--border)',
                        background: saving ? 'var(--hover-bg)' : 'var(--card)',
                        color: 'var(--text)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-24">
                      <SearchableDropdown
                        options={CURRENCY_OPTIONS}
                        value={formData.currency || 'INR'}
                        onChange={(option) => {
                          const event = {
                            target: { name: 'currency', value: option.value },
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleManualChange(event);
                        }}
                        placeholder="Currency"
                        triggerPlaceholder="Currency"
                        disabled={saving}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className="block text-sm font-medium themed-transition"
                      style={{ color: 'var(--text)' }}
                    >
                      MRP
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleSection('mrp')}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs transition-colors disabled:opacity-50 themed-transition"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        if (!saving) {
                          e.currentTarget.style.color = 'var(--text)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
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
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                      style={{
                        border: '1px solid var(--border)',
                        background: saving ? 'var(--hover-bg)' : 'var(--card)',
                        color: 'var(--text)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block text-sm font-medium themed-transition"
                    style={{ color: 'var(--text)' }}
                  >
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleSection('description')}
                    disabled={saving}
                    className="flex items-center gap-1 text-xs transition-colors disabled:opacity-50 themed-transition"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.currentTarget.style.color = 'var(--text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
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
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-y themed-transition"
                    style={{
                      border: '1px solid var(--border)',
                      background: saving ? 'var(--hover-bg)' : 'var(--card)',
                      color: 'var(--text)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inventory & Tax */}
        <div
          className="rounded-xl overflow-hidden themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="px-6 py-4 themed-transition"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                <h2 className="text-base font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                  Inventory & Tax
                </h2>
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
                  type="searchable-select"
                  value={formData.gstPercentage}
                  onChange={handleManualChange}
                  options={GST_OPTIONS}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div
          className="rounded-xl overflow-hidden themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="px-6 py-4 themed-transition"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              <h2 className="text-base font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                Image Upload
              </h2>
            </div>
          </div>
          <div className="px-6 py-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors themed-transition ${
                !saving ? '' : 'opacity-50'
              }`}
              style={{
                borderColor: 'var(--border)',
                background: 'var(--hover-bg)',
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                if (!saving) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!saving) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border)';
                if (!saving) {
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    handleImageUpload(files);
                  }
                }
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleImageUpload(Array.from(files));
                  }
                }}
                className="hidden"
                id="image-upload"
                disabled={saving}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center gap-3 ${
                  saving ? 'cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-12 w-12 themed-transition" style={{ color: 'var(--text-muted)' }} />
                <div>
                  <p className="text-sm font-medium themed-transition" style={{ color: 'var(--text)' }}>
                    Click to upload images
                  </p>
                  <p className="text-xs mt-1 themed-transition" style={{ color: 'var(--text-secondary)' }}>
                    PNG, JPG, JPEG up to 5MB
                  </p>
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
                      className="w-full h-24 object-cover rounded-lg themed-transition"
                      style={{ border: '1px solid var(--border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={saving}
                      className="absolute -top-2 -right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--danger)', color: 'white' }}
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
        <div
          className="flex items-center justify-end gap-3 pt-6 themed-transition"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={handleNavigateCancel}
            disabled={saving}
            className="px-4 py-2 transition-colors disabled:opacity-50 themed-transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.color = 'var(--text)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Updating...' : 'Update Item'}
          </button>
        </div>
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

export default ItemEdit;