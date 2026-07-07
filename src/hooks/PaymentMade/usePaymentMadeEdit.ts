// src/hooks/PaymentMade/usePaymentMadeEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { PaymentMade, PaymentMadeFormData } from '../../types/PaymentMade/PaymentMadeType';
import { 
  validatePaymentMade, 
  validatePaymentMadeField,
  validatePaymentMadeBusinessRules 
} from '../../validations/paymentMadeValidation';
export const usePaymentMadeEdit = (payment: PaymentMade | null) => {
  const [formData, setFormData] = useState<PaymentMadeFormData>({
    paymentDate: new Date().toISOString().split('T')[0],
    billId: undefined,
    billNumber: undefined,
    vendorId: undefined,
    vendorName: undefined,
    vendorEmail: undefined,
    amount: 0,
    paymentMethod: 'bank',
    referenceNumber: undefined,
    chequeNumber: undefined,
    bankName: undefined,
    bankAccount: undefined,
    notes: undefined,
    status: 'pending',
    attachment: undefined,
    currency: 'INR',
    exchangeRate: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        paymentDate: payment.paymentDate || new Date().toISOString().split('T')[0],
        billId: payment.billId || undefined,
        billNumber: payment.billNumber || undefined,
        vendorId: payment.vendorId || undefined,
        vendorName: payment.vendorName || undefined,
        vendorEmail: payment.vendorEmail || undefined,
        amount: payment.amount || 0,
        paymentMethod: payment.paymentMethod || 'bank',
        referenceNumber: payment.referenceNumber || undefined,
        chequeNumber: payment.chequeNumber || undefined,
        bankName: payment.bankName || undefined,
        bankAccount: payment.bankAccount || undefined,
        notes: payment.notes || undefined,
        status: payment.status || 'pending',
        attachment: payment.attachment || undefined,
        currency: payment.currency || 'INR',
        exchangeRate: payment.exchangeRate || 1
      });
    }
  }, [payment]);

  const handleChange = useCallback((field: keyof PaymentMadeFormData, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // Real-time field validation
      const fieldError = validatePaymentMadeField(field, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) {
          newErrors[field] = fieldError;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      return newFormData;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const { isValid, errors: validationErrors } = validatePaymentMade(formData);
    setErrors(validationErrors);
    
    if (isValid) {
      const businessWarnings = validatePaymentMadeBusinessRules(formData);
      setWarnings(businessWarnings);
    } else {
      setWarnings([]);
    }
    
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    if (payment) {
      setFormData({
        paymentDate: payment.paymentDate || new Date().toISOString().split('T')[0],
        billId: payment.billId || undefined,
        billNumber: payment.billNumber || undefined,
        vendorId: payment.vendorId || undefined,
        vendorName: payment.vendorName || undefined,
        vendorEmail: payment.vendorEmail || undefined,
        amount: payment.amount || 0,
        paymentMethod: payment.paymentMethod || 'bank',
        referenceNumber: payment.referenceNumber || undefined,
        chequeNumber: payment.chequeNumber || undefined,
        bankName: payment.bankName || undefined,
        bankAccount: payment.bankAccount || undefined,
        notes: payment.notes || undefined,
        status: payment.status || 'pending',
        attachment: payment.attachment || undefined,
        currency: payment.currency || 'INR',
        exchangeRate: payment.exchangeRate || 1
      });
    }
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, [payment]);

  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: PaymentMadeFormData) => Promise<any>
  ) => {
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
  }, [formData, validateForm, payment]);

  return {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleSubmit,
    validateForm,
    resetForm,
    setFormData,
    setErrors,
    setWarnings
  };
};