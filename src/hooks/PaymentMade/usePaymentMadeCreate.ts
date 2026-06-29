// src/hooks/PaymentMade/usePaymentMadeCreate.ts

import { useState } from 'react';
import type{ PaymentMadeFormData } from '../../types/PaymentMade/PaymentMadeType'


export const usePaymentMadeCreate = () => {
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
    setFormData({
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
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: PaymentMadeFormData) => Promise<any>) => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(formData);
      resetForm();
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to create payment'
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