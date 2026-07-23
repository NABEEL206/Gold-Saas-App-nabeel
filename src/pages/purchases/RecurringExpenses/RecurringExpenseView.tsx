// src/pages/purchases/RecurringExpenses/RecurringExpenseView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  DollarSign,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Repeat,
  Pause,
  XCircle,
  Printer,
  Download,
  User,
  Hash,
  Tag,
  Mail,
  Phone,
  MapPin,
  Info,
} from 'lucide-react';
import { useRecurringExpense } from '../../../hooks/RecurringExpense/useRecurringExpense';
import type { RecurringExpense } from '../../../types/RecurringExpense/RecurringExpenseType';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// ============================================================
// STATUS CONFIGURATION - Single source of truth
// ============================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  active: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Active',
  },
  paused: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Pause className="h-3 w-3" />,
    label: 'Paused',
  },
  cancelled: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Cancelled',
  },
  completed: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Completed',
  },
};

// Frequency configuration - Single source of truth
const FREQUENCY_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  daily: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Daily',
  },
  weekly: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Weekly',
  },
  monthly: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Monthly',
  },
  quarterly: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Quarterly',
  },
  half_yearly: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Half Yearly',
  },
  yearly: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Yearly',
  },
  custom: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Custom',
  },
};

// ─── Status Badge Component ────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const { bg, color, icon, label } = config;
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: bg,
        color: color,
      }}
    >
      {icon}
      {label}
    </span>
  );
};

// ─── Frequency Badge Component ─────────────────────────────────────────────────
const FrequencyBadge: React.FC<{ 
  frequency: string; 
  frequencyInterval?: number; 
  frequencyUnit?: string 
}> = ({ 
  frequency, 
  frequencyInterval, 
  frequencyUnit 
}) => {
  const config = FREQUENCY_CONFIG[frequency] || FREQUENCY_CONFIG.custom;
  const { bg, color, icon, label: defaultLabel } = config;

  const label = frequency === 'custom' 
    ? `Every ${frequencyInterval || 1} ${frequencyUnit || 'months'}`
    : defaultLabel;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: bg,
        color: color,
      }}
    >
      {icon}
      {label}
    </span>
  );
};

