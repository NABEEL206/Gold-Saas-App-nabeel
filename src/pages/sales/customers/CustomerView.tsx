// src/pages/sales/customers/CustomerView.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { ThreeDotDropdownItem } from '../../../components/common/ThreeDotDropdown';
import type { Customer } from '../../../types/customer/CustomerTypes';

const CustomerView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, deleteCustomer, loading } = useCustomers();
  
  const {
    success,
    error: showError,
    withConfirmation,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  // Delete handler with confirmation
  const handleDeleteClick = useCallback(async () => {
    if (!customer) return;
    
    await withConfirmation(
      {
        title: 'Delete Customer',
        message: `Are you sure you want to delete "${customer.displayName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleting(true);
        try {
          await deleteCustomer(customer.id);
          success(`Customer "${customer.displayName}" deleted successfully.`);
          // Navigate to customers list after successful deletion
          navigate('/customers', { replace: true });
        } catch (err) {
          showError('Failed to delete customer. Please try again.');
        } finally {
          setDeleting(false);
        }
      }
    );
  }, [customer, withConfirmation, deleteCustomer, success, showError, navigate]);

  // Export handler
  const handleExport = useCallback(async (format: 'pdf' | 'excel') => {
    if (!customer) return;
    
    setExportLoading(true);
    try {
      // TODO: Replace with actual export API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Customer exported as ${format.toUpperCase()} successfully.`);
    } catch (err) {
      showError(`Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExportLoading(false);
    }
  }, [customer, success, showError]);

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Navigation handlers
  const handleEdit = useCallback(() => {
    if (customer) {
      navigate(`/customers/edit/${customer.id}`);
    }
  }, [customer, navigate]);

  // Go back to previous page or customers list
  const handleGoBack = useCallback(() => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      navigate('/customers'); // Fallback to customers list
    }
  }, [navigate]);

  // Get dropdown items for the header
  const getHeaderDropdownItems = useCallback((): ThreeDotDropdownItem[] => {
    const items: ThreeDotDropdownItem[] = [
      {
        label: 'Export as PDF',
        icon: <File className="h-4 w-4 text-red-500" />,
        onClick: () => handleExport('pdf'),
        disabled: exportLoading,
      },
      {
        label: 'Export as Excel',
        icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
        onClick: () => handleExport('excel'),
        disabled: exportLoading,
      },
      {
        label: 'Print',
        icon: <Printer className="h-4 w-4 text-blue-500" />,
        onClick: handlePrint,
      },
    ];

    return items;
  }, [handleExport, handlePrint, exportLoading]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive': return <Clock className="h-5 w-5 text-gray-500" />;
      case 'suspended': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }, []);

  // Format date helper
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

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
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
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
            {/* Edit Button */}
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            
            {/* Delete Button */}
            <button
              onClick={handleDeleteClick}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
            
            {/* More Options Dropdown */}
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
                      {[customer.salutation, customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'N/A'}
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

              {/* Meta Information */}
              <div className="md:col-span-2 border-t border-gray-200 pt-4">
                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created:</span>
                    {formatDate(customer.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Last Updated:</span>
                    {formatDate(customer.updatedAt)}
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


<ConfirmationModal
  isOpen={modalOpen}
  onClose={onModalCancel}    // This just closes the modal, no navigation
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

export default CustomerView;