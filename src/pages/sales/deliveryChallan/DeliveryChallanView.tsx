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

type ViewMode = "details" | "preview";

const StatusBadge: React.FC<{ status: DeliveryChallan["status"] }> = ({
  status,
}) => {
  const config: Record<
    string,
    { color: string; icon: React.ReactNode; label: string }
  > = {
    draft: {
      color: "bg-gray-100 text-gray-700",
      icon: <Clock className="h-3 w-3" />,
      label: "Draft",
    },
    sent: {
      color: "bg-blue-100 text-blue-700",
      icon: <Truck className="h-3 w-3" />,
      label: "Sent",
    },
    delivered: {
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Delivered",
    },
    cancelled: {
      color: "bg-red-100 text-red-700",
      icon: <XCircle className="h-3 w-3" />,
      label: "Cancelled",
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
      show: challan?.status === "draft",
    },
    {
      label: "Delete",
      icon: deleteLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash2 className="h-4 w-4 text-red-500" />
      ),
      onClick: handleDelete,
      show: challan?.status === "draft",
      disabled: deleteLoading,
    },
    {
      label: "Send",
      icon: <Send className="h-4 w-4 text-blue-500" />,
      onClick: () => handleStatusUpdate("sent"),
      show: challan?.status === "draft",
      disabled: updating,
    },
    {
      label: "Delivered",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate("delivered"),
      show: challan?.status === "sent",
      disabled: updating,
    },
    {
      label: "Cancel",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
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
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Not found</p>
          <button
            onClick={() => navigate("/sales/delivery-challan")}
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
              onClick={() => navigate("/sales/delivery-challan")}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5 text-blue-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">
                    {challan.challanNumber}
                  </h1>
                  <StatusBadge status={challan.status} />
                </div>
                <p className="text-[11px] text-gray-500">
                  {new Date(challan.challanDate).toLocaleDateString()} |{" "}
                  {challan.customerName}
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
            {challan.status === "draft" && (
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
            {challan.status === "sent" && (
              <button
                onClick={() => handleStatusUpdate("delivered")}
                className="px-3 py-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1"
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
                Total: {formatCurrency(challan.total)}
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
            <div className="bg-white rounded-lg border border-gray-200 p-5 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    DELIVERY CHALLAN
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    # {challan.challanNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(challan.challanDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Delivery:{" "}
                    {new Date(challan.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(challan.total)}
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
                    {challan.customerName}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {challan.customerEmail}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    {challan.customerPhone}
                  </p>
                </div>
                <div>
                  {challan.customerAddress && (
                    <p className="text-gray-600 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {challan.customerAddress}
                    </p>
                  )}
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    {challan.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>
            {(challan.transporterName ||
              challan.vehicleNumber ||
              challan.lrNumber) && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TruckIcon className="h-4 w-4" />
                  Transport
                </h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  {challan.transporterName && (
                    <div>
                      <p className="text-xs text-gray-500">Transporter</p>
                      <p className="font-medium">{challan.transporterName}</p>
                    </div>
                  )}
                  {challan.vehicleNumber && (
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="font-medium">{challan.vehicleNumber}</p>
                    </div>
                  )}
                  {challan.lrNumber && (
                    <div>
                      <p className="text-xs text-gray-500">LR No</p>
                      <p className="font-medium">{challan.lrNumber}</p>
                    </div>
                  )}
                  {challan.lrDate && (
                    <div>
                      <p className="text-xs text-gray-500">LR Date</p>
                      <p className="font-medium">
                        {new Date(challan.lrDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Items ({challan.items?.length || 0})
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
                        Rate
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
                    {challan.items?.map((item, i) => (
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
                          {formatCurrency(item.rate)}
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
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(challan.subtotal)}</span>
                  </div>
                  {challan.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(challan.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatCurrency(challan.taxAmount)}</span>
                  </div>
                  {challan.shippingCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span>{formatCurrency(challan.shippingCharge)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">
                      {formatCurrency(challan.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {(challan.notes || challan.termsAndConditions) && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 grid grid-cols-2 gap-4">
                {challan.notes && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600">{challan.notes}</p>
                  </div>
                )}
                {challan.termsAndConditions && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                      Terms
                    </h4>
                    <p className="text-sm text-gray-600">
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
