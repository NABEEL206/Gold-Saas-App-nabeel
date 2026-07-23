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

// ============================================================
// STATUS CONFIGURATION - Single source of truth (shared with List page)
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
  inactive: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Inactive',
  },
  suspended: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Suspended',
  },
};

// Account Type Configuration (shared with List page)
const ACCOUNT_TYPE_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  savings: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    label: 'Savings',
  },
  current: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    label: 'Current',
  },
  fixed_deposit: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    label: 'Fixed Deposit',
  },
  recurring_deposit: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    label: 'Recurring Deposit',
  },
  salary: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    label: 'Salary',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
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

// Account Type Badge Component
const AccountTypeBadge: React.FC<{ accountType: string }> = ({ accountType }) => {
  const config = ACCOUNT_TYPE_CONFIG[accountType] || ACCOUNT_TYPE_CONFIG.savings;
  const { bg, color, label } = config;
  
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: bg,
        color: color,
      }}
    >
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
      icon: <Printer className="h-4 w-4" style={{ color: 'var(--foreground-secondary)' }} />,
      onClick: handlePrint,
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: handleDownload,
    },
    {
      label: 'Edit Bank',
      icon: <Edit className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Bank',
      icon: <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />,
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
          <Building2 className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {error || 'Bank not found'}
          </p>
          <button
            onClick={() => navigate('/banking/banks')}
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
            Back to Banks
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
              onClick={() => navigate('/banking/banks')}
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
                {bank.bankName}
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Bank Details
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
          <span
            className="px-3 py-1 text-sm font-medium rounded-full inline-flex items-center gap-1 themed-transition"
            style={{
              background: 'var(--info-light)',
              color: 'var(--info)',
            }}
          >
            <CreditCard className="h-3 w-3" />
            {bank.accountNumber.slice(-4) ? `XXXX${bank.accountNumber.slice(-4)}` : 'N/A'}
          </span>
          <span
            className="px-3 py-1 text-sm font-medium rounded-full inline-flex items-center gap-1 themed-transition"
            style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            <Banknote className="h-3 w-3" />
            {bank.ifscCode}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bank Details */}
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
                <Building2 className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Bank Name
                  </label>
                  <p className="font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {bank.bankName}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Account Name
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {bank.accountName}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Account Number
                  </label>
                  <p className="font-mono themed-transition" style={{ color: 'var(--foreground)' }}>
                    {bank.accountNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Account Type
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    <AccountTypeBadge accountType={bank.accountType} />
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    IFSC Code
                  </label>
                  <p className="font-mono themed-transition" style={{ color: 'var(--foreground)' }}>
                    {bank.ifscCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Branch Name
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {bank.branchName}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Branch Address
                  </label>
                  <p className="flex items-start gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <MapPin className="w-4 h-4 mt-0.5" style={{ color: 'var(--foreground-tertiary)' }} />
                    {getFullAddress()}
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
                    Opening Balance
                  </label>
                  <p className="text-xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(bank.openingBalance)}
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
                    Current Balance
                  </label>
                  <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                    {formatCurrency(bank.currentBalance)}
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 themed-transition"
                  style={{ background: 'var(--surface)' }}
                >
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Currency
                  </label>
                  <p className="text-xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
                    {bank.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            {bank.contactPerson || bank.contactPhone || bank.contactEmail ? (
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
                  <User className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bank.contactPerson && (
                    <div>
                      <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        Contact Person
                      </label>
                      <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                        {bank.contactPerson}
                      </p>
                    </div>
                  )}
                  {bank.contactPhone && (
                    <div>
                      <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        Contact Phone
                      </label>
                      <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                        <Phone className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                        {bank.contactPhone}
                      </p>
                    </div>
                  )}
                  {bank.contactEmail && (
                    <div className="md:col-span-2">
                      <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        Contact Email
                      </label>
                      <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                        <Mail className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                        {bank.contactEmail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Notes */}
            {bank.notes && (
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
                  {bank.notes}
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
                    Bank ID
                  </span>
                  <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    #{bank.id}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Account Type
                  </span>
                  <span className="text-sm font-medium">
                    <AccountTypeBadge accountType={bank.accountType} />
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    IFSC Code
                  </span>
                  <span className="text-sm font-medium font-mono themed-transition" style={{ color: 'var(--foreground)' }}>
                    {bank.ifscCode}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Status
                  </span>
                  <span className="text-sm font-medium">
                    <StatusBadge status={bank.status} />
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Current Balance
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                    {formatCurrency(bank.currentBalance)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Created
                  </span>
                  <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {bank.createdAt ? new Date(bank.createdAt).toLocaleDateString() : 'N/A'}
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
                  Edit Bank
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
                  Delete Bank
                </button>
                <button
                  onClick={() => navigate('/banking/banks')}
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
                  Back to Banks
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

export default BankView;