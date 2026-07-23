// src/pages/purchases/Vendors/VendorView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  User, 
  Trash,
  CheckCircle,
  Clock,
  Users,
  Printer,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useVendor } from '../../../hooks/vendor/useVendor';
import { useVendorView } from '../../../hooks/vendor/useVendorView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { validateVendorForm, formatValidationErrors } from '../../../validations/vendor.validation';
import type { VendorFormData } from '../../../types/Vendor/VendorType';

// ============================================================
// STATUS CONFIGURATION - Single source of truth
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

// Demo vendor data for view (since we're using mock data)
const DEMO_VENDOR = {
  id: 1,
  name: 'Tech Solutions Inc.',
  email: 'info@techsolutions.com',
  phone: '+1 (555) 123-4567',
  company: 'Tech Solutions Inc.',
  address: '123 Tech Park',
  city: 'San Francisco',
  state: 'CA',
  country: 'USA',
  zipCode: '94105',
  taxId: '12-3456789',
  website: 'https://techsolutions.com',
  status: 'active' as const,
  contactPerson: 'John Doe',
  contactEmail: 'john@techsolutions.com',
  contactPhone: '+1 (555) 987-6543',
  notes: 'Preferred vendor for IT equipment and software solutions. Has been providing excellent service since 2020.',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15'
};

