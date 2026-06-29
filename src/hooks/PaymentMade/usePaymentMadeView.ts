// src/hooks/PaymentMade/usePaymentMadeView.ts

import { useState } from 'react';
import { 
    PAYMENT_MADE_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  type PaymentMade, 
  PAYMENT_MADE_STATUS_LABELS} from '../../types/PaymentMade/PaymentMadeType'


export const usePaymentMadeView = (payment: PaymentMade | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplayName = (): string => {
    if (!payment) return 'N/A';
    return payment.paymentNumber || 'Unnamed Payment';
  };

  const getVendorName = (): string => {
    if (!payment) return 'N/A';
    return payment.vendorName || 'N/A';
  };

  const getStatusLabel = (): string => {
    if (!payment) return 'Unknown';
    return PAYMENT_MADE_STATUS_LABELS[payment.status] || payment.status;
  };

  const getStatusColor = (): string => {
    if (!payment) return 'bg-gray-100 text-gray-800';
    return PAYMENT_MADE_STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodLabel = (): string => {
    if (!payment) return 'Unknown';
    return PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod;
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getPaymentSummary = () => {
    if (!payment) return null;
    return {
      paymentNumber: payment.paymentNumber,
      vendorName: payment.vendorName,
      billNumber: payment.billNumber,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      referenceNumber: payment.referenceNumber
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getVendorName,
    getStatusLabel,
    getStatusColor,
    getPaymentMethodLabel,
    formatCurrency,
    getPaymentSummary,
    setIsLoading,
    setError
  };
};