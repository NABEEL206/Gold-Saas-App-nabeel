// src/pages/banking/Banks/BankView.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  Building2,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Banknote,
  Printer,
  Download,
} from 'lucide-react';
import { useBank } from '../../hooks/Bank/useBank';
import { useBankView } from '../../hooks/Bank/useBankView';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../hooks/ToastConfirmModal/useToastAndConfirm';

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Inactive' },
    suspended: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Suspended' },
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

// Account Type Badge
const AccountTypeBadge: React.FC<{ accountType: string }> = ({ accountType }) => {
  const config = {
    savings: { color: 'bg-blue-100 text-blue-700', label: 'Savings' },
    current: { color: 'bg-purple-100 text-purple-700', label: 'Current' },
    fixed_deposit: { color: 'bg-amber-100 text-amber-700', label: 'Fixed Deposit' },
    recurring_deposit: { color: 'bg-green-100 text-green-700', label: 'Recurring Deposit' },
    salary: { color: 'bg-pink-100 text-pink-700', label: 'Salary' },
  };
  const { color, label } = config[accountType as keyof typeof config] || { color: 'bg-gray-100 text-gray-700', label: accountType };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const BankView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getBankById, deleteBank } = useBank();
  const [bank, setBank] = useState<any>(null);
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

  const { 
    formatCurrency,
    getFullAddress,
    getAccountTypeLabel
  } = useBankView(bank);

  useEffect(() => {
    const loadBank = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getBankById(id);
          if (data) {
            setBank(data);
          } else {
            setError('Bank not found');
            showError('Bank not found');
          }
        } catch (err) {
          console.error('Error loading bank:', err);
          setError('Error loading bank');
          showError('Failed to load bank details. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        showError('Invalid bank ID');
        navigate('/banking/banks');
      }
    };
    loadBank();
  }, [id, getBankById, navigate, showError]);

  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Bank',
        message: `Are you sure you want to delete bank "${bank?.bankName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteBank(id);
            navigate('/banking/banks');
          },
          'Deleting bank...',
          `Bank "${bank?.bankName}" deleted successfully.`,
          'Failed to delete bank. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Bank ID:', id);
    if (id) {
      navigate(`/banking/banks/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid bank ID');
    }
  };

  const handlePrint = () => {
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    warning('Download functionality will be implemented soon.');
  };

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
      label: 'Edit Bank',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Bank',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading bank details..." />
      </div>
    );
  }

  if (error || !bank) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || 'Bank not found'}</p>
          <button
            onClick={() => navigate('/banking/banks')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Banks
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
              onClick={() => navigate('/banking/banks')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{bank.bankName}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Bank Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Bank
            </button>
            <ThreeDotDropdown
              items={dropdownItems}
              position="right"
            />
          </div>
        </div>

        {/* Status Badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <StatusBadge status={bank.status} />
          <AccountTypeBadge accountType={bank.accountType} />
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 inline-flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            {bank.accountNumber.slice(-4) ? `XXXX${bank.accountNumber.slice(-4)}` : 'N/A'}
          </span>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 inline-flex items-center gap-1">
            <Banknote className="h-3 w-3" />
            {bank.ifscCode}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bank Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-500" />
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Bank Name</label>
                  <p className="text-gray-900 font-medium">{bank.bankName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Name</label>
                  <p className="text-gray-900">{bank.accountName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Number</label>
                  <p className="text-gray-900 font-mono">{bank.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Type</label>
                  <p className="text-gray-900"><AccountTypeBadge accountType={bank.accountType} /></p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">IFSC Code</label>
                  <p className="text-gray-900 font-mono">{bank.ifscCode}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Branch Name</label>
                  <p className="text-gray-900">{bank.branchName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Branch Address</label>
                  <p className="text-gray-900 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    {getFullAddress()}
                  </p>
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
                  <label className="text-sm text-gray-500">Opening Balance</label>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(bank.openingBalance)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <label className="text-sm text-amber-600">Current Balance</label>
                  <p className="text-xl font-bold text-amber-700">{formatCurrency(bank.currentBalance)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm text-gray-500">Currency</label>
                  <p className="text-xl font-bold text-gray-900">{bank.currency}</p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            {bank.contactPerson || bank.contactPhone || bank.contactEmail ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bank.contactPerson && (
                    <div>
                      <label className="text-sm text-gray-500">Contact Person</label>
                      <p className="text-gray-900">{bank.contactPerson}</p>
                    </div>
                  )}
                  {bank.contactPhone && (
                    <div>
                      <label className="text-sm text-gray-500">Contact Phone</label>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {bank.contactPhone}
                      </p>
                    </div>
                  )}
                  {bank.contactEmail && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500">Contact Email</label>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {bank.contactEmail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Notes */}
            {bank.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{bank.notes}</p>
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
                  <span className="text-sm text-gray-500">Bank ID</span>
                  <span className="text-sm font-medium text-gray-900">#{bank.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Account Type</span>
                  <span className="text-sm font-medium"><AccountTypeBadge accountType={bank.accountType} /></span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">IFSC Code</span>
                  <span className="text-sm font-medium font-mono">{bank.ifscCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium">
                    <StatusBadge status={bank.status} />
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Current Balance</span>
                  <span className="text-sm font-bold text-amber-600">{formatCurrency(bank.currentBalance)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bank.createdAt ? new Date(bank.createdAt).toLocaleDateString() : 'N/A'}
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
                  Edit Bank
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4" />
                  Delete Bank
                </button>
                <button
                  onClick={() => navigate('/banking/banks')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Banks
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

export default BankView;