const VendorView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getVendorById, deleteVendor } = useVendor();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // Use the vendor view hook
  const {
    getDisplayName,
    getCompanyInfo,
    getContactInfo,
    getFullAddress,
    getStatusColor,
    getStatusLabel,
    isComplete,
    getSummary,
  } = useVendorView(vendor);

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

  useEffect(() => {
    const loadVendor = async () => {
      if (id) {
        setLoading(true);
        setError(null);
        setValidationErrors({});
        setShowValidationSummary(false);
        
        try {
          const data = await getVendorById(id);
          if (data) {
            // Validate the loaded vendor data
            const validationResult = validateVendorForm(data as VendorFormData);
            if (!validationResult.isValid) {
              const formattedErrors = formatValidationErrors(validationResult.errors);
              setValidationErrors(formattedErrors);
              setShowValidationSummary(true);
              warning('Vendor data has validation issues. Please review the details below.');
            }
            setVendor(data);
          } else {
            setVendor(DEMO_VENDOR);
            warning('Vendor not found in database. Showing demo data.');
          }
        } catch (err) {
          console.error('Error loading vendor:', err);
          setVendor(DEMO_VENDOR);
          setError('Failed to load vendor details. Showing demo data.');
          showError('Failed to load vendor details. Showing demo data.');
        } finally {
          setLoading(false);
        }
      } else {
        showError('Invalid vendor ID');
        navigate('/purchases/vendors');
      }
    };
    loadVendor();
  }, [id, getVendorById, navigate, showError, warning]);

  const handleDelete = async () => {
    if (!id) return;
    
    // Validate before delete
    if (!vendor) {
      setValidationErrors({ delete: 'No vendor data available to delete.' });
      setShowValidationSummary(true);
      showError('No vendor data available to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Vendor',
        message: `Are you sure you want to delete "${vendor?.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteVendor(id);
            setValidationErrors({});
            setShowValidationSummary(false);
            navigate('/purchases/vendors');
          },
          'Deleting vendor...',
          `Vendor "${vendor?.name}" deleted successfully.`,
          'Failed to delete vendor. Please try again.'
        );
      }
    );
  };

  // Handle edit navigation with validation
  const handleEdit = () => {
    console.log('Edit clicked - Vendor ID:', id);
    
    // Validate before navigating to edit
    if (!id) {
      setValidationErrors({ edit: 'Cannot edit: Invalid vendor ID' });
      setShowValidationSummary(true);
      showError('Cannot edit: Invalid vendor ID');
      return;
    }

    if (!vendor) {
      setValidationErrors({ edit: 'Cannot edit: Vendor data not loaded' });
      setShowValidationSummary(true);
      showError('Cannot edit: Vendor data not loaded');
      return;
    }

    setValidationErrors({});
    setShowValidationSummary(false);
    navigate(`/purchases/vendors/${id}/edit`);
  };

  const handlePrint = () => {
    // Validate before printing
    if (!vendor) {
      setValidationErrors({ print: 'Cannot print: No vendor data available' });
      setShowValidationSummary(true);
      showError('Cannot print: No vendor data available');
      return;
    }

    setValidationErrors({});
    setShowValidationSummary(false);
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    // Validate before downloading
    if (!vendor) {
      setValidationErrors({ download: 'Cannot download: No vendor data available' });
      setShowValidationSummary(true);
      showError('Cannot download: No vendor data available');
      return;
    }

    setValidationErrors({});
    setShowValidationSummary(false);
    warning('Download functionality will be implemented soon.');
  };

  // Dropdown items for ThreeDotDropdown in header
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
      label: 'Edit Vendor',
      icon: <Edit className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Vendor',
      icon: <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading vendor details..." />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {error || 'Vendor not found'}
          </p>
          <button
            onClick={() => navigate('/purchases/vendors')}
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
            Back to Vendors
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchases/vendors')}
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
              {getDisplayName}
            </h1>
            <p
              className="text-sm mt-0.5 themed-transition"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              Vendor Details
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
            Edit Vendor
          </button>
          <ThreeDotDropdown
            items={dropdownItems}
            position="right"
          />
        </div>
      </div>

      {/* Error Summary - Shows validation errors */}
      {showValidationSummary && Object.keys(validationErrors).length > 0 && (
        <ErrorSummary
          errors={validationErrors}
          title="Validation Issues Found:"
          variant="error"
          onClose={() => {
            setShowValidationSummary(false);
            setValidationErrors({});
          }}
          showIcon={true}
          showBadge={false}
        />
      )}

      {/* Status Badge */}
      <div className="mb-6">
        <StatusBadge status={vendor.status} />
        {isComplete && (
          <span
            className="ml-2 px-3 py-1 text-sm font-medium rounded-full themed-transition"
            style={{
              background: 'var(--success-light)',
              color: 'var(--success)',
            }}
          >
            Complete Profile
          </span>
        )}
        {!isComplete && (
          <span
            className="ml-2 px-3 py-1 text-sm font-medium rounded-full themed-transition"
            style={{
              background: 'var(--warning-light)',
              color: 'var(--warning)',
            }}
          >
            Incomplete Profile
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
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
              <Building className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Company Name
                </label>
                <p className="font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                  {getCompanyInfo || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Tax ID
                </label>
                <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                  {vendor.taxId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Website
                </label>
                <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                  {vendor.website ? (
                    <a 
                      href={vendor.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline themed-transition"
                      style={{ color: 'var(--primary)' }}
                    >
                      {vendor.website}
                    </a>
                  ) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Status
                </label>
                <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                  <StatusBadge status={vendor.status} />
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
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
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Email
                </label>
                <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                  <Mail className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                  {vendor.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Phone
                </label>
                <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                  <Phone className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                  {vendor.phone || 'N/A'}
                </p>
              </div>
              {vendor.contactPerson && (
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Contact Person
                  </label>
                  <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <Users className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    {vendor.contactPerson}
                  </p>
                </div>
              )}
              {vendor.contactEmail && (
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Contact Email
                  </label>
                  <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <Mail className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    {vendor.contactEmail}
                  </p>
                </div>
              )}
              {vendor.contactPhone && (
                <div>
                  <label className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    Contact Phone
                  </label>
                  <p className="flex items-center gap-2 themed-transition" style={{ color: 'var(--foreground)' }}>
                    <Phone className="w-4 h-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    {vendor.contactPhone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
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
              <MapPin className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
              Address
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                {vendor.address || 'N/A'}
              </p>
              <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                {vendor.city && vendor.state && vendor.zipCode
                  ? `${vendor.city}, ${vendor.state} ${vendor.zipCode}`
                  : vendor.city || vendor.state || vendor.zipCode || 'N/A'}
              </p>
              <p className="themed-transition" style={{ color: 'var(--foreground)' }}>
                {vendor.country || 'N/A'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {vendor.notes && (
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
                {vendor.notes}
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
                  Vendor ID
                </span>
                <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                  #{vendor.id}
                </span>
              </div>
              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Created
                </span>
                <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                  {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Last Updated
                </span>
                <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                  {vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Profile Status
                </span>
                <span
                  className={`text-sm font-medium themed-transition ${
                    isComplete ? 'text-green-600' : 'text-yellow-600'
                  }`}
                  style={{
                    color: isComplete ? 'var(--success)' : 'var(--warning)',
                  }}
                >
                  {isComplete ? 'Complete' : 'Incomplete'}
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
                Edit Vendor
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
                Delete Vendor
              </button>
              <button
                onClick={() => navigate('/purchases/vendors')}
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
                Back to Vendors
              </button>
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

export default VendorView;