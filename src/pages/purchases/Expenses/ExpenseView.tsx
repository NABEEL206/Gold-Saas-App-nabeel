// src/pages/purchases/Expenses/ExpenseView.tsx
import React, { useState, useEffect } from 'react';
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
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Download,
  BookOpen,
} from 'lucide-react';
import { useExpense } from '../../../hooks/Expense/useExpense';
import { useExpenseView } from '../../../hooks/Expense/useExpenseView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { validateExpenseForm, formatValidationErrors } from '../../../validations/expense.validation';
import type { ExpenseFormData } from '../../../types/Expense/ExpenseType';

// ============================================================
// STATUS CONFIGURATION - Single source of truth
// ============================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  paid: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Paid',
  },
  unpaid: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Unpaid',
  },
  partial: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Partial',
  },
  overdue: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Overdue',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unpaid;
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

const ExpenseView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getExpenseById, deleteExpense } = useExpense();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

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

  const { 
    getPaymentMethodLabel, 
    getExpenseAccount,
    isComplete,
    clearValidationErrors,
    getValidationSummary 
  } = useExpenseView(expense);

  // Format currency in Rupees
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  useEffect(() => {
    const loadExpense = async () => {
      if (id) {
        setLoading(true);
        setError(null);
        setValidationErrors({});
        setShowValidationSummary(false);
        try {
          const data = await getExpenseById(id);
          if (data) {
            const validationResult = validateExpenseForm(data as ExpenseFormData);
            if (!validationResult.isValid) {
              const formattedErrors = formatValidationErrors(validationResult.errors);
              setValidationErrors(formattedErrors);
              setShowValidationSummary(true);
              warning('Expense data has validation issues. Please review the details below.');
            }
            setExpense(data);
          } else {
            setError('Expense not found');
            showError('Expense not found');
          }
        } catch (err) {
          console.error('Error loading expense:', err);
          setError('Error loading expense');
          showError('Failed to load expense details. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        showError('Invalid expense ID');
        navigate('/purchases/expenses');
      }
    };
    loadExpense();
  }, [id, getExpenseById, navigate, showError, warning]);

  const handleDelete = async () => {
    if (!id) return;

    if (!expense) {
      setValidationErrors({ delete: 'No expense data available to delete.' });
      setShowValidationSummary(true);
      showError('No expense data available to delete.');
      return;
    }
    
    await withConfirmation(
      {
        title: 'Delete Expense',
        message: `Are you sure you want to delete expense "${expense?.expenseNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteExpense(id);
            setValidationErrors({});
            setShowValidationSummary(false);
            navigate('/purchases/expenses');
          },
          'Deleting expense...',
          `Expense "${expense?.expenseNumber}" deleted successfully.`,
          'Failed to delete expense. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Expense ID:', id);
    if (!id) {
      setValidationErrors({ edit: 'Cannot edit: Invalid expense ID' });
      setShowValidationSummary(true);
      showError('Cannot edit: Invalid expense ID');
      return;
    }

    if (!expense) {
      setValidationErrors({ edit: 'Cannot edit: Expense data not loaded' });
      setShowValidationSummary(true);
      showError('Cannot edit: Expense data not loaded');
      return;
    }

    setValidationErrors({});
    setShowValidationSummary(false);
    navigate(`/purchases/expenses/${id}/edit`);
  };

  const handlePrint = () => {
    if (!expense) {
      setValidationErrors({ print: 'Cannot print: No expense data available' });
      setShowValidationSummary(true);
      showError('Cannot print: No expense data available');
      return;
    }

    setValidationErrors({});
    setShowValidationSummary(false);
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    if (!expense) {
      setValidationErrors({ download: 'Cannot download: No expense data available' });
      setShowValidationSummary(true);
      showError('Cannot download: No expense data available');
      return;
    }

    setValidationErrors({});
    setShowValidationSummary(false);
    warning('Download functionality will be implemented soon.');
  };

  // Dropdown items for ThreeDotDropdown in header
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
      label: 'Edit Expense',
      icon: <Edit className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Expense',
      icon: <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  // Get filtered errors
  const getFilteredErrors = () => {
    const filtered: Record<string, string> = {};
    Object.entries(validationErrors).forEach(([key, value]) => {
      if (key !== 'submit' && value) {
        filtered[key] = value;
      }
    });
    return filtered;
  };

  const filteredErrors = getFilteredErrors();
  const hasErrors = Object.keys(filteredErrors).length > 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading expense details..." />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {error || 'Expense not found'}
          </p>
          <button
            onClick={() => navigate('/purchases/expenses')}
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
            Back to Expenses
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/purchases/expenses')}
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
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className="text-2xl font-bold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                {expense.expenseNumber}
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Expense Details
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
              Edit Expense
            </button>
            <ThreeDotDropdown
              items={dropdownItems}
              position="right"
            />
          </div>
        </div>

        {/* Error Summary - Warning variant like other pages */}
        {(showValidationSummary || hasErrors) && hasErrors && (
          <ErrorSummary
            errors={filteredErrors}
            title="Validation Issues Found:"
            variant="warning"
            onClose={() => {
              setShowValidationSummary(false);
              setValidationErrors({});
              clearValidationErrors();
            }}
            showIcon={true}
            showBadge={false}
          />
        )}

        {/* Status Badge */}
        <div className="mb-6">
          <StatusBadge status={expense.paymentStatus} />
          <span
            className="ml-2 px-3 py-1 text-sm font-medium rounded-full themed-transition"
            style={{
              background: 'var(--info-light)',
              color: 'var(--info)',
            }}
          >
            {getPaymentMethodLabel()}
          </span>
          {expense.receiptNumber && (
            <span
              className="ml-2 px-3 py-1 text-sm font-medium rounded-full themed-transition"
              style={{
                background: 'var(--surface-hover)',
                color: 'var(--foreground-secondary)',
              }}
            >
              Receipt: {expense.receiptNumber}
            </span>
          )}
          {isComplete ? (
            <span
              className="ml-2 px-3 py-1 text-sm font-medium rounded-full themed-transition"
              style={{
                background: 'var(--success-light)',
                color: 'var(--success)',
              }}
            >
              Complete Record
            </span>
          ) : (
            <span
              className="ml-2 px-3 py-1 text-sm font-medium rounded-full themed-transition"
              style={{
                background: 'var(--warning-light)',
                color: 'var(--warning)',
              }}
            >
              Incomplete Record
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
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
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Vendor
                  </label>
                  <p className="font-medium flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <Building2 className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    {expense.vendorName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Category
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.category}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Sub Category
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.subCategory || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Expense Account
                  </label>
                  <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    {getExpenseAccount()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Description
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.description || 'N/A'}
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
                  style={{
                    background: 'var(--surface)',
                  }}
                >
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Amount
                  </label>
                  <p className="text-xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 themed-transition"
                  style={{
                    background: 'var(--surface)',
                  }}
                >
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Tax Amount
                  </label>
                  <p className="text-xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(expense.taxAmount || 0)}
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
                    {formatCurrency(expense.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

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
                  <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <CreditCard className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    {getPaymentMethodLabel()}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Payment Status
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    <StatusBadge status={expense.paymentStatus} />
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Date
                  </label>
                  <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <Calendar className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Due Date
                  </label>
                  <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <Calendar className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    {expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Reference Number
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.referenceNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Bill Number
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.billNumber || 'N/A'}
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
                  className="text-lg font-medium mb-4 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Notes
                </h3>
                <p className="whitespace-pre-wrap themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                  {expense.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
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
              <div className="space-y-3">
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Expense ID
                  </span>
                  <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    #{expense.id}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Reference
                  </span>
                  <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.referenceNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Total Amount
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                    {formatCurrency(expense.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Expense Account
                  </span>
                  <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {getExpenseAccount()}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Status
                  </span>
                  <span className="text-sm font-medium">
                    <StatusBadge status={expense.paymentStatus} />
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Created
                  </span>
                  <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
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
                  Edit Expense
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
                  Delete Expense
                </button>
                <button
                  onClick={() => navigate('/purchases/expenses')}
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
                  Back to Expenses
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

export default ExpenseView;