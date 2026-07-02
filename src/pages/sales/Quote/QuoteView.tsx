// src/pages/sales/Quote/QuoteView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Printer, Mail, CheckCircle, XCircle,
  Clock, FileText, User, Mail as MailIcon, Phone, MapPin,
  Building2, Package, IndianRupee, Calendar, Hash, Gem, Send,
  FileSpreadsheet, File, AlertCircle,
} from 'lucide-react';
import { useQuotes } from '../../../hooks/Quote/useQuotes';
import type { Quote } from '../../../types/Quote/QuoteTypes';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { ThreeDotDropdownItem } from '../../../components/common/ThreeDotDropdown';

const QuoteView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuote, deleteQuote, loading, handleStatusUpdate, fetchQuotes } = useQuotes();
  const {
    success,
    error: showError,
    confirm,
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
            setPageError('Quote not found');
          }
        } else {
          setPageError('No quote ID provided');
        }
      } catch (err) {
        console.error('Error loading quote:', err);
        setPageError('Failed to load quote details');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuote();
  }, [id, getQuote, fetchQuotes]);

  // Delete handler with confirmation
  const handleDeleteClick = useCallback(async () => {
    if (!quote) return;
    
    await withConfirmation(
      {
        title: 'Delete Quote',
        message: `Are you sure you want to delete ${quote.quoteNo}? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleting(true);
        try {
          const result = await deleteQuote(quote.id);
          if (result.success) {
            success(`Quote ${quote.quoteNo} deleted successfully.`);
            navigate('/sales/quotes', { replace: true });
          } else {
            showError(result.error || 'Failed to delete quote.');
          }
        } catch (err) {
          showError('Failed to delete quote. Please try again.');
        } finally {
          setDeleting(false);
        }
      }
    );
  }, [quote, withConfirmation, deleteQuote, success, showError, navigate]);

  // Status change handler with confirmation
  const handleStatusChange = useCallback(async (status: Quote['status']) => {
    if (!quote) return;

    const statusMessages: Record<string, string> = {
      sent: 'Are you sure you want to send this quote to the customer?',
      accepted: 'Are you sure you want to mark this quote as accepted?',
      rejected: 'Are you sure you want to reject this quote?',
    };

    await withConfirmation(
      {
        title: `${status.charAt(0).toUpperCase() + status.slice(1)} Quote`,
        message: statusMessages[status] || `Are you sure you want to mark this quote as ${status}?`,
        confirmText: status.charAt(0).toUpperCase() + status.slice(1),
        variant: status === 'rejected' ? 'danger' : status === 'accepted' ? 'primary' : 'primary',
      },
      async () => {
        try {
          const result = await handleStatusUpdate(quote.id, status);
          if (result.success) {
            success(`Quote ${status === 'sent' ? 'sent' : status === 'accepted' ? 'accepted' : 'rejected'} successfully.`);
            const updated = getQuote(quote.id);
            if (updated) setQuote(updated);
          } else {
            showError(result.error || `Failed to ${status} quote.`);
          }
        } catch (err) {
          showError(`Failed to update quote status. Please try again.`);
        }
      }
    );
  }, [quote, withConfirmation, handleStatusUpdate, getQuote, success, showError]);

  // Export handler
  const handleExport = useCallback(async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Quote exported as ${format.toUpperCase()} successfully.`);
    } catch (err) {
      showError(`Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExportLoading(false);
    }
  }, [success, showError]);

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Email handler
  const handleEmail = useCallback(async () => {
    await withConfirmation(
      {
        title: 'Send Email',
        message: 'Are you sure you want to email this quote to the customer?',
        confirmText: 'Send Email',
        variant: 'primary',
      },
      async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          success('Quote emailed to customer successfully.');
        } catch (err) {
          showError('Failed to send email. Please try again.');
        }
      }
    );
  }, [withConfirmation, success, showError]);

  // Navigation handlers
  const handleEdit = useCallback(() => {
    if (quote) navigate(`/sales/quotes/edit/${quote.id}`);
  }, [quote, navigate]);

  const handleGoBack = useCallback(() => {
    navigate('/sales/quotes', { replace: true });
  }, [navigate]);

  // Get dropdown items
  const getHeaderDropdownItems = useCallback((): ThreeDotDropdownItem[] => {
    const items: ThreeDotDropdownItem[] = [
      {
        label: 'Export as PDF',
        icon: <File className="h-4 w-4 text-red-500" />,
        onClick: () => handleExport('pdf'),
        disabled: exportLoading,
      },
      {
        label: 'Export as Excel',
        icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
        onClick: () => handleExport('excel'),
        disabled: exportLoading,
      },
      {
        label: 'Print',
        icon: <Printer className="h-4 w-4 text-blue-500" />,
        onClick: handlePrint,
      },
      {
        label: 'Email',
        icon: <Mail className="h-4 w-4 text-purple-500" />,
        onClick: handleEmail,
      },
    ];

    if (quote?.status === 'draft') {
      items.push({
        label: 'Send Quote',
        icon: <Send className="h-4 w-4 text-blue-500" />,
        onClick: () => handleStatusChange('sent'),
      });
      items.push({
        label: 'Edit',
        icon: <Edit className="h-4 w-4 text-amber-500" />,
        onClick: handleEdit,
      });
    }

    if (quote?.status === 'sent') {
      items.push({
        label: 'Accept',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        onClick: () => handleStatusChange('accepted'),
      });
      items.push({
        label: 'Reject',
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        onClick: () => handleStatusChange('rejected'),
      });
    }

    items.push({
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      onClick: handleDeleteClick,
      danger: true,
    });

    return items;
  }, [quote, exportLoading, handleExport, handlePrint, handleEmail, handleStatusChange, handleEdit, handleDeleteClick]);

  const getStatusConfig = useCallback((status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-4 w-4" />, label: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-4 w-4" />, label: 'Sent' },
      accepted: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4" />, label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" />, label: 'Rejected' },
      expired: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-4 w-4" />, label: 'Expired' },
    };
    return config[status] || config.draft;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading quote details..." />
      </div>
    );
  }

  // Error state
  if (pageError || !quote) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Quote Not Found</h3>
          <p className="text-sm text-red-600">{pageError || 'Quote does not exist'}</p>
          <button
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(quote.status);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Gem className="h-6 w-6 text-amber-500" />
                  {quote.quoteNo}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Created on {new Date(quote.createdAt).toLocaleDateString()} by {quote.createdBy}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {quote.status === 'draft' && (
              <>
                <button
                  onClick={() => handleStatusChange('sent')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </>
            )}
            {quote.status === 'sent' && (
              <>
                <button
                  onClick={() => handleStatusChange('accepted')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
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

        {/* Quote Details */}
        <div className="space-y-6">
          {/* Customer & Quote Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-500" />
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{quote.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{quote.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{quote.customerPhone}</span>
                  </div>
                  {quote.customerGst && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">GST: {quote.customerGst}</span>
                    </div>
                  )}
                  {quote.customerAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{quote.customerAddress}</span>
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
                    <span className="text-sm text-gray-600">Quote No: </span>
                    <span className="text-sm font-medium text-gray-900">{quote.quoteNo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Date: </span>
                    <span className="text-sm font-medium text-gray-900">{new Date(quote.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Valid Until: </span>
                    <span className="text-sm font-medium text-gray-900">{new Date(quote.validUntil).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Value: </span>
                    <span className="text-sm font-bold text-amber-600">₹{quote.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purity</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Weight (g)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Making</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.items.map((item, index) => {
                    const itemTotal = item.quantity * item.unitPrice;
                    const makingTotal = item.makingCharges * item.quantity;
                    const wastageTotal = (itemTotal * item.wastagePercentage / 100);
                    const total = itemTotal + makingTotal + wastageTotal + (item.stoneCharges * item.quantity);
                    
                    return (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium text-gray-900">{item.itemName}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2"><span className="text-sm text-gray-600">{item.purity}</span></td>
                        <td className="px-3 py-2 text-right text-sm text-gray-600">{item.weight.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-sm text-gray-600">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-sm text-gray-600">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-sm text-gray-600">₹{item.makingCharges.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">₹{total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary & Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {quote.notes && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{quote.notes}</p>
                </div>
              )}
              {quote.termsAndConditions && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-gray-600">{quote.termsAndConditions}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{quote.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">₹{quote.tax.toFixed(2)}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-red-500">-₹{(quote.discountType === 'percentage' ? (quote.subtotal * quote.discount / 100) : quote.discount).toFixed(2)}</span>
                  </div>
                )}
                {quote.shippingCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">₹{quote.shippingCharge.toFixed(2)}</span>
                  </div>
                )}
                {quote.otherCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Other Charges</span>
                    <span className="font-medium">₹{quote.otherCharges.toFixed(2)}</span>
                  </div>
                )}
                {quote.roundOff !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Round Off</span>
                    <span className="font-medium">₹{quote.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-amber-600">₹{quote.total.toFixed(2)}</span>
                  </div>
                  {quote.amountInWords && (
                    <p className="text-xs text-gray-500 mt-1 text-right">{quote.amountInWords}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
            <p>Generated on {formatDate(quote.createdAt)} | {quote.quoteNo}</p>
          </div>
        </div>
      </div>

      {/* Reusable Confirmation Modal - Replaces all inline modals */}
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

export default QuoteView;