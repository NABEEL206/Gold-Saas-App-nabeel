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
} from 'lucide-react';
import { useVendor } from '../../../hooks/vendor/useVendor';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Inactive' },
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadVendor = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getVendorById(id);
          if (data) {
            setVendor(data);
          } else {
            setVendor(DEMO_VENDOR);
          }
        } catch (err) {
          console.error('Error loading vendor:', err);
          setVendor(DEMO_VENDOR);
        } finally {
          setLoading(false);
        }
      }
    };
    loadVendor();
  }, [id, getVendorById]);

  const handleDelete = async () => {
    if (id) {
      setDeleteLoading(true);
      try {
        await deleteVendor(id);
        navigate('/purchases/vendors');
      } catch (error) {
        console.error('Error deleting vendor:', error);
        setError('Failed to delete vendor');
        setShowDeleteModal(false);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Handle edit navigation with proper path
  const handleEdit = () => {
    if (id) {
      navigate(`/purchases/vendors/${id}/edit`);
    }
  };

  // Dropdown items for ThreeDotDropdown in header
  const dropdownItems = [
    {
      label: 'Edit Vendor',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Vendor',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: () => setShowDeleteModal(true),
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
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          {error || 'Vendor not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchases/vendors')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Vendor Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
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

      {/* Status Badge */}
      <div className="mb-6">
        <StatusBadge status={vendor.status} />
        {vendor.name && vendor.email && vendor.phone && vendor.address && (
          <span className="ml-2 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
            Complete Profile
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-500" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Company Name</label>
                <p className="text-gray-900 font-medium">{vendor.company || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Tax ID</label>
                <p className="text-gray-900">{vendor.taxId || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Website</label>
                <p className="text-gray-900">
                  {vendor.website ? (
                    <a 
                      href={vendor.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-amber-600 hover:underline"
                    >
                      {vendor.website}
                    </a>
                  ) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p className="text-gray-900">
                  <StatusBadge status={vendor.status} />
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {vendor.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {vendor.phone || 'N/A'}
                </p>
              </div>
              {vendor.contactPerson && (
                <div>
                  <label className="text-sm text-gray-500">Contact Person</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    {vendor.contactPerson}
                  </p>
                </div>
              )}
              {vendor.contactEmail && (
                <div>
                  <label className="text-sm text-gray-500">Contact Email</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {vendor.contactEmail}
                  </p>
                </div>
              )}
              {vendor.contactPhone && (
                <div>
                  <label className="text-sm text-gray-500">Contact Phone</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {vendor.contactPhone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              Address
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <p className="text-gray-900">{vendor.address || 'N/A'}</p>
              <p className="text-gray-900">
                {vendor.city && vendor.state && vendor.zipCode
                  ? `${vendor.city}, ${vendor.state} ${vendor.zipCode}`
                  : vendor.city || vendor.state || vendor.zipCode || 'N/A'}
              </p>
              <p className="text-gray-900">{vendor.country || 'N/A'}</p>
            </div>
          </div>

          {/* Notes */}
          {vendor.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{vendor.notes}</p>
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
                <span className="text-sm text-gray-500">Vendor ID</span>
                <span className="text-sm font-medium text-gray-900">#{vendor.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm font-medium text-gray-900">
                  {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Profile Status</span>
                <span className={`text-sm font-medium ${vendor.name && vendor.email && vendor.phone && vendor.address ? 'text-green-600' : 'text-yellow-600'}`}>
                  {vendor.name && vendor.email && vendor.phone && vendor.address ? 'Complete' : 'Incomplete'}
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
                Edit Vendor
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash className="h-4 w-4" />
                Delete Vendor
              </button>
              <button
                onClick={() => navigate('/purchases/vendors')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Vendors
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
              <h2 className="text-xl font-bold text-gray-900">Delete Vendor</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{vendor.name}</span>"? 
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

export default VendorView;