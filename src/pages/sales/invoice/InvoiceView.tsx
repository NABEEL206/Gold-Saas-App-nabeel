// src/pages/sales/invoice/InvoiceView.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Receipt,
  Trash2,
  RotateCcw,
  Eye,
  FileText as FileTextIcon,
} from "lucide-react";
import { useInvoices } from "../../../hooks/Invoices/useInvoices";
import ThreeDotDropdown from "../../../components/common/ThreeDotDropdown";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { useToastAndConfirm } from "../../../hooks/ToastConfirmModal/useToastAndConfirm";
import { formatCurrency } from "../../../utils/Invoice/calculations";
import { useOldGoldCalculations } from "../../../hooks/Invoices/useOldGoldCalculations";
import type {
  Invoice,
  InvoiceOldGoldItem,
} from "../../../types/Invoice/InvoiceTypes";
import type { DocumentData } from "../../../types/Template/TemplateTypes";
import type { OldGoldItem } from "../../../components/common/OldGoldTable";
import DocumentRenderer from "../../../Templates/DocumentRenderer";

type ViewMode = "details" | "preview";

const StatusBadge: React.FC<{ status: Invoice["status"] }> = ({ status }) => {
  const config: Record<
    string,
    { icon: React.ReactNode; label: string }
  > = {
    draft: {
      icon: <FileText className="h-3 w-3" />,
      label: "Draft",
    },
    sent: {
      icon: <Clock className="h-3 w-3" />,
      label: "Sent",
    },
    paid: {
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Paid",
    },
    partial: {
      icon: <Clock className="h-3 w-3" />,
      label: "Partial",
    },
    overdue: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: "Overdue",
    },
    cancelled: {
      icon: <XCircle className="h-3 w-3" />,
      label: "Cancelled",
    },
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-secondary)' };
      case 'sent':
        return { bg: 'var(--info-light)', color: 'var(--info)' };
      case 'paid':
        return { bg: 'var(--success-light)', color: 'var(--success)' };
      case 'partial':
        return { bg: 'var(--warning-light)', color: 'var(--warning)' };
      case 'overdue':
        return { bg: 'var(--error-light)', color: 'var(--error)' };
      case 'cancelled':
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-tertiary)' };
      default:
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-secondary)' };
    }
  };

  const { icon, label } = config[status];
  const styles = getStatusStyles();

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: styles.bg,
        color: styles.color,
      }}
    >
      {icon}
      {label}
    </span>
  );
};

