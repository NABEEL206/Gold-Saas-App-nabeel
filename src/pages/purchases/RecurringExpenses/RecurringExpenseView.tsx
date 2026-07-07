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

// ─── Status Badge Component ────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    paused: { color: 'bg-yellow-100 text-yellow-700', icon: Pause, label: 'Paused' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
    completed: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Completed' },
  };
  
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = config[status] || defaultConfig;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

// ─── Frequency Badge Component ─────────────────────────────────────────────────
const FrequencyBadge: React.FC<{ frequency: string; frequencyInterval?: number; frequencyUnit?: string }> = ({ 
  frequency, 
  frequencyInterval, 
  frequencyUnit 
}) => {
  const labels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    half_yearly: 'Half Yearly',
    yearly: 'Yearly',
    custom: 'Custom',
  };

  const label = frequency === 'custom' 
    ? `Every ${frequencyInterval || 1} ${frequencyUnit || 'months'}`
    : labels[frequency] || frequency;

  return (
    <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 inline-flex items-center gap-1">
      <Repeat className="h-3 w-3" />
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
  <div className={`flex justify-between py-2 border-b border-gray-100 last:border-b-0 ${className}`}>
    <span className="text-sm text-gray-500 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
      {label}
    </span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
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
      icon: <Printer className="h-4 w-4 text-gray-500" />,
      onClick: handlePrint,
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4 text-blue-500" />,
      onClick: handleDownload,
    },
    {
      label: 'Edit Recurring Expense',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Recurring Expense',
      icon: <Trash className="h-4 w-4 text-red-500" />,
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
          <AlertCircle className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || 'Recurring expense not found'}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Recurring Expenses
          </button>
        </div>
      </div>
    );
  }

  // ─── Main View ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{expense.recurringNumber}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Recurring Expense Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
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
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            {getPaymentMethodLabel(expense.paymentMethod)}
          </span>
          {expense.isVendorExpense && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Vendor Expense
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Expense Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    Category
                  </label>
                  <p className="text-gray-900 font-medium">{expense.category}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    Sub Category
                  </label>
                  <p className="text-gray-900">{expense.subCategory || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    Vendor
                  </label>
                  <p className="text-gray-900 font-medium">
                    {expense.vendorName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                    <Hash className="h-3.5 w-3.5 text-gray-400" />
                    Reference Number
                  </label>
                  <p className="text-gray-900">{expense.referenceNumber || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                    Description
                  </label>
                  <p className="text-gray-900">{expense.description || 'No description provided'}</p>
                </div>
              </div>
            </div>

            {/* Vendor Contact Information */}
            {expense.isVendorExpense && expense.vendorId && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  Vendor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      Email
                    </label>
                    <p className="text-gray-900">N/A</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      Phone
                    </label>
                    <p className="text-gray-900">N/A</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      Address
                    </label>
                    <p className="text-gray-900">N/A</p>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm text-gray-500">Amount</label>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm text-gray-500">Tax Amount</label>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(expense.taxAmount || 0, expense.currency)}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <label className="text-sm text-amber-600">Total Amount</label>
                  <p className="text-xl font-bold text-amber-700">
                    {formatCurrency(expense.totalAmount, expense.currency)}
                  </p>
                </div>
              </div>
              {expense.currency && expense.currency !== 'INR' && expense.exchangeRate && expense.exchangeRate !== 1 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Exchange Rate: 1 {expense.currency} = {expense.exchangeRate} INR
                  </p>
                </div>
              )}
            </div>

            {/* Schedule Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Schedule Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Frequency</label>
                  <p className="text-gray-900 font-medium">
                    <FrequencyBadge 
                      frequency={expense.frequency}
                      frequencyInterval={expense.frequencyInterval}
                      frequencyUnit={expense.frequencyUnit}
                    />
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Start Date</label>
                  <p className="text-gray-900">
                    {new Date(expense.startDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">End Date</label>
                  <p className="text-gray-900">
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
                  <label className="text-sm text-gray-500">Next Processing</label>
                  <p className="text-gray-900 font-medium text-amber-600">
                    {getNextProcessingDate(expense)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Processed Occurrences</label>
                  <p className="text-gray-900">
                    {expense.processedOccurrences || 0}
                    {expense.totalOccurrences ? ` / ${expense.totalOccurrences}` : ''}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Remaining</label>
                  <p className="text-gray-900">
                    {expense.totalOccurrences 
                      ? Math.max(0, expense.totalOccurrences - (expense.processedOccurrences || 0))
                      : '∞'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {expense.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Notes
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{expense.notes}</p>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-500" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Payment Method</label>
                  <p className="text-gray-900">{getPaymentMethodLabel(expense.paymentMethod)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className="text-gray-900">
                    <StatusBadge status={expense.paymentStatus} />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h3>
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
                    <span className="font-bold text-amber-600">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Recurring Expense
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Print Details
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4" />
                  Delete Recurring Expense
                </button>
                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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