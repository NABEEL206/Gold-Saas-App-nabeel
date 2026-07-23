// src/pages/sales/deliveryChallan/DeliveryChallanView.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Download,
  Edit,
  Trash2,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Receipt,
  Send,
  MapPin,
  Truck as TruckIcon,
  FileText,
  Eye,
  FileText as FileTextIcon,
} from "lucide-react";
import { useDeliveryChallan } from "../../../hooks/DeliveryChallan/useDeliveryChallan";
import ThreeDotDropdown from "../../../components/common/ThreeDotDropdown";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { useToastAndConfirm } from "../../../hooks/ToastConfirmModal/useToastAndConfirm";
import { DocumentRenderer } from "../../../Templates/DocumentRenderer";
import { formatCurrency } from "../../../utils/Invoice/calculations";
import type { DeliveryChallan } from "../../../types/deliveryChallan/DeliveryChallanTypes";
import type { DocumentData } from "../../../types/Template/TemplateTypes";

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

// Default company details - can be moved to a config file
const DEFAULT_COMPANY = {
  name: "JewelPro Solutions Pvt Ltd",
  address: "123, Gold Street, Zaveri Bazaar",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400002",
  country: "India",
  phone: "+91 98765 43210",
  email: "info@jewelpro.com",
  website: "www.jewelpro.com",
  gst: "27AABCG1234A1Z5",
  pan: "AABCG1234A",
};

// Status configuration - Single source of truth
const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  draft: {
    bg: "var(--surface-hover)",
    color: "var(--foreground-secondary)",
    icon: <Clock className="h-3 w-3" />,
    label: "Draft",
  },
  sent: {
    bg: "var(--info-light)",
    color: "var(--info)",
    icon: <Truck className="h-3 w-3" />,
    label: "Sent",
  },
  delivered: {
    bg: "var(--success-light)",
    color: "var(--success)",
    icon: <CheckCircle className="h-3 w-3" />,
    label: "Delivered",
  },
  cancelled: {
    bg: "var(--error-light)",
    color: "var(--error)",
    icon: <XCircle className="h-3 w-3" />,
    label: "Cancelled",
  },
};

type ViewMode = "details" | "preview";

// Status Badge Component
const StatusBadge: React.FC<{ status: DeliveryChallan["status"] }> = ({
  status,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
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

const DeliveryChallanView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    getChallan,
    updateStatus,
    deleteChallan,
    loading: hookLoading,
  } = useDeliveryChallan();
  const {
    success,
    error: showError,
    warning,
    withConfirmation,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const [loading, setLoading] = useState(true);
  const [challan, setChallan] = useState<DeliveryChallan | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("details");
  const [previewLayout, setPreviewLayout] = useState<
    "modern" | "classic" | "compact" | "minimal"
  >("modern");

  useEffect(() => {
    if (id) loadChallan(id);
    else {
      showError("Invalid ID");
      navigate("/sales/delivery-challan");
    }
  }, [id]);

  const loadChallan = async (challanId: string) => {
    setLoading(true);
    try {
      const data = (await getChallan(challanId)) as DeliveryChallan;
      const items = data.items?.length > 0 ? data.items : [];
      const itemsTotal = items.reduce(
        (sum, item) => sum + (item.total || 0),
        0,
      );
      const subtotal = data.subtotal || itemsTotal;
      const taxAmount =
        data.taxAmount || (subtotal * (data.taxRate || 18)) / 100;
      const total =
        data.total ||
        subtotal +
          taxAmount +
          (data.shippingCharge || 0) +
          (data.otherCharges || 0) -
          (data.discount || 0);
      setChallan({ ...data, items, subtotal, taxAmount, total });
    } catch {
      showError("Failed to load.");
      setChallan(null);
    } finally {
      setLoading(false);
    }
  };

  const documentData = useMemo((): DocumentData | null => {
    if (!challan) return null;
    return {
      documentNumber: challan.challanNumber,
      documentDate: new Date(challan.challanDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      company: DEFAULT_COMPANY,
      customer: {
        name: challan.customerName,
        address: challan.customerAddress || challan.deliveryAddress,
        phone: challan.customerPhone,
        email: challan.customerEmail,
        gst: challan.customerGst,
      },
      items: (challan.items || []).map((item) => ({
        name: item.productName,
        description: item.description || "",
        quantity: item.quantity,
        unit: item.unit || "Pcs",
        rate: item.rate,
        discount: item.discount,
        taxRate: item.taxRate,
        total: item.total || item.rate * item.quantity,
      })),
      subtotal: challan.subtotal,
      discountTotal: challan.discount,
      taxTotal: challan.taxAmount,
      shippingCharges: challan.shippingCharge,
      totalAmount: challan.total,
      notes: challan.notes,
      terms: challan.termsAndConditions,
      additionalFields: {
        "Delivery Date": new Date(challan.deliveryDate).toLocaleDateString(
          "en-IN",
        ),
        Transporter: challan.transporterName || "N/A",
        "Vehicle No": challan.vehicleNumber || "N/A",
        "LR Number": challan.lrNumber || "N/A",
      },
    };
  }, [challan]);

  const handleStatusUpdate = useCallback(
    async (status: DeliveryChallan["status"]) => {
      if (!id) return;
      const labels: Record<string, string> = {
        sent: "Send",
        delivered: "Mark Delivered",
        cancelled: "Cancel",
        draft: "Revert",
      };
      await withConfirmation(
        {
          title: `${labels[status]} Challan`,
          message: `${labels[status]} this challan?`,
          confirmText: labels[status],
          variant: status === "cancelled" ? "danger" : "primary",
        },
        async () => {
          setUpdating(true);
          try {
            await updateStatus(id, status);
            await loadChallan(id);
            success(`Challan ${status}.`);
          } catch {
            showError("Failed to update.");
          } finally {
            setUpdating(false);
          }
        },
      );
    },
    [id, withConfirmation, updateStatus, success, showError],
  );

  const handleDelete = useCallback(async () => {
    if (!id) return;
    await withConfirmation(
      {
        title: "Delete",
        message: "Delete this challan?",
        confirmText: "Delete",
        variant: "danger",
      },
      async () => {
        setDeleteLoading(true);
        try {
          await deleteChallan(id);
          success("Deleted.");
          navigate("/sales/delivery-challan");
        } catch {
          showError("Failed to delete.");
        } finally {
          setDeleteLoading(false);
        }
      },
    );
  }, [id, withConfirmation, deleteChallan, success, showError, navigate]);

  const handleEdit = useCallback(() => {
    if (id) navigate(`/sales/delivery-challan/${id}/edit`);
  }, [id, navigate]);
  
  const handlePrint = useCallback(() => {
    setViewMode("preview");
    setTimeout(() => window.print(), 300);
  }, []);
  
  const handleDownload = useCallback(() => {
    warning("Download coming soon.");
  }, [warning]);

  const dropdownItems = [
    {
      label: "Print",
      icon: <Printer className="h-4 w-4" style={{ color: 'var(--foreground-secondary)' }} />,
      onClick: handlePrint,
    },
    {
      label: "Download",
      icon: <Download className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: handleDownload,
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
      onClick: handleEdit,
      show: challan?.status === "draft",
    },
    {
      label: "Delete",
      icon: deleteLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash2 className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: handleDelete,
      show: challan?.status === "draft",
      disabled: deleteLoading,
    },
    {
      label: "Send",
      icon: <Send className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleStatusUpdate("sent"),
      show: challan?.status === "draft",
      disabled: updating,
    },
    {
      label: "Delivered",
      icon: <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />,
      onClick: () => handleStatusUpdate("delivered"),
      show: challan?.status === "sent",
      disabled: updating,
    },
    {
      label: "Cancel",
      icon: <XCircle className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: () => handleStatusUpdate("cancelled"),
      show: challan?.status === "draft" || challan?.status === "sent",
      disabled: updating,
    },
  ];

  if (loading || hookLoading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  
  if (!challan)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Truck className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Not found
          </p>
          <button
            onClick={() => navigate("/sales/delivery-challan")}
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
            Back
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-30 themed-transition"
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/sales/delivery-challan")}
              className="p-1.5 rounded-lg transition-colors themed-transition"
              style={{ color: 'var(--foreground-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5" style={{ color: 'var(--info)' }} />
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-lg font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {challan.challanNumber}
                  </h1>
                  <StatusBadge status={challan.status} />
                </div>
                <p
                  className="text-[11px] themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {new Date(challan.challanDate).toLocaleDateString()} |{" "}
                  {challan.customerName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div
              className="flex items-center rounded-lg p-0.5 themed-transition"
              style={{ background: 'var(--surface)' }}
            >
              <button
                onClick={() => setViewMode("details")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all themed-transition ${
                  viewMode === "details"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={{
                  background: viewMode === "details" ? 'var(--card)' : 'transparent',
                  color: viewMode === "details" ? 'var(--foreground)' : 'var(--foreground-secondary)',
                  boxShadow: viewMode === "details" ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                Details
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all themed-transition ${
                  viewMode === "preview"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={{
                  background: viewMode === "preview" ? 'var(--card)' : 'transparent',
                  color: viewMode === "preview" ? 'var(--foreground)' : 'var(--foreground-secondary)',
                  boxShadow: viewMode === "preview" ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                PDF View
              </button>
            </div>

            {/* Status Action Buttons */}
            {challan.status === "draft" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("sent")}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 themed-transition"
                  style={{
                    color: 'var(--info)',
                    background: 'var(--info-light)',
                    border: '1px solid var(--info)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 themed-transition"
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
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
              </>
            )}
            {challan.status === "sent" && (
              <button
                onClick={() => handleStatusUpdate("delivered")}
                className="px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 themed-transition"
                style={{
                  color: 'var(--success)',
                  background: 'var(--success-light)',
                  border: '1px solid var(--success)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Delivered
              </button>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <ThreeDotDropdown
                items={dropdownItems.filter((i) => i.show !== false)}
                position="right"
              />
            </div>
          </div>
        </div>

        {/* Preview Mode Layout Selector */}
        {viewMode === "preview" && (
          <div
            className="px-4 py-1.5 themed-transition flex items-center justify-between"
            style={{
              background: 'var(--surface)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex items-center gap-1 rounded-md p-0.5 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              {(["modern", "classic", "compact", "minimal"] as const).map(
                (layout) => (
                  <button
                    key={layout}
                    onClick={() => setPreviewLayout(layout)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors capitalize themed-transition ${
                      previewLayout === layout
                        ? "text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    style={{
                      background: previewLayout === layout ? 'var(--primary)' : 'transparent',
                      color: previewLayout === layout ? 'white' : 'var(--foreground-secondary)',
                    }}
                  >
                    {layout}
                  </button>
                ),
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: 'var(--foreground-tertiary)' }}>
                Total: {formatCurrency(challan.total)}
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded transition-colors themed-transition"
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
                <Printer className="h-3 w-3" />
                Print
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4">
        {viewMode === "details" ? (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Header Card */}
            <div
              className="rounded-lg p-5 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2
                    className="text-xl font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    DELIVERY CHALLAN
                  </h2>
                  <p className="text-sm mt-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    # {challan.challanNumber}
                  </p>
                  <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    Date: {new Date(challan.challanDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    Delivery: {new Date(challan.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    Total
                  </p>
                  <p
                    className="text-2xl font-bold themed-transition"
                    style={{ color: 'var(--gold)' }}
                  >
                    {formatCurrency(challan.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Card */}
            <div
              className="rounded-lg p-5 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Customer
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p
                    className="font-medium themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {challan.customerName}
                  </p>
                  <p
                    className="flex items-center gap-1 mt-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {challan.customerEmail}
                  </p>
                  <p
                    className="flex items-center gap-1 mt-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {challan.customerPhone}
                  </p>
                </div>
                <div>
                  {challan.customerAddress && (
                    <p
                      className="flex items-center gap-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      {challan.customerAddress}
                    </p>
                  )}
                  <p
                    className="flex items-center gap-1 mt-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <MapPin className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
                    {challan.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Transport Details */}
            {(challan.transporterName ||
              challan.vehicleNumber ||
              challan.lrNumber) && (
              <div
                className="rounded-lg p-5 themed-transition"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  <TruckIcon className="h-4 w-4" />
                  Transport
                </h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  {challan.transporterName && (
                    <div>
                      <p className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                        Transporter
                      </p>
                      <p
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {challan.transporterName}
                      </p>
                    </div>
                  )}
                  {challan.vehicleNumber && (
                    <div>
                      <p className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                        Vehicle
                      </p>
                      <p
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {challan.vehicleNumber}
                      </p>
                    </div>
                  )}
                  {challan.lrNumber && (
                    <div>
                      <p className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                        LR No
                      </p>
                      <p
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {challan.lrNumber}
                      </p>
                    </div>
                  )}
                  {challan.lrDate && (
                    <div>
                      <p className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                        LR Date
                      </p>
                      <p
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {new Date(challan.lrDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div
              className="rounded-lg p-5 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Items ({challan.items?.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ background: 'var(--surface)' }}>
                    <tr>
                      <th
                        className="px-3 py-2 text-left text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        Product
                      </th>
                      <th
                        className="px-3 py-2 text-right text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        Qty
                      </th>
                      <th
                        className="px-3 py-2 text-right text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        Rate
                      </th>
                      <th
                        className="px-3 py-2 text-right text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        Tax
                      </th>
                      <th
                        className="px-3 py-2 text-right text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {challan.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <p
                            className="font-medium themed-transition"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {item.productName}
                          </p>
                          <p
                            className="text-[10px] themed-transition"
                            style={{ color: 'var(--foreground-tertiary)' }}
                          >
                            {item.description}
                          </p>
                        </td>
                        <td
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {item.quantity}
                        </td>
                        <td
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {formatCurrency(item.rate)}
                        </td>
                        <td
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {item.taxRate}%
                        </td>
                        <td
                          className="px-3 py-2 text-right font-medium themed-transition"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Card */}
            <div
              className="rounded-lg p-5 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Subtotal
                    </span>
                    <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(challan.subtotal)}
                    </span>
                  </div>
                  {challan.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Discount
                      </span>
                      <span style={{ color: 'var(--success)' }}>
                        -{formatCurrency(challan.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Tax
                    </span>
                    <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(challan.taxAmount)}
                    </span>
                  </div>
                  {challan.shippingCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Shipping
                      </span>
                      <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                        {formatCurrency(challan.shippingCharge)}
                      </span>
                    </div>
                  )}
                  <div
                    className="border-t pt-2 flex justify-between text-base font-bold themed-transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                      Total
                    </span>
                    <span style={{ color: 'var(--gold)' }}>
                      {formatCurrency(challan.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(challan.notes || challan.termsAndConditions) && (
              <div
                className="rounded-lg p-5 grid grid-cols-2 gap-4 themed-transition"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                {challan.notes && (
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase mb-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      Notes
                    </h4>
                    <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      {challan.notes}
                    </p>
                  </div>
                )}
                {challan.termsAndConditions && (
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase mb-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      Terms
                    </h4>
                    <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      {challan.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer
                data={documentData}
                layout={previewLayout}
                config={{
                  documentType: "delivery_challan",
                  showCompanyLogo: true,
                  showSignature: true,
                  showTerms: true,
                }}
              />
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={onModalCancel}
        onConfirm={onModalConfirm}
        title={modalOptions?.title}
        message={modalOptions?.message ?? ""}
        confirmText={modalOptions?.confirmText}
        cancelText={modalOptions?.cancelText}
        variant={modalOptions?.variant}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default DeliveryChallanView;