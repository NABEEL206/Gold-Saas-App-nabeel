// src/pages/purchases/RecurringExpenses/RecurringExpenseEdit.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, User } from 'lucide-react';
import { useRecurringExpense } from '../../../hooks/RecurringExpense/useRecurringExpense';
import { useRecurringExpenseEdit } from '../../../hooks/RecurringExpense/useRecurringExpenseEdit';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { 
  RECURRING_CATEGORIES, 
  RECURRING_STATUSES, 
  FREQUENCY_LABELS 
} from '../../../types/RecurringExpense/RecurringExpenseType';

const RecurringExpenseEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getExpenseById, updateExpense } = useRecurringExpense();
  const [expense, setExpense] = useState<any>(null);
  const [loadingExpense, setLoadingExpense] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isVendorExpense, setIsVendorExpense] = useState(false);

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
    resetForm
  } = useRecurringExpenseEdit(expense);

  useEffect(() => {
    const loadExpense = async () => {
      if (id) {
        setLoadingExpense(true);
        setLoadError(null);
        try {
          const data = await getExpenseById(id);
          if (data) {
            setExpense(data);
            setIsVendorExpense(data.isVendorExpense || false);
            setFormData({
              vendorId: data.vendorId || '',
              vendorName: data.vendorName || '',
              category: data.category || '',
              subCategory: data.subCategory || '',
              amount: data.amount || 0,
              taxAmount: data.taxAmount || 0,
              totalAmount: data.totalAmount || 0,
              startDate: data.startDate || new Date().toISOString().split('T')[0],
              endDate: data.endDate || '',
              description: data.description || '',
              frequency: data.frequency || 'monthly',
              frequencyInterval: data.frequencyInterval || 1,
              frequencyUnit: data.frequencyUnit || 'months',
              paymentMethod: data.paymentMethod || 'bank',
              paymentStatus: data.paymentStatus || 'active',
              referenceNumber: data.referenceNumber || '',
              notes: data.notes || '',
              isVendorExpense: data.isVendorExpense || false,
              attachment: data.attachment || '',
              currency: data.currency || 'INR',
              exchangeRate: data.exchangeRate || 1,
              totalOccurrences: data.totalOccurrences || 12
            });
          } else {
            setLoadError('Recurring expense not found');
          }
        } catch (error) {
          console.error('Error loading recurring expense:', error);
          setLoadError('Error loading recurring expense data');
        } finally {
          setLoadingExpense(false);
        }
      }
    };
    loadExpense();
  }, [id, getExpenseById, setFormData]);

  const onSubmit = async () => {
    const success = await handleSubmit(updateExpense);
    if (success) {
      navigate('/purchases/recurring-expenses');
    }
  };

  if (loadingExpense) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading recurring expense details..." />
      </div>
    );
  }

  if (loadError || !expense) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          {loadError || 'Recurring expense not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchases/recurring-expenses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Recurring Expense</h1>
            <p className="text-sm text-gray-500 mt-0.5">{expense.recurringNumber}</p>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Form - Same fields as Create with pre-populated data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Same form fields as Create page with values from formData */}
          {/* ... (reuse the same form layout as Create page) */}
        </div>
      </div>
    </div>
  );
};

export default RecurringExpenseEdit;