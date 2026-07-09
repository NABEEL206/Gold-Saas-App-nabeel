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
    { color: string; icon: React.ReactNode; label: string }
  > = {
    draft: {
      color: "bg-gray-100 text-gray-700",
      icon: <FileText className="h-3 w-3" />,
      label: "Draft",
    },
    sent: {
      color: "bg-blue-100 text-blue-700",
      icon: <Clock className="h-3 w-3" />,
      label: "Sent",
    },
    paid: {
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Paid",
    },
    partial: {
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock className="h-3 w-3" />,
      label: "Partial",
    },
    overdue: {
      color: "bg-red-100 text-red-700",
      icon: <AlertCircle className="h-3 w-3" />,
      label: "Overdue",
    },
    cancelled: {
      color: "bg-gray-100 text-gray-700",
      icon: <XCircle className="h-3 w-3" />,
      label: "Cancelled",
    },
  };
  const { color, icon, label } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
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
      icon: <Printer className="h-4 w-4 text-gray-500" />,
      onClick: handlePrint,
    },
    {
      label: "Export as PDF",
      icon: <Download className="h-4 w-4 text-red-500" />,
      onClick: () => handleExport("pdf"),
    },
    {
      label: "Export as Excel",
      icon: <Download className="h-4 w-4 text-green-500" />,
      onClick: () => handleExport("excel"),
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
      show: invoice?.status === "draft",
    },
    {
      label: "Delete",
      icon: deleteLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash2 className="h-4 w-4 text-red-500" />
      ),
      onClick: handleDelete,
      show: invoice?.status === "draft",
      disabled: deleteLoading,
    },
    {
      label: "Send",
      icon: <Send className="h-4 w-4 text-blue-500" />,
      onClick: () => handleStatusUpdate("sent"),
      show: invoice?.status === "draft",
      disabled: updating,
    },
    {
      label: "Mark Paid",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate("paid"),
      show:
        invoice?.status === "sent" ||
        invoice?.status === "partial" ||
        invoice?.status === "overdue",
      disabled: updating,
    },
    {
      label: "Cancel",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Invoice not found</p>
          <button
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">
                    {invoice.invoiceNo}
                  </h1>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="text-[11px] text-gray-500">
                  {new Date(invoice.date).toLocaleDateString()} |{" "}
                  {invoice.customerName} | {formatCurrency(invoice.total)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("details")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "details" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                Details
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Eye className="h-3.5 w-3.5" />
                PDF View
              </button>
            </div>
            {invoice.status === "draft" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("sent")}
                  className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"
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
                className="px-3 py-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1"
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
          <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-0.5">
              {(["modern", "classic", "compact", "minimal"] as const).map(
                (layout) => (
                  <button
                    key={layout}
                    onClick={() => setPreviewLayout(layout)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors capitalize ${previewLayout === layout ? "bg-amber-500 text-white" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {layout}
                  </button>
                ),
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">
                Total: {formatCurrency(invoice.total)}
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium text-white bg-amber-500 rounded hover:bg-amber-600"
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
            <div className="bg-white rounded-lg border border-gray-200 p-5 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {invoice.invoiceNo}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Date: {new Date(invoice.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(invoice.total)}
                  </p>
                  {invoice.balanceDue > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Balance: {formatCurrency(invoice.balanceDue)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Customer
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">
                    {invoice.customerName}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {invoice.customerEmail}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    {invoice.customerPhone}
                  </p>
                </div>
                <div>
                  {invoice.customerAddress && (
                    <p className="text-gray-600 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {invoice.customerAddress}
                    </p>
                  )}
                  {invoice.customerGst && (
                    <p className="text-gray-600 mt-1">
                      GST: {invoice.customerGst}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Items ({invoice.items?.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500">
                        Item
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">
                        Rate
                      </th>
                      <th className="px-3 py-2 text-center text-[11px] font-medium text-gray-500">
                        Purity
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">
                        Tax
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-900">
                            {item.itemName}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {item.description}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.purity && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              {item.purity}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.taxRate}%
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
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
              <div className="bg-white rounded-lg border border-amber-200 p-5 bg-amber-50/30">
                <div className="flex items-center gap-2 mb-3">
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                  <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                    Old Gold Exchange ({oldGoldCalc.itemCount})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-amber-100/50">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-[11px] text-amber-700">
                          Desc
                        </th>
                        <th className="px-2 py-1.5 text-right text-[11px] text-amber-700">
                          G.WT
                        </th>
                        <th className="px-2 py-1.5 text-right text-[11px] text-amber-700">
                          N.WT
                        </th>
                        <th className="px-2 py-1.5 text-center text-[11px] text-amber-700">
                          Purity
                        </th>
                        <th className="px-2 py-1.5 text-right text-[11px] text-amber-700">
                          Rate
                        </th>
                        <th className="px-2 py-1.5 text-right text-[11px] text-amber-700">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {oldGoldCalc.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1.5">{item.description}</td>
                          <td className="px-2 py-1.5 text-right">
                            {item.grossWt?.toFixed(3)}
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            {item.netWt?.toFixed(3)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              {item.purity || "91.6"}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            {formatCurrency(item.rate || 0)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-bold text-amber-700">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-amber-100/50">
                      <tr>
                        <td
                          colSpan={5}
                          className="px-2 py-1.5 text-right font-semibold text-amber-800"
                        >
                          Total
                        </td>
                        <td className="px-2 py-1.5 text-right font-bold text-amber-700">
                          {oldGoldCalc.formattedTotal}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(invoice.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                  {oldGoldCalc.total > 0 && (
                    <div className="flex justify-between">
                      <span className="text-amber-600">Old Gold</span>
                      <span className="text-amber-600">
                        -{oldGoldCalc.formattedTotal}
                      </span>
                    </div>
                  )}
                  {invoice.shippingCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span>{formatCurrency(invoice.shippingCharge)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  {invoice.balanceDue > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Balance Due</span>
                      <span>{formatCurrency(invoice.balanceDue)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.termsAndConditions) && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 grid grid-cols-2 gap-4">
                {invoice.notes && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                      Terms
                    </h4>
                    <p className="text-sm text-gray-600">
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
              <div className="text-center py-8 text-gray-500">
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
