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

type ViewMode = "details" | "preview";

const StatusBadge: React.FC<{ status: ProformaInvoiceType["status"] }> = ({
  status,
}) => {
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
      icon: <Send className="h-3 w-3" />,
      label: "Sent",
    },
    approved: {
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Approved",
    },
    rejected: {
      color: "bg-red-100 text-red-700",
      icon: <XCircle className="h-3 w-3" />,
      label: "Rejected",
    },
    expired: {
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock className="h-3 w-3" />,
      label: "Expired",
    },
  };
  const { color, icon, label } = config[status] || config.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
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
      icon: <Printer className="h-4 w-4 text-gray-500" />,
      onClick: handlePrint,
    },
    {
      label: "Download",
      icon: <Download className="h-4 w-4 text-blue-500" />,
      onClick: handleDownload,
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
      label: "Approve",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate("approved"),
      show: invoice?.status === "sent",
      disabled: updating,
    },
    {
      label: "Reject",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
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
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Not found</p>
          <button
            onClick={() => navigate("/sales/proforma")}
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
              onClick={() => navigate("/sales/proforma")}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">
                    {invoice.invoiceNumber}
                  </h1>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="text-[11px] text-gray-500">
                  {new Date(invoice.invoiceDate).toLocaleDateString()} |{" "}
                  {invoice.customerName} | {formatCurrency(invoice.grandTotal)}
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
            {invoice.status === "sent" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("approved")}
                  className="px-3 py-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("rejected")}
                  className="px-3 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1"
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
                Total: {formatCurrency(invoice.grandTotal)}
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
            <div className="bg-white rounded-lg border border-gray-200 p-5 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    PROFORMA INVOICE
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    # {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Valid: {new Date(invoice.validUntil).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(invoice.grandTotal)}
                  </p>
                </div>
              </div>
            </div>
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
                  <p className="text-gray-600 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {invoice.customerAddress}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Payment: {invoice.paymentTerms}
                  </p>
                  <p className="text-xs text-gray-500">
                    Delivery: {invoice.deliveryTerms}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Items ({invoice.items?.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500">
                        Product
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">
                        Price
                      </th>
                      <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">
                        Disc
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
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {item.description}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.discount || 0}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.taxRate || 0}%
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
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
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discountTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(invoice.discountTotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatCurrency(invoice.taxTotal)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-base font-bold">
                    <span>Grand Total</span>
                    <span className="text-amber-600">
                      {formatCurrency(invoice.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
