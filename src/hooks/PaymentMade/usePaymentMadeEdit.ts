// src/hooks/PaymentMade/usePaymentMadeEdit.ts

import { useState, useEffect } from 'react';
import type{ PaymentMade, PaymentMadeFormData } from '../../types/PaymentMade/PaymentMadeType'


export const usePaymentMadeEdit = (payment: PaymentMade | null) => {
  const [formData, setFormData] = useState<PaymentMadeFormData>({
    paymentDate: new Date().toISOString().split('T')[0],
    billId: '',
    billNumber: '',
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    amount: 0,
    paymentMethod: 'bank',
    referenceNumber: '',
    chequeNumber: '',
    bankName: '',
    bankAccount: '',
    notes: '',
    status: 'pending',
    attachment: '',
    currency: 'INR',
    exchangeRate: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        paymentDate: payment.paymentDate || new Date().toISOString().split('T')[0],
        billId: payment.billId || '',
        billNumber: payment.billNumber || '',
        vendorId: payment.vendorId || '',
        vendorName: payment.vendorName || '',
        vendorEmail: payment.vendorEmail || '',
        amount: payment.amount || 0,
        paymentMethod: payment.paymentMethod || 'bank',
        referenceNumber: payment.referenceNumber || '',
        chequeNumber: payment.chequeNumber || '',
        bankName: payment.bankName || '',
        bankAccount: payment.bankAccount || '',
        notes: payment.notes || '',
        status: payment.status || 'pending',
        attachment: payment.attachment || '',
        currency: payment.currency || 'INR',
        exchangeRate: payment.exchangeRate || 1
      });
    }
  }, [payment]);

  const handleChange = (field: keyof PaymentMadeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorId && !formData.vendorName) {
      newErrors.vendorId = 'Vendor is required';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    if (payment) {
      setFormData({
        paymentDate: payment.paymentDate || new Date().toISOString().split('T')[0],
        billId: payment.billId || '',
        billNumber: payment.billNumber || '',
        vendorId: payment.vendorId || '',
        vendorName: payment.vendorName || '',
        vendorEmail: payment.vendorEmail || '',
        amount: payment.amount || 0,
        paymentMethod: payment.paymentMethod || 'bank',
        referenceNumber: payment.referenceNumber || '',
        chequeNumber: payment.chequeNumber || '',
        bankName: payment.bankName || '',
        bankAccount: payment.bankAccount || '',
        notes: payment.notes || '',
        status: payment.status || 'pending',
        attachment: payment.attachment || '',
        currency: payment.currency || 'INR',
        exchangeRate: payment.exchangeRate || 1
      });
    }
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: PaymentMadeFormData) => Promise<any>) => {
    if (!validateForm() || !payment) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(payment.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating payment:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update payment'
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors
  };
};