// ─── Info Row Component ────────────────────────────────────────────────────────
const InfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}> = ({ label, value, icon: Icon, className = '' }) => (
  <div className={`flex justify-between py-2 last:border-b-0 ${className}`} style={{ borderBottom: '1px solid var(--border)' }}>
    <span className="text-sm flex items-center gap-1.5 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
      {Icon && <Icon className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />}
      {label}
    </span>
    <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>{value}</span>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const RecurringExpenseView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getExpenseById, deleteExpense } = useRecurringExpense();
  
  const [expense, setExpense] = useState<RecurringExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the toast and confirm hook
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

  // ─── Helper Functions ────────────────────────────────────────────────────────
  const getFrequencyLabel = useCallback((expense: RecurringExpense): string => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      half_yearly: 'Half Yearly',
      yearly: 'Yearly',
      custom: 'Custom',
    };

    if (expense.frequency === 'custom') {
      return `Every ${expense.frequencyInterval || 1} ${expense.frequencyUnit || 'months'}`;
    }
    return labels[expense.frequency] || expense.frequency;
  }, []);

  const getStatusLabel = useCallback((status: string): string => {
    const labels: Record<string, string> = {
      active: 'Active',
      paused: 'Paused',
      cancelled: 'Cancelled',
      completed: 'Completed',
    };
    return labels[status] || status;
  }, []);

  const getPaymentMethodLabel = useCallback((method: string): string => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank: 'Bank Transfer',
      credit_card: 'Credit Card',
      cheque: 'Cheque',
      auto_debit: 'Auto Debit',
    };
    return labels[method] || method;
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string = 'INR'): string => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        minimumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency || 'INR'} ${amount.toFixed(2)}`;
    }
  }, []);

  const getNextProcessingDate = useCallback((expense: RecurringExpense): string => {
    if (expense.nextProcessingDate) {
      return new Date(expense.nextProcessingDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    if (expense.lastProcessed && expense.frequency) {
      const lastDate = new Date(expense.lastProcessed);
      const nextDate = new Date(lastDate);
      
      switch (expense.frequency) {
        case 'daily':
          nextDate.setDate(lastDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(lastDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(lastDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(lastDate.getMonth() + 3);
          break;
        case 'half_yearly':
          nextDate.setMonth(lastDate.getMonth() + 6);
          break;
        case 'yearly':
          nextDate.setFullYear(lastDate.getFullYear() + 1);
          break;
        case 'custom':
          if (expense.frequencyInterval && expense.frequencyUnit) {
            const interval = expense.frequencyInterval;
            switch (expense.frequencyUnit) {
              case 'days':
                nextDate.setDate(lastDate.getDate() + interval);
                break;
              case 'weeks':
                nextDate.setDate(lastDate.getDate() + (interval * 7));
                break;
              case 'months':
                nextDate.setMonth(lastDate.getMonth() + interval);
                break;
              case 'years':
                nextDate.setFullYear(lastDate.getFullYear() + interval);
                break;
            }
          }
          break;
      }
      
      return nextDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return 'N/A';
  }, []);

  // ─── Load Expense Data ───────────────────────────────────────────────────────
  useEffect(() => {
    const loadExpense = async () => {
      if (!id) {
        showError('Invalid recurring expense ID');
        navigate('/purchases/recurring-expenses');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getExpenseById(id);
        if (data) {
          setExpense(data);
        } else {
          setError('Recurring expense not found');
          showError('Recurring expense not found');
        }
      } catch (err) {
        console.error('Error loading recurring expense:', err);
        setError('Error loading recurring expense');
        showError('Failed to load recurring expense details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadExpense();
  }, [id, getExpenseById, navigate, showError]);

  // ─── Action Handlers ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!id || !expense) return;
    
    await withConfirmation(
      {
        title: 'Delete Recurring Expense',
        message: `Are you sure you want to delete recurring expense "${expense.recurringNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteExpense(id);
            navigate('/purchases/recurring-expenses');
          },
          'Deleting recurring expense...',
          `Recurring expense "${expense.recurringNumber}" deleted successfully.`,
          'Failed to delete recurring expense. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/purchases/recurring-expenses/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid recurring expense ID');
    }
  };

  const handlePrint = () => {
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    warning('Download functionality will be implemented soon.');
  };

  const handleBack = () => {
    navigate('/purchases/recurring-expenses');
  };

  // ─── Dropdown Items ──────────────────────────────────────────────────────────
  const dropdownItems = [
    {
      label: 'Print',
      icon: <Printer className="h-4 w-4" style={{ color: 'var(--foreground-secondary)' }} />,
      onClick: handlePrint,
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: handleDownload,
    },
    {
      label: 'Edit Recurring Expense',
      icon: <Edit className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Recurring Expense',
      icon: <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  // ─── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading recurring expense details..." />
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────────
  if (error || !expense) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {error || 'Recurring expense not found'}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
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
            Back to Recurring Expenses
          </button>
        </div>
      </div>
    );
  }

  // ─── Main View ───────────────────────────────────────────────────────────────
  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className="text-2xl font-bold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                {expense.recurringNumber}
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Recurring Expense Details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors themed-transition"
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
              <Edit className="h-4 w-4" />
              Edit Recurring Expense
            </button>
            <ThreeDotDropdown
              items={dropdownItems}
              position="right"
            />
          </div>
        </div>

        {/* ── Status Badges ── */}
        <div className="mb-6 flex flex-wrap gap-2">
          <StatusBadge status={expense.paymentStatus} />
          <FrequencyBadge 
            frequency={expense.frequency} 
            frequencyInterval={expense.frequencyInterval}
            frequencyUnit={expense.frequencyUnit}
          />
          <span
            className="px-3 py-1 text-sm font-medium rounded-full themed-transition"
            style={{
              background: 'var(--info-light)',
              color: 'var(--info)',
            }}
          >
            {getPaymentMethodLabel(expense.paymentMethod)}
          </span>
          {expense.isVendorExpense && (
            <span
              className="px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 themed-transition"
              style={{
                background: 'var(--success-light)',
                color: 'var(--success)',
              }}
            >
              <Building2 className="h-3 w-3" />
              Vendor Expense
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Details */}
            <div
              className="rounded-xl p-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                className="text-lg font-medium mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <FileText className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
                Expense Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm flex items-center gap-1.5 mb-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    <Tag className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                    Category
                  </label>
                  <p className="font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.category}
                  </p>
                </div>
                <div>
                  <label className="text-sm flex items-center gap-1.5 mb-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    <Tag className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                    Sub Category
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.subCategory || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm flex items-center gap-1.5 mb-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    <Building2 className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                    Vendor
                  </label>
                  <p className="font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.vendorName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm flex items-center gap-1.5 mb-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    <Hash className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                    Reference Number
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.referenceNumber || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm flex items-center gap-1.5 mb-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    <Info className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                    Description
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div
              className="rounded-xl p-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                className="text-lg font-medium mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <DollarSign className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className="rounded-lg p-4 themed-transition"
                  style={{ background: 'var(--surface)' }}
                >
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Amount
                  </label>
                  <p className="text-xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 themed-transition"
                  style={{ background: 'var(--surface)' }}
                >
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Tax Amount
                  </label>
                  <p className="text-xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(expense.taxAmount || 0, expense.currency)}
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 themed-transition"
                  style={{
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary)',
                  }}
                >
                  <label className="text-sm" style={{ color: 'var(--primary)' }}>
                    Total Amount
                  </label>
                  <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                    {formatCurrency(expense.totalAmount, expense.currency)}
                  </p>
                </div>
              </div>
              {expense.currency && expense.currency !== 'INR' && expense.exchangeRate && expense.exchangeRate !== 1 && (
                <div
                  className="mt-4 p-3 rounded-lg themed-transition"
                  style={{
                    background: 'var(--info-light)',
                    border: '1px solid var(--info)',
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--info)' }}>
                    Exchange Rate: 1 {expense.currency} = {expense.exchangeRate} INR
                  </p>
                </div>
              )}
            </div>

            {/* Schedule Information */}
            <div
              className="rounded-xl p-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                className="text-lg font-medium mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <Calendar className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
                Schedule Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Frequency
                  </label>
                  <p className="font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    <FrequencyBadge 
                      frequency={expense.frequency}
                      frequencyInterval={expense.frequencyInterval}
                      frequencyUnit={expense.frequencyUnit}
                    />
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Start Date
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {new Date(expense.startDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    End Date
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.endDate 
                      ? new Date(expense.endDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'No end date'}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Next Processing
                  </label>
                  <p className="font-medium" style={{ color: 'var(--gold)' }}>
                    {getNextProcessingDate(expense)}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Processed Occurrences
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.processedOccurrences || 0}
                    {expense.totalOccurrences ? ` / ${expense.totalOccurrences}` : ''}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Remaining
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.totalOccurrences 
                      ? Math.max(0, expense.totalOccurrences - (expense.processedOccurrences || 0))
                      : '∞'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {expense.notes && (
              <div
                className="rounded-xl p-6 themed-transition"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3
                  className="text-lg font-medium mb-4 flex items-center gap-2 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  <FileText className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
                  Notes
                </h3>
                <p className="whitespace-pre-wrap themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                  {expense.notes}
                </p>
              </div>
            )}

            {/* Payment Information */}
            <div
              className="rounded-xl p-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                className="text-lg font-medium mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <CreditCard className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Payment Method
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {getPaymentMethodLabel(expense.paymentMethod)}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Status
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    <StatusBadge status={expense.paymentStatus} />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <div
              className="rounded-xl p-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                className="text-lg font-medium mb-4 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Quick Summary
              </h3>
              <div className="space-y-0">
                <InfoRow 
                  label="Recurring ID" 
                  value={`#${expense.id}`} 
                  icon={Hash}
                />
                <InfoRow 
                  label="Reference" 
                  value={expense.referenceNumber || 'N/A'} 
                  icon={FileText}
                />
                <InfoRow 
                  label="Total Amount" 
                  value={
                    <span className="font-bold" style={{ color: 'var(--gold)' }}>
                      {formatCurrency(expense.totalAmount, expense.currency)}
                    </span>
                  } 
                  icon={DollarSign}
                />
                <InfoRow 
                  label="Frequency" 
                  value={getFrequencyLabel(expense)} 
                  icon={Repeat}
                />
                <InfoRow 
                  label="Payment Method" 
                  value={getPaymentMethodLabel(expense.paymentMethod)} 
                  icon={CreditCard}
                />
                <InfoRow 
                  label="Status" 
                  value={<StatusBadge status={expense.paymentStatus} />} 
                  icon={CheckCircle}
                />
                <InfoRow 
                  label="Type" 
                  value={expense.isVendorExpense ? 'Vendor Expense' : 'General Expense'} 
                  icon={expense.isVendorExpense ? Building2 : User}
                />
                <InfoRow 
                  label="Created" 
                  value={expense.createdAt 
                    ? new Date(expense.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'} 
                  icon={Calendar}
                />
                <InfoRow 
                  label="Last Updated" 
                  value={expense.updatedAt 
                    ? new Date(expense.updatedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'} 
                  icon={Clock}
                />
              </div>
            </div>

            {/* Actions */}
            <div
              className="rounded-xl p-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                className="text-lg font-medium mb-4 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors themed-transition"
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
                  <Edit className="h-4 w-4" />
                  Edit Recurring Expense
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors themed-transition"
                  style={{
                    color: 'var(--foreground-secondary)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface)';
                  }}
                >
                  <Printer className="h-4 w-4" />
                  Print Details
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors themed-transition"
                  style={{
                    background: 'var(--error)',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--error-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--error)';
                  }}
                >
                  <Trash className="h-4 w-4" />
                  Delete Recurring Expense
                </button>
                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors themed-transition"
                  style={{
                    color: 'var(--foreground-secondary)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface)';
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Recurring Expenses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default RecurringExpenseView;