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
  Mail,
  Phone,
  Printer,
  Download,
} from 'lucide-react';
import { useExpense } from '../../../hooks/Expense/useExpense';
import { useExpenseView } from '../../../hooks/Expense/useExpenseView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
    unpaid: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Unpaid' },
    partial: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Partial' },
    overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Overdue' },
  };
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = config[status as keyof typeof config] || defaultConfig;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
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

  const { getStatusLabel, getPaymentMethodLabel } = useExpenseView(expense);

  // Format currency in Rupees
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  useEffect(() => {
    const loadExpense = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getExpenseById(id);
          if (data) {
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
  }, [id, getExpenseById, navigate, showError]);

  const handleDelete = async () => {
    if (!id) return;
    
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
    if (id) {
      navigate(`/purchases/expenses/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid expense ID');
    }
  };

  const handlePrint = () => {
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    warning('Download functionality will be implemented soon.');
  };

  // Dropdown items for ThreeDotDropdown in header
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
      label: 'Edit Expense',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Expense',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      danger: true,
    },
  ];

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
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || 'Expense not found'}</p>
          <button
            onClick={() => navigate('/purchases/expenses')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Expenses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/purchases/expenses')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{expense.expenseNumber}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Expense Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
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

        {/* Status Badge */}
        <div className="mb-6">
          <StatusBadge status={expense.paymentStatus} />
          <span className="ml-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            {getPaymentMethodLabel()}
          </span>
          {expense.receiptNumber && (
            <span className="ml-2 px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
              Receipt: {expense.receiptNumber}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Expense Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Vendor</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {expense.vendorName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Category</label>
                  <p className="text-gray-900">{expense.category}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Sub Category</label>
                  <p className="text-gray-900">{expense.subCategory || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="text-gray-900">{expense.description || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm text-gray-500">Amount</label>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm text-gray-500">Tax Amount</label>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(expense.taxAmount || 0)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <label className="text-sm text-amber-600">Total Amount</label>
                  <p className="text-xl font-bold text-amber-700">{formatCurrency(expense.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-500" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Payment Method</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {getPaymentMethodLabel()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Payment Status</label>
                  <p className="text-gray-900">
                    <StatusBadge status={expense.paymentStatus} />
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Date</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Due Date</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Reference Number</label>
                  <p className="text-gray-900">{expense.referenceNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Bill Number</label>
                  <p className="text-gray-900">{expense.billNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {expense.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{expense.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Expense ID</span>
                  <span className="text-sm font-medium text-gray-900">#{expense.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Reference</span>
                  <span className="text-sm font-medium text-gray-900">{expense.referenceNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <span className="text-sm font-bold text-amber-600">{formatCurrency(expense.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium">
                    <StatusBadge status={expense.paymentStatus} />
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
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
                  Edit Expense
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4" />
                  Delete Expense
                </button>
                <button
                  onClick={() => navigate('/purchases/expenses')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Expenses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Replaces the custom delete modal */}
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