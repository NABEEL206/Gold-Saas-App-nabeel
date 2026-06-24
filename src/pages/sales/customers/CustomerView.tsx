// src/pages/sales/customers/CustomerView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  FileText,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Download,
  Users,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { useCustomers } from '../../../hooks/customer/useCustomers';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { ThreeDotDropdownItem } from '../../../components/common/ThreeDotDropdown';
import type { Customer } from '../../../types/customer/CustomerTypes';

const CustomerView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, deleteCustomer, loading } = useCustomers();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getCustomer(id);
      if (found) {
        setCustomer(found);
        setError(null);
      } else {
        setCustomer(null);
        setError('Customer not found');
      }
    }
  }, [id, getCustomer]);

  const handleDelete = async () => {
    if (!customer) return;
    setDeleting(true);
    try {
      await deleteCustomer(customer.id);
      navigate('/customers');
    } catch (error) {
      setError('Failed to delete customer');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Exporting customer as ${format.toUpperCase()}`);
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Get dropdown items for the header
  const getHeaderDropdownItems = (): ThreeDotDropdownItem[] => {
    const items: ThreeDotDropdownItem[] = [];

    items.push({
      label: 'Export as PDF',
      icon: <File className="h-4 w-4 text-red-500" />,
      onClick: () => handleExport('pdf'),
      disabled: exportLoading,
    });

    items.push({
      label: 'Export as Excel',
      icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
      onClick: () => handleExport('excel'),
      disabled: exportLoading,
    });

    items.push({
      label: 'Print',
      icon: <Printer className="h-4 w-4 text-blue-500" />,
      onClick: handlePrint,
    });

    return items;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive': return <Clock className="h-5 w-5 text-gray-500" />;
      case 'suspended': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading customer details..." />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Customer Not Found</h3>
          <p className="text-sm text-red-600">{error || 'Customer does not exist'}</p>
          <button
            onClick={() => navigate('/customers')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/customers')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{customer.displayName}</h1>
                <span className="text-sm text-gray-500">#{customer.customerCode}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                  {getStatusIcon(customer.status)}
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {customer.customerType.charAt(0).toUpperCase() + customer.customerType.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Primary action buttons */}
            <button
              onClick={() => navigate(`/customers/edit/${customer.id}`)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            {/* ThreeDotDropdown with export actions */}
            <div onClick={(e) => e.stopPropagation()}>
              <ThreeDotDropdown 
                items={getHeaderDropdownItems()} 
                position="right"
              />
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.salutation} {customer.firstName} {customer.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Display Name</p>
                    <p className="text-sm font-medium text-gray-900">{customer.displayName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Customer Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{customer.customerType}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{customer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Work Phone</p>
                    <p className="text-sm font-medium text-gray-900">{customer.workPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mobile Number</p>
                    <p className="text-sm font-medium text-gray-900">{customer.mobileNumber}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Billing Address</p>
                    <p className="text-sm font-medium text-gray-900">{customer.billingAddress || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">City</p>
                      <p className="text-sm font-medium text-gray-900">{customer.city || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">State</p>
                      <p className="text-sm font-medium text-gray-900">{customer.state || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pincode</p>
                      <p className="text-sm font-medium text-gray-900">{customer.pincode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Country</p>
                      <p className="text-sm font-medium text-gray-900">{customer.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Tax */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Financial & Tax
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Opening Balance</p>
                    <p className="text-sm font-medium text-gray-900">₹{customer.openingBalance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Credit Limit</p>
                    <p className="text-sm font-medium text-gray-900">₹{customer.creditLimit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">{customer.gstNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">{customer.panNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{customer.notes}</p>
                </div>
              )}

              {/* Meta */}
              <div className="md:col-span-2 border-t border-gray-200 pt-4">
                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created:</span>
                    {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Last Updated:</span>
                    {new Date(customer.updatedAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Created By:</span> {customer.createdBy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">{customer.displayName}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;