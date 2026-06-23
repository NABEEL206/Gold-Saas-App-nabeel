// src/pages/Items/ItemView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Gem,
  Scale,
  Sparkles,
  DollarSign,
  ShoppingCart,
  Tag,
  Calendar,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Share2,
  Image as ImageIcon,
  Info,
  Hash,
  Weight,
  Badge,
  Crown,
  Layers,
  Box,
  Grid,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useItemDetails } from '../../hooks/items/useItemDetails';

// Define supported item status values locally to avoid invalid type imports.
type ItemStatus = 'active' | 'inactive' | 'out_of_stock' | 'low_stock';

// ==================== COMPONENTS ====================

// Status Badge Component
const StatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Inactive' },
    out_of_stock: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Out of Stock' },
    low_stock: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Low Stock' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
};

// Info Card Component
const InfoCard: React.FC<{
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon: Icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
};

// Detail Row Component
const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: any;
  className?: string;
}> = ({ label, value, icon: Icon, className = '' }) => {
  return (
    <div className={`flex items-start py-2 ${className}`}>
      <div className="flex items-center gap-2 w-1/2">
        {Icon && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="w-1/2 text-sm text-gray-900 font-medium">{value}</div>
    </div>
  );
};

// Image Gallery Component
const ImageGallery: React.FC<{ images: string[]; itemName: string }> = ({ images, itemName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div 
        className="relative bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
        onClick={() => setIsFullscreen(!isFullscreen)}
      >
        <img
          src={images[selectedImage]}
          alt={`${itemName} - Image ${selectedImage + 1}`}
          className="w-full h-64 object-contain bg-white"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(!isFullscreen);
          }}
          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedImage === index ? 'border-amber-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <XCircle className="h-8 w-8" />
          </button>
          <img
            src={images[selectedImage]}
            alt={`${itemName} - Fullscreen`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  selectedImage === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const ItemView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { loading, item, error, fetchItem, deleteItem, updateStatus } = useItemDetails();
  
  // Local states
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Fetch item on mount
  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id, fetchItem]);

  // ==================== HANDLERS ====================

  const handleEdit = () => {
    if (item) {
      navigate(`/items/edit/${item.id}`);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (window.confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
      setDeleteLoading(true);
      try {
        await deleteItem(item.id);
        navigate('/items');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleStatusToggle = async () => {
    if (!item) return;
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    setStatusUpdateLoading(true);
    try {
      await updateStatus(item.id, newStatus);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Item: ${item?.itemName}`,
          text: `Check out ${item?.itemName} - ${item?.itemCode}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // ==================== RENDER ====================

  // Loading State
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading item details..." />
      </div>
    );
  }

  // Error State
  if (error || !item) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700">Item Not Found</h3>
          <p className="text-sm text-red-600 mt-1">{error || 'The item you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/items')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="p-6 bg-gray-50 min-h-screen print:p-4">
      {/* ===== HEADER ===== */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 print:mb-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/items')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors print:hidden"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{item.itemName}</h1>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-sm text-gray-500">Code: {item.itemCode}</p>
              {item.category && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-sm text-gray-500">Category: {item.category}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            onClick={handleStatusToggle}
            disabled={statusUpdateLoading}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              item.status === 'active'
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {statusUpdateLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              item.status === 'active' ? (
                <>
                  <XCircle className="h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Activate
                </>
              )
            )}
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-4">
        {/* Left Column - Image Gallery */}
        <div className="lg:col-span-1 space-y-4">
          <ImageGallery images={item.images || []} itemName={item.itemName} />
          
          {/* Quick Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-500" />
              Quick Info
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={item.status} />
              </div>
              {item.openingStock !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock</span>
                  <span className={`font-medium ${item.openingStock <= (item.reorderLevel || 0) ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.openingStock} {item.unit || ''}
                    {item.openingStock <= (item.reorderLevel || 0) && (
                      <span className="ml-1 text-xs text-red-500">(Low)</span>
                    )}
                  </span>
                </div>
              )}
              {item.sellingPrice !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Selling Price</span>
                  <span className="font-medium text-gray-900">
                    {item.currency || 'INR'} {item.sellingPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {item.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Toggle Details View */}
          <button
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 print:hidden"
          >
            {showAllDetails ? 'Show Less' : 'Show All Details'}
          </button>

          {/* Basic Information */}
          <InfoCard title="Basic Information" icon={Package}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              <DetailRow label="Item Code" value={item.itemCode} icon={Hash} />
              <DetailRow label="Item Name" value={item.itemName} icon={Tag} />
              <DetailRow label="Item Type" value={item.itemType || '-'} icon={Box} />
              <DetailRow label="Category" value={item.category || '-'} icon={Layers} />
              <DetailRow label="Brand" value={item.brand || '-'} icon={Building} />
              <DetailRow label="Design Code" value={item.designCode || '-'} icon={Grid} />
            </div>
          </InfoCard>

          {/* Metal Information */}
          {(item.metalType || item.purity) && (
            <InfoCard title="Metal Information" icon={Gem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <DetailRow label="Metal Type" value={item.metalType || '-'} icon={Badge} />
                <DetailRow label="Purity" value={item.purity || '-'} icon={Crown} />
              </div>
            </InfoCard>
          )}

          {/* Weight & Dimensions */}
          {(item.grossWeight || item.netWeight || item.stoneWeight) && (
            <InfoCard title="Weight & Dimensions" icon={Scale}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                <DetailRow label="Gross Weight" value={item.grossWeight ? `${item.grossWeight} ${item.unit || 'g'}` : '-'} icon={Weight} />
                <DetailRow label="Net Weight" value={item.netWeight ? `${item.netWeight} ${item.unit || 'g'}` : '-'} icon={Weight} />
                <DetailRow label="Stone Weight" value={item.stoneWeight ? `${item.stoneWeight} ${item.unit || 'g'}` : '-'} icon={Weight} />
                <DetailRow label="Unit" value={item.unit || '-'} />
              </div>
            </InfoCard>
          )}

          {/* Diamond Information */}
          {(item.diamondPieces || item.caratWeight) && (
            <InfoCard title="Diamond Information" icon={Sparkles}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <DetailRow label="Diamond Pieces" value={item.diamondPieces || '0'} icon={Grid} />
                <DetailRow label="Carat Weight" value={item.caratWeight ? `${item.caratWeight} ct` : '-'} icon={Weight} />
              </div>
            </InfoCard>
          )}

          {/* Pricing Information */}
          {(item.sellingPrice || item.mrp || item.goldRate) && (
            <InfoCard title="Pricing Information" icon={DollarSign}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <DetailRow 
                  label="Selling Price" 
                  value={item.sellingPrice ? `${item.currency || 'INR'} ${item.sellingPrice.toLocaleString()}` : '-'} 
                  icon={DollarSign}
                />
                <DetailRow label="MRP" value={item.mrp ? `${item.currency || 'INR'} ${item.mrp.toLocaleString()}` : '-'} icon={Tag} />
                <DetailRow label="Gold Rate" value={item.goldRate ? `${item.currency || 'INR'} ${item.goldRate.toLocaleString()}` : '-'} icon={DollarSign} />
                {item.mcType && (
                  <DetailRow
                    label="Making Charge"
                    value={
                      typeof item.mcType === 'string' && item.mcType === 'fixed'
                        ? `${item.currency || 'INR'} ${item.mcValue || 0}`
                        : `${item.mcValue || 0}%`
                    }
                    icon={DollarSign}
                  />
                )}
              </div>
            </InfoCard>
          )}

          {/* Inventory & Tax */}
          {(item.openingStock !== undefined || item.hsnCode || item.gstPercentage) && (
            <InfoCard title="Inventory & Tax" icon={ShoppingCart}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <DetailRow label="Opening Stock" value={item.openingStock !== undefined ? `${item.openingStock} ${item.unit || ''}` : '-'} icon={Package} />
                <DetailRow label="Reorder Level" value={item.reorderLevel !== undefined ? `${item.reorderLevel} ${item.unit || ''}` : '-'} icon={AlertCircle} />
                <DetailRow label="HSN Code" value={item.hsnCode || '-'} icon={Hash} />
                <DetailRow label="GST %" value={item.gstPercentage ? `${item.gstPercentage}%` : '-'} icon={Tag} />
              </div>
            </InfoCard>
          )}

          {/* Description */}
          {item.description && (
            <InfoCard title="Description" icon={Info}>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </InfoCard>
          )}

          {/* Additional Info */}
          <InfoCard title="Additional Information" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {item.createdAt && (
                <DetailRow label="Created At" value={new Date(item.createdAt).toLocaleString()} icon={Calendar} />
              )}
              {item.updatedAt && (
                <DetailRow label="Last Updated" value={new Date(item.updatedAt).toLocaleString()} icon={Calendar} />
              )}
              {item.createdBy && (
                <DetailRow label="Created By" value={item.createdBy} icon={User} />
              )}
            </div>
          </InfoCard>
        </div>
      </div>

      {/* ===== BOTTOM ACTIONS ===== */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 print:hidden">
        <button
          onClick={() => navigate('/items')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back to Items
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemView;