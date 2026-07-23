// src/pages/sales/proforma/ProformaInvoiceView.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  Edit,
  Trash2,
  FileText,
  Clock,
  XCircle,
  Mail,
  Phone,
  Building2,
  Receipt,
  CheckCircle,
  Eye,
  FileText as FileTextIcon,
} from "lucide-react";
import { useProformaInvoice } from "../../../hooks/Proforma/useProformaInvoice";
import ThreeDotDropdown from "../../../components/common/ThreeDotDropdown";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { useToastAndConfirm } from "../../../hooks/ToastConfirmModal/useToastAndConfirm";
import { DocumentRenderer } from "../../../Templates/DocumentRenderer";
import { formatCurrency } from "../../../utils/Invoice/calculations";
import type { ProformaInvoice as ProformaInvoiceType } from "../../../types/proforma/ProformaInvoiceType";
import type { DocumentData } from "../../../types/Template/TemplateTypes";

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

type ViewMode = "details" | "preview";

const StatusBadge: React.FC<{ status: ProformaInvoiceType["status"] }> = ({
  status,
}) => {
  const config: Record<
    string,
    { bg: string; color: string; icon: React.ReactNode; label: string }
  > = {
    draft: {
      bg: "var(--surface-hover)",
      color: "var(--foreground-secondary)",
      icon: <FileText className="h-3 w-3" />,
      label: "Draft",
    },
    sent: {
      bg: "var(--info-light)",
      color: "var(--info)",
      icon: <Send className="h-3 w-3" />,
      label: "Sent",
    },
    approved: {
      bg: "var(--success-light)",
      color: "var(--success)",
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Approved",
    },
    rejected: {
      bg: "var(--error-light)",
      color: "var(--error)",
      icon: <XCircle className="h-3 w-3" />,
      label: "Rejected",
    },
    expired: {
      bg: "var(--warning-light)",
      color: "var(--warning)",
      icon: <Clock className="h-3 w-3" />,
      label: "Expired",
    },
  };
  
  const { bg, color, icon, label } = config[status] || config.draft;
  
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

const ProformaInvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    loading: hookLoading,
  } = useProformaInvoice();
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

  const [invoice, setInvoice] = useState<ProformaInvoiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("details");
  const [previewLayout, setPreviewLayout] = useState<
    "modern" | "classic" | "compact" | "minimal"
  >("modern");

  useEffect(() => {
    if (id) loadInvoice(id);
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      const data = await getInvoice(invoiceId);
      if (data) {
        const items = data.items?.length > 0 ? data.items : [];
        const subtotal = items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
        const discountTotal = items.reduce(
          (sum, item) => sum + (item.discount || 0) * item.quantity,
          0,
        );
        const taxTotal = items.reduce(
          (sum, item) =>
            sum +
            (item.unitPrice * item.quantity -
              (item.discount || 0) * item.quantity) *
              ((item.taxRate || 0) / 100),
          0,
        );
        const grandTotal = subtotal - discountTotal + taxTotal;
        setInvoice({
          ...data,
          items,
          subtotal,
          discountTotal,
          taxTotal,
          grandTotal,
        });
      } else {
        showError("Proforma invoice not found.");
        navigate("/sales/proforma");
      }
    } catch {
      showError("Failed to load proforma invoice.");
      navigate("/sales/proforma");
    } finally {
      setLoading(false);
    }
  };

  const documentData = useMemo((): DocumentData | null => {
    if (!invoice) return null;
    return {
      documentNumber: invoice.invoiceNumber,
      documentDate: new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      dueDate: invoice.validUntil
        ? new Date(invoice.validUntil).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : undefined,
      company: DEFAULT_COMPANY,
      customer: {
        name: invoice.customerName,
        address: invoice.customerAddress,
        phone: invoice.customerPhone,
        email: invoice.customerEmail,
      },
      items: (invoice.items || []).map((item) => ({
        name: item.productName,
        description: item.description || "",
        quantity: item.quantity,
        unit: "Pcs",
        rate: item.unitPrice,
        discount: item.discount,
        discountType: "percentage" as const,
        taxRate: item.taxRate,
        total: item.total || item.unitPrice * item.quantity,
      })),
      subtotal: invoice.subtotal,
      discountTotal: invoice.discountTotal,
      taxTotal: invoice.taxTotal,
      totalAmount: invoice.grandTotal,
      notes: invoice.notes,
      terms: invoice.termsAndConditions,
    };
  }, [invoice]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    withConfirmation(
      {
        title: "Delete Proforma Invoice",
        message: "Delete this proforma invoice? This action cannot be undone.",
        confirmText: "Delete",
        variant: "danger",
      },
      async () => {
        setDeleteLoading(true);
        try {
          await deleteInvoice(id);
          success("Proforma invoice deleted.");
          navigate("/sales/proforma");
        } catch {
          showError("Failed to delete.");
        } finally {
          setDeleteLoading(false);
        }
      },
    );
  }, [id, withConfirmation, deleteInvoice, success, showError, navigate]);

  const handleStatusUpdate = useCallback(
    (status: ProformaInvoiceType["status"]) => {
      if (!id) return;
      const labels: Record<string, string> = {
        sent: "Send",
        approved: "Approve",
        rejected: "Reject",
      };
      withConfirmation(
        {
          title: `${labels[status]} Invoice`,
          message: `Mark as ${status}?`,
          confirmText: labels[status] || status,
          variant: status === "rejected" ? "danger" : "primary",
        },
        async () => {
          setUpdating(true);
          try {
            await updateInvoiceStatus(id, status);
            const data = await getInvoice(id);
            if (data) setInvoice(data);
            success(`Invoice ${status}.`);
          } catch {
            showError("Failed to update status.");
          } finally {
            setUpdating(false);
          }
        },
      );
    },
    [id, withConfirmation, updateInvoiceStatus, getInvoice, success, showError],
  );

  const handleEdit = useCallback(() => {
    if (id) navigate(`/sales/proforma/${id}/edit`);
  }, [id, navigate]);
  
  const handlePrint = useCallback(() => {
    setViewMode("preview");
    setTimeout(() => window.print(), 300);
  }, []);
  
  const handleDownload = useCallback(() => {
    success("Download started.");
  }, [success]);

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
      show: invoice?.status === "draft",
    },
    {
      label: "Delete",
      icon: deleteLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash2 className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: handleDelete,
      show: invoice?.status === "draft",
      disabled: deleteLoading,
    },
    {
      label: "Send",
      icon: <Send className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleStatusUpdate("sent"),
      show: invoice?.status === "draft",
      disabled: updating,
    },
    {
      label: "Approve",
      icon: <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />,
      onClick: () => handleStatusUpdate("approved"),
      show: invoice?.status === "sent",
      disabled: updating,
    },
    {
      label: "Reject",
      icon: <XCircle className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: () => handleStatusUpdate("rejected"),
      show: invoice?.status === "sent",
      disabled: updating,
    },
  ];

  if (loading || hookLoading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  
  if (!invoice)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Not found
          </p>
          <button
            onClick={() => navigate("/sales/proforma")}
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
              onClick={() => navigate("/sales/proforma")}
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
              <Receipt className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-lg font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {invoice.invoiceNumber}
                  </h1>
                  <StatusBadge status={invoice.status} />
                </div>
                <p
                  className="text-[11px] themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {new Date(invoice.invoiceDate).toLocaleDateString()} |{" "}
                  {invoice.customerName} | {formatCurrency(invoice.grandTotal)}
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
            {invoice.status === "draft" && (
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
            {invoice.status === "sent" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("approved")}
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
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("rejected")}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 themed-transition"
                  style={{
                    color: 'var(--error)',
                    background: 'var(--error-light)',
                    border: '1px solid var(--error)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </>
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
                Total: {formatCurrency(invoice.grandTotal)}
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
                    PROFORMA INVOICE
                  </h2>
                  <p className="text-sm mt-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    # {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    Valid: {new Date(invoice.validUntil).toLocaleDateString()}
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
                    {formatCurrency(invoice.grandTotal)}
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
                  <p className="font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                    {invoice.customerName}
                  </p>
                  <p className="flex items-center gap-1 mt-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    <Mail className="h-3.5 w-3.5" />
                    {invoice.customerEmail}
                  </p>
                  <p className="flex items-center gap-1 mt-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    <Phone className="h-3.5 w-3.5" />
                    {invoice.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    <Building2 className="h-3.5 w-3.5" />
                    {invoice.customerAddress}
                  </p>
                  <p className="text-xs mt-2 themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                    Payment: {invoice.paymentTerms}
                  </p>
                  <p className="text-xs themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                    Delivery: {invoice.deliveryTerms}
                  </p>
                </div>
              </div>
            </div>

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
                Items ({invoice.items?.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ background: 'var(--surface)' }}>
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Product
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Price
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Disc
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Tax
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {invoice.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <p className="font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                            {item.productName}
                          </p>
                          <p className="text-[10px] themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                            {item.description}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right themed-transition" style={{ color: 'var(--foreground)' }}>
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right themed-transition" style={{ color: 'var(--foreground)' }}>
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-right themed-transition" style={{ color: 'var(--foreground)' }}>
                          {item.discount || 0}%
                        </td>
                        <td className="px-3 py-2 text-right themed-transition" style={{ color: 'var(--foreground)' }}>
                          {item.taxRate || 0}%
                        </td>
                        <td className="px-3 py-2 text-right font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                          {formatCurrency(
                            item.total || item.unitPrice * item.quantity,
                          )}
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
                      {formatCurrency(invoice.subtotal)}
                    </span>
                  </div>
                  {invoice.discountTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Discount
                      </span>
                      <span style={{ color: 'var(--success)' }}>
                        -{formatCurrency(invoice.discountTotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Tax
                    </span>
                    <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(invoice.taxTotal)}
                    </span>
                  </div>
                  <div
                    className="border-t pt-2 flex justify-between text-base font-bold themed-transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                      Grand Total
                    </span>
                    <span style={{ color: 'var(--gold)' }}>
                      {formatCurrency(invoice.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.termsAndConditions) && (
              <div
                className="rounded-lg p-5 grid grid-cols-2 gap-4 themed-transition"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                {invoice.notes && (
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase mb-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      Notes
                    </h4>
                    <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      {invoice.notes}
                    </p>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase mb-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      Terms
                    </h4>
                    <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      {invoice.termsAndConditions}
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
                  documentType: "proforma_invoice",
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

export default ProformaInvoiceView;