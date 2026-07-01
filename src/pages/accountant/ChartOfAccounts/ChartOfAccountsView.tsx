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
} from 'lucide-react';
import { useChartOfAccounts } from '../../../hooks/ChartOfAccounts/useChartOfAccounts';
import { useChartOfAccountsView } from '../../../hooks/ChartOfAccounts/useChartOfAccountsView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';

// Type Badge
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const colors: Record<string, string> = {
    asset: 'bg-blue-100 text-blue-700',
    liability: 'bg-red-100 text-red-700',
    equity: 'bg-purple-100 text-purple-700',
    revenue: 'bg-green-100 text-green-700',
    expense: 'bg-amber-100 text-amber-700'
  };
  const labels: Record<string, string> = {
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expense'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      {labels[type] || type}
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
          }
        } catch (err) {
          console.error('Error loading account:', err);
          setError('Error loading account');
        } finally {
          setLoading(false);
        }
      }
    };
    loadAccount();
  }, [id, getAccountById]);

  const handleDelete = async () => {
    if (id) {
      setDeleteLoading(true);
      try {
        await deleteAccount(id);
        navigate('/accountant/chart-of-accounts');
      } catch (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account');
        setShowDeleteModal(false);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/accountant/chart-of-accounts/${id}/edit`);
    }
  };

  const dropdownItems = [
    {
      label: 'Edit Account',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Account',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: () => setShowDeleteModal(true),
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
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          {error || 'Account not found'}
        </div>
      </div>
    );
  }

  const status = getStatusBadge();
  const system = getSystemBadge();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/accountant/chart-of-accounts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Account Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
          {status.label === 'Active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {status.label}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${system.color}`}>
          {system.label}
        </span>
        <TypeBadge type={account.type} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-500" />
              Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Account Code</label>
                <p className="text-gray-900 font-mono font-medium">{account.code}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Account Name</label>
                <p className="text-gray-900 font-medium">{account.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Account Type</label>
                <p className="text-gray-900"><TypeBadge type={account.type} /></p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Category</label>
                <p className="text-gray-900">{account.category}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Sub Category</label>
                <p className="text-gray-900">{account.subCategory || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Parent Account</label>
                <p className="text-gray-900">{account.parentAccountName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Description
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{account.description || 'No description provided'}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Account ID</span>
                <span className="text-sm font-medium text-gray-900">#{account.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Code</span>
                <span className="text-sm font-medium text-gray-900 font-mono">{account.code}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Type</span>
                <span className="text-sm font-medium">
                  <TypeBadge type={account.type} />
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Opening Balance</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(account.openingBalance || 0)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Current Balance</span>
                <span className="text-sm font-bold text-amber-600">{formatCurrency(account.currentBalance || 0)}</span>
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
                Edit Account
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash className="h-4 w-4" />
                Delete Account
              </button>
              <button
                onClick={() => navigate('/accountant/chart-of-accounts')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Accounts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete account "<span className="font-medium">{account.name}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading ? <LoadingSpinner size="sm" /> : <Trash className="h-4 w-4" />}
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccountsView;