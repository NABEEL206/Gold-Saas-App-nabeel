// src/pages/sales/Quote/QuoteView.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Mail as MailIcon,
  Phone,
  MapPin,
  Building2,
  Package,
  IndianRupee,
  Calendar,
  Hash,
  Gem,
  Send,
  FileSpreadsheet,
  File,
  AlertCircle,
  Eye,
  FileText as FileTextIcon,
} from "lucide-react";
import { useQuotes } from "../../../hooks/Quote/useQuotes";
import type { Quote } from "../../../types/Quote/QuoteTypes";
import type { DocumentData } from "../../../types/Template/TemplateTypes";
import { DocumentRenderer } from "../../../Templates/DocumentRenderer";
import ThreeDotDropdown from "../../../components/common/ThreeDotDropdown";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { useToastAndConfirm } from "../../../hooks/ToastConfirmModal/useToastAndConfirm";
import { formatCurrency } from "../../../utils/Invoice/calculations";
import type { ThreeDotDropdownItem } from "../../../components/common/ThreeDotDropdown";

type ViewMode = "details" | "preview";

const QuoteView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuote, deleteQuote, loading, handleStatusUpdate, fetchQuotes } =
    useQuotes();
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

  const [quote, setQuote] = useState<Quote | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("details");
  const [previewLayout, setPreviewLayout] = useState<
    "modern" | "classic" | "compact" | "minimal"
  >("modern");

  useEffect(() => {
    const loadQuote = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        if (id) {
          let found = getQuote(id);
          if (!found) {
            await fetchQuotes();
            found = getQuote(id);
          }
          if (found) {
            setQuote(found);
          } else {
            setPageError("Quote not found");
          }
        } else {
          setPageError("No quote ID provided");
        }
      } catch (err) {
        console.error("Error loading quote:", err);
        setPageError("Failed to load quote details");
      } finally {
        setIsLoading(false);
      }
    };
    loadQuote();
  }, [id, getQuote, fetchQuotes]);

  // Convert Quote to DocumentData for template
  const getDocumentData = useCallback((): DocumentData | null => {
    if (!quote) return null;
    return {
      documentNumber: quote.quoteNo,
      documentDate: new Date(quote.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      dueDate: quote.validUntil
        ? new Date(quote.validUntil).toLocaleDateString("en-IN", {
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
        name: quote.customerName,
        address: quote.customerAddress,
        phone: quote.customerPhone,
        email: quote.customerEmail,
        gst: quote.customerGst,
      },
      items: quote.items.map((item) => ({
        name: item.itemName,
        description: `${item.category || ""} - Purity: ${item.purity || "N/A"}`,
        quantity: item.quantity,
        unit: "Pcs",
        rate: item.unitPrice,
        taxRate: 18,
        total: item.total || item.quantity * item.unitPrice,
      })),
      subtotal: quote.subtotal,
      discountTotal: quote.discount,
      taxTotal: quote.tax,
      shippingCharges: quote.shippingCharge,
      totalAmount: quote.total,
      notes: quote.notes,
      terms: quote.termsAndConditions,
    };
  }, [quote]);

  const handleDeleteClick = useCallback(async () => {
    if (!quote) return;
    await withConfirmation(
      {
        title: "Delete Quote",
        message: `Are you sure you want to delete ${quote.quoteNo}?`,
        confirmText: "Delete",
        variant: "danger",
      },
      async () => {
        setDeleting(true);
        try {
          const result = await deleteQuote(quote.id);
          if (result.success) {
            success(`Quote ${quote.quoteNo} deleted successfully.`);
            navigate("/sales/quotes", { replace: true });
          } else {
            showError(result.error || "Failed to delete quote.");
          }
        } catch (err) {
          showError("Failed to delete quote.");
        } finally {
          setDeleting(false);
        }
      },
    );
  }, [quote, withConfirmation, deleteQuote, success, showError, navigate]);

  const handleStatusChange = useCallback(
    async (status: Quote["status"]) => {
      if (!quote) return;
      const labels: Record<string, string> = {
        sent: "Send",
        accepted: "Accept",
        rejected: "Reject",
      };
      const msgs: Record<string, string> = {
        sent: "Send this quote?",
        accepted: "Accept this quote?",
        rejected: "Reject this quote?",
      };
      await withConfirmation(
        {
          title: `${labels[status]} Quote`,
          message: msgs[status],
          confirmText: labels[status],
          variant: status === "rejected" ? "danger" : "primary",
        },
        async () => {
          try {
            const result = await handleStatusUpdate(quote.id, status);
            if (result.success) {
              success(`Quote ${status} successfully.`);
              const updated = getQuote(quote.id);
              if (updated) setQuote(updated);
            } else {
              showError(result.error || `Failed to ${status} quote.`);
            }
          } catch (err) {
            showError(`Failed to update status.`);
          }
        },
      );
    },
    [quote, withConfirmation, handleStatusUpdate, getQuote, success, showError],
  );

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

  const handlePrint = useCallback(() => {
    setViewMode("preview");
    setTimeout(() => window.print(), 300);
  }, []);

  const handleEmail = useCallback(async () => {
    success("Quote emailed successfully.");
  }, [success]);
  const handleEdit = useCallback(() => {
    if (quote) navigate(`/sales/quotes/edit/${quote.id}`);
  }, [quote, navigate]);
  const handleGoBack = useCallback(() => {
    navigate("/sales/quotes", { replace: true });
  }, [navigate]);

  const getHeaderDropdownItems = useCallback((): ThreeDotDropdownItem[] => {
    const items: ThreeDotDropdownItem[] = [
      {
        label: "Print",
        icon: <Printer className="h-4 w-4 text-blue-500" />,
        onClick: handlePrint,
      },
      {
        label: "Export as PDF",
        icon: <File className="h-4 w-4 text-red-500" />,
        onClick: () => handleExport("pdf"),
      },
      {
        label: "Export as Excel",
        icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
        onClick: () => handleExport("excel"),
      },
      {
        label: "Email",
        icon: <Mail className="h-4 w-4 text-purple-500" />,
        onClick: handleEmail,
      },
    ];
    if (quote?.status === "draft") {
      items.push({
        label: "Send",
        icon: <Send className="h-4 w-4 text-blue-500" />,
        onClick: () => handleStatusChange("sent"),
      });
      items.push({
        label: "Edit",
        icon: <Edit className="h-4 w-4 text-amber-500" />,
        onClick: handleEdit,
      });
    }
    if (quote?.status === "sent") {
      items.push({
        label: "Accept",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        onClick: () => handleStatusChange("accepted"),
      });
      items.push({
        label: "Reject",
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        onClick: () => handleStatusChange("rejected"),
      });
    }
    items.push({
      label: "Delete",
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      onClick: handleDeleteClick,
      danger: true,
    });
    return items;
  }, [
    quote,
    handleExport,
    handlePrint,
    handleEmail,
    handleStatusChange,
    handleEdit,
    handleDeleteClick,
  ]);

  const getStatusConfig = useCallback((status: string) => {
    const config: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      draft: {
        color: "bg-gray-100 text-gray-700",
        icon: <FileText className="h-4 w-4" />,
        label: "Draft",
      },
      sent: {
        color: "bg-blue-100 text-blue-700",
        icon: <Clock className="h-4 w-4" />,
        label: "Sent",
      },
      accepted: {
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle className="h-4 w-4" />,
        label: "Accepted",
      },
      rejected: {
        color: "bg-red-100 text-red-700",
        icon: <XCircle className="h-4 w-4" />,
        label: "Rejected",
      },
      expired: {
        color: "bg-yellow-100 text-yellow-700",
        icon: <Clock className="h-4 w-4" />,
        label: "Expired",
      },
    };
    return config[status] || config.draft;
  }, []);

  if (isLoading || loading)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  if (pageError || !quote)
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Not Found</h3>
          <p className="text-sm text-red-600">
            {pageError || "Quote not found"}
          </p>
          <button
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const statusConfig = getStatusConfig(quote.status);
  const documentData = getDocumentData();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Header Bar */}
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
              <Gem className="h-5 w-5 text-amber-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">
                    {quote.quoteNo}
                  </h1>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusConfig.color}`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  {new Date(quote.createdAt).toLocaleDateString()} |{" "}
                  {quote.customerName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("details")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "details"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                Details
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === "preview"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                PDF View
              </button>
            </div>

            {/* Action Buttons */}
            {quote.status === "draft" && (
              <>
                <button
                  onClick={() => handleStatusChange("sent")}
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
            {quote.status === "sent" && (
              <>
                <button
                  onClick={() => handleStatusChange("accepted")}
                  className="px-3 py-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Accept
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  className="px-3 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <ThreeDotDropdown
                items={getHeaderDropdownItems()}
                position="right"
              />
            </div>
          </div>
        </div>

        {/* Preview Toolbar - Only visible in preview mode */}
        {viewMode === "preview" && (
          <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-0.5">
              {(["modern", "classic", "compact", "minimal"] as const).map(
                (layout) => (
                  <button
                    key={layout}
                    onClick={() => setPreviewLayout(layout)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors capitalize ${
                      previewLayout === layout
                        ? "bg-amber-500 text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {layout}
                  </button>
                ),
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">
                Total: {formatCurrency(quote.total)}
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

      {/* Content Area */}
      <div className="p-4">
        {viewMode === "details" ? (
          /* ========== DETAILS VIEW ========== */
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Customer & Quote Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-amber-500" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {quote.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {quote.customerEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {quote.customerPhone}
                      </span>
                    </div>
                    {quote.customerGst && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          GST: {quote.customerGst}
                        </span>
                      </div>
                    )}
                    {quote.customerAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {quote.customerAddress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    Quote Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">No: </span>
                      <span className="text-sm font-medium text-gray-900">
                        {quote.quoteNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Date: </span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(quote.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Valid: </span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(quote.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Total: </span>
                      <span className="text-sm font-bold text-amber-600">
                        {formatCurrency(quote.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-500" />
                Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Item
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Purity
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Wt(g)
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Rate
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Making
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quote.items.map((item, index) => {
                      const total =
                        item.total ||
                        item.quantity * item.unitPrice +
                          item.makingCharges * item.quantity;
                      return (
                        <tr key={item.id || index}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-gray-900">
                              {item.itemName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.category}
                            </p>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {item.purity}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-600">
                            {item.weight?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-600">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-600">
                            {formatCurrency(item.makingCharges)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">
                            {formatCurrency(total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {quote.notes && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {quote.notes}
                    </p>
                  </div>
                )}
                {quote.termsAndConditions && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Terms & Conditions
                    </h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {quote.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(quote.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium">
                      {formatCurrency(quote.tax)}
                    </span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-red-500">
                        -{formatCurrency(quote.discount)}
                      </span>
                    </div>
                  )}
                  {quote.shippingCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium">
                        {formatCurrency(quote.shippingCharge)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">
                      {formatCurrency(quote.total)}
                    </span>
                  </div>
                  {quote.amountInWords && (
                    <p className="text-xs text-gray-500 text-right">
                      {quote.amountInWords}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========== PDF PREVIEW VIEW ========== */
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer
                data={documentData}
                layout={previewLayout}
                config={{
                  documentType: "quote",
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

export default QuoteView;
