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
        icon: <File className="h-4 w-4" style={{ color: 'var(--error)' }} />,
        onClick: () => handleExport('pdf'),
        disabled: exportLoading,
      },
      {
        label: 'Export as Excel',
        icon: <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--success)' }} />,
        onClick: () => handleExport('excel'),
        disabled: exportLoading,
      },
      {
        label: 'Print',
        icon: <Printer className="h-4 w-4" style={{ color: 'var(--info)' }} />,
        onClick: handlePrint,
      },
    ];

    return items;
  }, [handleExport, handlePrint, exportLoading]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5" style={{ color: 'var(--success)' }} />;
      case 'inactive': return <Clock className="h-5 w-5" style={{ color: 'var(--foreground-tertiary)' }} />;
      case 'suspended': return <AlertCircle className="h-5 w-5" style={{ color: 'var(--error)' }} />;
      default: return null;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return { bg: 'var(--success-light)', text: 'var(--success)' };
      case 'inactive': return { bg: 'var(--surface-hover)', text: 'var(--foreground-secondary)' };
      case 'suspended': return { bg: 'var(--error-light)', text: 'var(--error)' };
      default: return { bg: 'var(--surface-hover)', text: 'var(--foreground-secondary)' };
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
      <div
        className="p-6 min-h-screen themed-transition"
        style={{ background: 'var(--background)' }}
      >
        <div
          className="rounded-lg p-6 text-center max-w-md mx-auto themed-transition"
          style={{
            background: 'var(--error-light)',
            border: '1px solid var(--error)',
          }}
        >
          <AlertCircle
            className="h-12 w-12 mx-auto mb-3"
            style={{ color: 'var(--error)' }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--error)' }}
          >
            Customer Not Found
          </h3>
          <p className="text-sm" style={{ color: 'var(--error)' }}>
            {error || 'Customer does not exist'}
          </p>
          <button
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
            style={{
              background: 'var(--error)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusStyles = getStatusColor(customer.status);

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-lg transition-colors themed-transition"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Go back"
            >
              <ArrowLeft
                className="h-5 w-5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="text-2xl font-bold themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  {customer.displayName}
                </h1>
                <span
                  className="text-sm themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  #{customer.customerCode}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
                  style={{
                    background: statusStyles.bg,
                    color: statusStyles.text,
                  }}
                >
                  {getStatusIcon(customer.status)}
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
              </div>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {customer.customerType.charAt(0).toUpperCase() + customer.customerType.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Edit Button */}
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            
            {/* Delete Button */}
            <button
              onClick={handleDeleteClick}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                color: 'var(--error)',
                background: 'var(--error-light)',
                border: '1px solid var(--error)',
              }}
              onMouseEnter={(e) => {
                if (!deleting) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {deleting ? (
                <>
                  <div
                    className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'var(--error)' }}
                  />
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
        <div
          className="rounded-xl shadow-sm themed-transition"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  <User className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Name
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {[customer.salutation, customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Display Name
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {customer.displayName}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Customer Type
                    </p>
                    <p
                      className="text-sm font-medium capitalize themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {customer.customerType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  <Mail className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Email
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {customer.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Work Phone
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {customer.workPhone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Mobile Number
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {customer.mobileNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  <MapPin className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                  Address
                </h3>
                <div className="space-y-3">
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Billing Address
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {customer.billingAddress || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p
                        className="text-xs themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        City
                      </p>
                      <p
                        className="text-sm font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {customer.city || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        State
                      </p>
                      <p
                        className="text-sm font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {customer.state || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Pincode
                      </p>
                      <p
                        className="text-sm font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {customer.pincode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Country
                      </p>
                      <p
                        className="text-sm font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {customer.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Tax */}
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  <CreditCard className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                  Financial & Tax
                </h3>
                <div className="space-y-3">
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Opening Balance
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      ₹{customer.openingBalance.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      Credit Limit
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      ₹{customer.creditLimit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      GST Number
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {customer.gstNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs themed-transition"
                      style={{ color: 'var(--foreground-tertiary)' }}
                    >
                      PAN Number
                    </p>
                    <p
                      className="text-sm font-medium themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {customer.panNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="md:col-span-2">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <FileText className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                    Notes
                  </h3>
                  <p
                    className="text-sm p-3 rounded-lg themed-transition"
                    style={{
                      color: 'var(--foreground)',
                      background: 'var(--surface-hover)',
                    }}
                  >
                    {customer.notes}
                  </p>
                </div>
              )}

              {/* Meta Information */}
              <div
                className="md:col-span-2 pt-4 themed-transition"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div className="flex flex-wrap gap-6 text-sm">
                  <div
                    className="flex items-center gap-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <Calendar className="h-4 w-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>Created:</span>
                    {formatDate(customer.createdAt)}
                  </div>
                  <div
                    className="flex items-center gap-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <Clock className="h-4 w-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>Last Updated:</span>
                    {formatDate(customer.updatedAt)}
                  </div>
                  <div
                    className="flex items-center gap-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <Users className="h-4 w-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>Created By:</span>
                    {customer.createdBy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default CustomerView;