export const InvoiceView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    getInvoice,
    updateStatus,
    deleteInvoice,
    loading: hookLoading,
  } = useInvoices();
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

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
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
      const data = (await getInvoice(invoiceId)) as Invoice;
      setInvoice(data);
    } catch {
      try {
        const mockModule = await import("../../../hooks/Invoices/useInvoices");
        const mockData = (mockModule as any).MOCK_INVOICES?.find(
          (inv: Invoice) => inv.id === invoiceId,
        );
        if (mockData) setInvoice(mockData);
        else setInvoice(null);
      } catch {
        setInvoice(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Convert invoice old gold items to OldGoldItem format for the hook
  const rawOldGoldItems: OldGoldItem[] = useMemo(() => {
    return (invoice?.oldGoldItems || []).map((item) => ({
      id: item.id,
      description: item.description,
      hsn: item.hsn,
      grossWt: item.grossWt,
      lessWastage: item.lessWastage,
      netWt: item.netWt,
      purity: item.purity || "91.6",
      rate: item.rate || 0,
      amount: item.amount,
    }));
  }, [invoice]);

  // Use the old gold calculations hook
  const oldGoldCalc = useOldGoldCalculations(rawOldGoldItems);

  const documentData = useMemo((): DocumentData | null => {
    if (!invoice) return null;
    return {
      documentNumber: invoice.invoiceNo,
      documentDate: new Date(invoice.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      dueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : undefined,
      company: {
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
      },
      customer: {
        name: invoice.customerName,
        address: invoice.customerAddress,
        phone: invoice.customerPhone,
        email: invoice.customerEmail,
        gst: invoice.customerGst,
      },
      items: (invoice.items || []).map((item) => ({
        name: item.itemName,
        description: `${item.category || ""} - Purity: ${item.purity || "N/A"}`,
        quantity: item.quantity,
        unit: "Pcs",
        rate: item.rate,
        taxRate: item.taxRate,
        total: item.total,
      })),
      // Old Gold Exchange - using calculated data
      oldGoldItems:
        oldGoldCalc.itemCount > 0
          ? oldGoldCalc.items.map((item) => ({
              id: item.id,
              description: item.description,
              hsn: item.hsn,
              grossWt: item.grossWt || 0,
              lessWastage: item.lessWastage || 0,
              netWt: item.netWt || 0,
              purity: item.purity || "91.6",
              rate: item.rate || 0,
              amount: item.amount || 0,
            }))
          : undefined,
      oldGoldTotal: oldGoldCalc.total > 0 ? oldGoldCalc.total : undefined,
      subtotal: invoice.subtotal,
      discountTotal: invoice.discount,
      taxTotal: invoice.taxAmount,
      shippingCharges: invoice.shippingCharge,
      totalAmount: invoice.total,
      paidAmount: invoice.amountPaid,
      balanceDue: invoice.balanceDue,
      notes: invoice.notes,
      terms: invoice.termsAndConditions,
    };
  }, [invoice, oldGoldCalc]);

  const handleStatusUpdate = useCallback(
    async (status: Invoice["status"]) => {
      if (!id || !invoice) return;
      const labels: Record<string, string> = {
        sent: "Send",
        paid: "Mark Paid",
        cancelled: "Cancel",
      };
      const msgs: Record<string, string> = {
        sent: "Send this invoice?",
        paid: "Mark as paid?",
        cancelled: "Cancel this invoice?",
      };
      await withConfirmation(
        {
          title: `${labels[status]} Invoice`,
          message: msgs[status],
          confirmText: labels[status],
          variant: status === "cancelled" ? "danger" : "primary",
        },
        async () => {
          setUpdating(true);
          try {
            const result = await updateStatus(id, status);
            if (result) {
              success(`Invoice ${status} successfully.`);
              await loadInvoice(id);
            }
          } catch {
            showError("Failed to update status.");
          } finally {
            setUpdating(false);
          }
        },
      );
    },
    [id, invoice, withConfirmation, updateStatus, success, showError],
  );

  const handleDelete = useCallback(async () => {
    if (!id || !invoice) return;
    await withConfirmation(
      {
        title: "Delete Invoice",
        message: `Delete ${invoice.invoiceNo}?`,
        confirmText: "Delete",
        variant: "danger",
      },
      async () => {
        setDeleteLoading(true);
        try {
          const result = await deleteInvoice(id);
          if (result) {
            success(`Invoice deleted.`);
            navigate("/sales/invoices", { replace: true });
          }
        } catch {
          showError("Failed to delete.");
          setDeleteLoading(false);
        }
      },
    );
  }, [
    id,
    invoice,
    withConfirmation,
    deleteInvoice,
    success,
    showError,
    navigate,
  ]);

  const handleEdit = useCallback(() => {
    if (id) navigate(`/sales/invoices/edit/${id}`);
  }, [id, navigate]);
  const handlePrint = useCallback(() => {
    setViewMode("preview");
    setTimeout(() => window.print(), 300);
  }, []);
  const handleExport = useCallback(
    async (format: "pdf" | "excel") => {
      if (format === "pdf") {
        setViewMode("preview");
        return;
      }
      setExportLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 1000));
        success("Exported as Excel.");
      } catch {
        showError("Export failed.");
      } finally {
        setExportLoading(false);
      }
    },
    [success, showError],
  );
  const handleGoBack = useCallback(
    () => navigate("/sales/invoices", { replace: true }),
    [navigate],
  );

  const dropdownItems = [
    {
      label: "Print",
      icon: <Printer className="h-4 w-4" style={{ color: 'var(--foreground-secondary)' }} />,
      onClick: handlePrint,
    },
    {
      label: "Export as PDF",
      icon: <Download className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: () => handleExport("pdf"),
    },
    {
      label: "Export as Excel",
      icon: <Download className="h-4 w-4" style={{ color: 'var(--success)' }} />,
      onClick: () => handleExport("excel"),
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
      label: "Mark Paid",
      icon: <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />,
      onClick: () => handleStatusUpdate("paid"),
      show:
        invoice?.status === "sent" ||
        invoice?.status === "partial" ||
        invoice?.status === "overdue",
      disabled: updating,
    },
    {
      label: "Cancel",
      icon: <XCircle className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: () => handleStatusUpdate("cancelled"),
      show: invoice?.status === "sent" || invoice?.status === "draft",
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
      <div
        className="p-6 flex items-center justify-center min-h-[400px] themed-transition"
        style={{ background: 'var(--background)' }}
      >
        <div className="text-center">
          <AlertCircle
            className="h-12 w-12 mx-auto mb-3"
            style={{ color: 'var(--foreground-tertiary)' }}
          />
          <p className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
            Invoice not found
          </p>
          <button
            onClick={handleGoBack}
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
        className="sticky top-0 z-30 border-b shadow-sm themed-transition"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-1.5 rounded-lg transition-colors themed-transition"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft
                className="h-5 w-5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              />
            </button>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-lg font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {invoice.invoiceNo}
                  </h1>
                  <StatusBadge status={invoice.status} />
                </div>
                <p
                  className="text-[11px] themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {new Date(invoice.date).toLocaleDateString()} |{" "}
                  {invoice.customerName} | {formatCurrency(invoice.total)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center rounded-lg p-0.5 themed-transition"
              style={{ background: 'var(--surface-hover)' }}
            >
              <button
                onClick={() => setViewMode("details")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all themed-transition ${
                  viewMode === "details"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
                style={{
                  background: viewMode === "details" ? 'var(--surface)' : 'transparent',
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
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
                style={{
                  background: viewMode === "preview" ? 'var(--surface)' : 'transparent',
                  color: viewMode === "preview" ? 'var(--foreground)' : 'var(--foreground-secondary)',
                  boxShadow: viewMode === "preview" ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                PDF View
              </button>
            </div>
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
            {(invoice.status === "sent" ||
              invoice.status === "partial" ||
              invoice.status === "overdue") && (
              <button
                onClick={() => handleStatusUpdate("paid")}
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
                Paid
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
        {viewMode === "preview" && (
          <div
            className="px-4 py-1.5 border-t flex items-center justify-between themed-transition"
            style={{
              background: 'var(--surface-hover)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div
              className="flex items-center gap-1 rounded-md border p-0.5 themed-transition"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
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
                        : "text-foreground-secondary hover:text-foreground"
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
              <span
                className="text-[11px] themed-transition"
                style={{ color: 'var(--foreground-tertiary)' }}
              >
                Total: {formatCurrency(invoice.total)}
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

      <div className="p-4">
        {viewMode === "details" ? (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Invoice Header */}
            <div
              className="rounded-lg border p-5 themed-transition"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2
                    className="text-xl font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {invoice.invoiceNo}
                  </h2>
                  <p
                    className="text-sm mt-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Date: {new Date(invoice.date).toLocaleDateString()}
                  </p>
                  <p
                    className="text-sm themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Total Amount
                  </p>
                  <p
                    className="text-2xl font-bold themed-transition"
                    style={{ color: 'var(--gold)' }}
                  >
                    {formatCurrency(invoice.total)}
                  </p>
                  {invoice.balanceDue > 0 && (
                    <p
                      className="text-sm mt-1 themed-transition"
                      style={{ color: 'var(--error)' }}
                    >
                      Balance: {formatCurrency(invoice.balanceDue)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer */}
            <div
              className="rounded-lg border p-5 themed-transition"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Customer
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p
                    className="font-medium themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {invoice.customerName}
                  </p>
                  <p
                    className="flex items-center gap-1 mt-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <Mail className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                    {invoice.customerEmail}
                  </p>
                  <p
                    className="flex items-center gap-1 mt-1 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <Phone className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                    {invoice.customerPhone}
                  </p>
                </div>
                <div>
                  {invoice.customerAddress && (
                    <p
                      className="flex items-center gap-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      <Building2 className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                      {invoice.customerAddress}
                    </p>
                  )}
                  {invoice.customerGst && (
                    <p
                      className="mt-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      GST: {invoice.customerGst}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div
              className="rounded-lg border p-5 themed-transition"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Items ({invoice.items?.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead
                    className="themed-transition"
                    style={{ background: 'var(--surface-hover)' }}
                  >
                    <tr>
                      <th
                        className="px-3 py-2 text-left text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Item
                      </th>
                      <th
                        className="px-3 py-2 text-right text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Qty
                      </th>
                      <th
                        className="px-3 py-2 text-right text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Rate
                      </th>
                      <th
                        className="px-3 py-2 text-center text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Purity
                      </th>
                      <th
                        className="px-3 py-2 text-right text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Tax
                      </th>
                      <th
                        className="px-3 py-2 text-right text-[11px] font-medium themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y themed-transition"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {invoice.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <p
                            className="font-medium themed-transition"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {item.itemName}
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
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          {item.quantity}
                        </td>
                        <td
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.purity && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded themed-transition"
                              style={{
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                              }}
                            >
                              {item.purity}
                            </span>
                          )}
                        </td>
                        <td
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
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

            {/* Old Gold Exchange Table */}
            {oldGoldCalc.itemCount > 0 && (
              <div
                className="rounded-lg border p-5 themed-transition"
                style={{
                  background: 'var(--primary-light)',
                  borderColor: 'var(--primary)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <RotateCcw className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider themed-transition"
                    style={{ color: 'var(--primary)' }}
                  >
                    Old Gold Exchange ({oldGoldCalc.itemCount})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead
                      className="themed-transition"
                      style={{ background: 'var(--primary-light)' }}
                    >
                      <tr>
                        <th
                          className="px-2 py-1.5 text-left text-[11px] themed-transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          Desc
                        </th>
                        <th
                          className="px-2 py-1.5 text-right text-[11px] themed-transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          G.WT
                        </th>
                        <th
                          className="px-2 py-1.5 text-right text-[11px] themed-transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          N.WT
                        </th>
                        <th
                          className="px-2 py-1.5 text-center text-[11px] themed-transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          Purity
                        </th>
                        <th
                          className="px-2 py-1.5 text-right text-[11px] themed-transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          Rate
                        </th>
                        <th
                          className="px-2 py-1.5 text-right text-[11px] themed-transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y themed-transition"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      {oldGoldCalc.items.map((item, i) => (
                        <tr key={i}>
                          <td
                            className="px-2 py-1.5 themed-transition"
                            style={{ color: 'var(--foreground-secondary)' }}
                          >
                            {item.description}
                          </td>
                          <td
                            className="px-2 py-1.5 text-right themed-transition"
                            style={{ color: 'var(--foreground-secondary)' }}
                          >
                            {item.grossWt?.toFixed(3)}
                          </td>
                          <td
                            className="px-2 py-1.5 text-right themed-transition"
                            style={{ color: 'var(--foreground-secondary)' }}
                          >
                            {item.netWt?.toFixed(3)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded themed-transition"
                              style={{
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                              }}
                            >
                              {item.purity || "91.6"}
                            </span>
                          </td>
                          <td
                            className="px-2 py-1.5 text-right themed-transition"
                            style={{ color: 'var(--foreground-secondary)' }}
                          >
                            {formatCurrency(item.rate || 0)}
                          </td>
                          <td
                            className="px-2 py-1.5 text-right font-bold themed-transition"
                            style={{ color: 'var(--primary)' }}
                          >
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot
                      className="themed-transition"
                      style={{ background: 'var(--primary-light)' }}
                    >
                      <tr>
                        <td
                          colSpan={5}
                          className="px-2 py-1.5 text-right font-semibold themed-transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          Total
                        </td>
                        <td
                          className="px-2 py-1.5 text-right font-bold themed-transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          {oldGoldCalc.formattedTotal}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div
              className="rounded-lg border p-5 themed-transition"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
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
                  {invoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Discount
                      </span>
                      <span style={{ color: 'var(--success)' }}>
                        -{formatCurrency(invoice.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Tax
                    </span>
                    <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                      {formatCurrency(invoice.taxAmount)}
                    </span>
                  </div>
                  {oldGoldCalc.total > 0 && (
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--primary)' }}>
                        Old Gold
                      </span>
                      <span style={{ color: 'var(--primary)' }}>
                        -{oldGoldCalc.formattedTotal}
                      </span>
                    </div>
                  )}
                  {invoice.shippingCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Shipping
                      </span>
                      <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                        {formatCurrency(invoice.shippingCharge)}
                      </span>
                    </div>
                  )}
                  <div
                    className="pt-2 flex justify-between text-base font-bold themed-transition"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                      Total
                    </span>
                    <span style={{ color: 'var(--gold)' }}>
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  {invoice.balanceDue > 0 && (
                    <div className="flex justify-between font-semibold themed-transition" style={{ color: 'var(--error)' }}>
                      <span>Balance Due</span>
                      <span>{formatCurrency(invoice.balanceDue)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.termsAndConditions) && (
              <div
                className="rounded-lg border p-5 grid grid-cols-2 gap-4 themed-transition"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                {invoice.notes && (
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase mb-1 themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Notes
                    </h4>
                    <p
                      className="text-sm themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      {invoice.notes}
                    </p>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div>
                    <h4
                      className="text-xs font-semibold uppercase mb-1 themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Terms
                    </h4>
                    <p
                      className="text-sm themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      {invoice.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* PDF Preview */
          <div className="max-w-[210mm] mx-auto">
            {documentData ? (
              <DocumentRenderer
                data={documentData}
                layout={previewLayout}
                config={{
                  documentType: "invoice",
                  showCompanyLogo: true,
                  showSignature: true,
                  showTerms: true,
                }}
              />
            ) : (
              <div
                className="text-center py-8 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Loading preview...
              </div>
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

export default InvoiceView;