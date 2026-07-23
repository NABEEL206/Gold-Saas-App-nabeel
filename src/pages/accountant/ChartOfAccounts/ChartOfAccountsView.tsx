// src/pages/accountant/ChartOfAccounts/ChartOfAccountsView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  BookOpen,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  User,
  Calendar,
  Hash,
  Building2,
  Tag,
  Printer,
  Download,
} from 'lucide-react';
import { useChartOfAccounts } from '../../../hooks/ChartOfAccounts/useChartOfAccounts';
import { useChartOfAccountsView } from '../../../hooks/ChartOfAccounts/useChartOfAccountsView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// ============================================================
// ACCOUNT TYPE CONFIGURATION - Single source of truth (shared with List page)
// ============================================================

const ACCOUNT_TYPE_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  asset: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    label: 'Asset',
  },
  liability: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    label: 'Liability',
  },
  equity: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    label: 'Equity',
  },
  revenue: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    label: 'Revenue',
  },
  expense: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    label: 'Expense',
  },
};

// Status Configuration
const STATUS_CONFIG = {
  active: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    label: 'Active',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  inactive: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    label: 'Inactive',
    icon: <XCircle className="h-3 w-3" />,
  },
};

// System Account Configuration
const SYSTEM_CONFIG = {
  system: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    label: 'System',
  },
  custom: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    label: 'Custom',
  },
};

// Type Badge Component
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const config = ACCOUNT_TYPE_CONFIG[type] || ACCOUNT_TYPE_CONFIG.asset;
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

const ChartOfAccountsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getAccountById, deleteAccount } = useChartOfAccounts();
  const [account, setAccount] = useState<any>(null);
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
    getStatusBadge,
    getSystemBadge
  } = useChartOfAccountsView(account);

  useEffect(() => {
    const loadAccount = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getAccountById(id);
          if (data) {
            setAccount(data);
          } else {
            setError('Account not found');
            showError('Account not found');
          }
        } catch (err) {
          console.error('Error loading account:', err);
          setError('Error loading account');
          showError('Failed to load account details. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        showError('Invalid account ID');
        navigate('/accountant/chart-of-accounts');
      }
    };
    loadAccount();
  }, [id, getAccountById, navigate, showError]);

  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Account',
        message: `Are you sure you want to delete account "${account?.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteAccount(id);
            navigate('/accountant/chart-of-accounts');
          },
          'Deleting account...',
          `Account "${account?.name}" deleted successfully.`,
          'Failed to delete account. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Account ID:', id);
    if (id) {
      navigate(`/accountant/chart-of-accounts/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid account ID');
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
      label: 'Edit Account',
      icon: <Edit className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Account',
      icon: <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading account details..." />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {error || 'Account not found'}
          </p>
          <button
            onClick={() => navigate('/accountant/chart-of-accounts')}
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
            Back to Chart of Accounts
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusBadge();
  const system = getSystemBadge();

  // Get status config
  const statusConfig = account.isActive ? STATUS_CONFIG.active : STATUS_CONFIG.inactive;

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
              onClick={() => navigate('/accountant/chart-of-accounts')}
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
                {account.name}
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Account Details
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
              Edit Account
            </button>
            <ThreeDotDropdown
              items={dropdownItems}
              position="right"
            />
          </div>
        </div>

        {/* Status Badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
            style={{
              background: statusConfig.bg,
              color: statusConfig.color,
            }}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
            style={{
              background: account.isSystemAccount ? SYSTEM_CONFIG.system.bg : SYSTEM_CONFIG.custom.bg,
              color: account.isSystemAccount ? SYSTEM_CONFIG.system.color : SYSTEM_CONFIG.custom.color,
            }}
          >
            {account.isSystemAccount ? SYSTEM_CONFIG.system.label : SYSTEM_CONFIG.custom.label}
          </span>
          <TypeBadge type={account.type} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details */}
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
                <BookOpen className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Account Code
                  </label>
                  <p className="font-mono font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {account.code}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Account Name
                  </label>
                  <p className="font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {account.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Account Type
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    <TypeBadge type={account.type} />
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Category
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {account.category}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Sub Category
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {account.subCategory || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Parent Account
                  </label>
                  <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                    {account.parentAccountName || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
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
                Description
              </h3>
              <p className="whitespace-pre-wrap themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                {account.description || 'No description provided'}
              </p>
            </div>
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
                    Account ID
                  </span>
                  <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    #{account.id}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Code
                  </span>
                  <span className="text-sm font-medium font-mono themed-transition" style={{ color: 'var(--foreground)' }}>
                    {account.code}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Type
                  </span>
                  <span className="text-sm font-medium">
                    <TypeBadge type={account.type} />
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Status
                  </span>
                  <span
                    className="text-sm font-medium themed-transition"
                    style={{
                      color: account.isActive ? 'var(--success)' : 'var(--error)',
                    }}
                  >
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Opening Balance
                  </span>
                  <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(account.openingBalance || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Current Balance
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                    {formatCurrency(account.currentBalance || 0)}
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
                  Edit Account
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
                  Delete Account
                </button>
                <button
                  onClick={() => navigate('/accountant/chart-of-accounts')}
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
                  Back to Accounts
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

export default ChartOfAccountsView;