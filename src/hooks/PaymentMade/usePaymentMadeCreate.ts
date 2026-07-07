// src/hooks/PaymentMade/usePaymentMadeCreate.ts

import { useState, useCallback } from 'react';
import type { PaymentMadeFormData } from '../../types/PaymentMade/PaymentMadeType';
import { 
  validatePaymentMade, 
  validatePaymentMadeField,
  validatePaymentMadeBusinessRules 
} from '../../validations/paymentMadeValidation';

export const usePaymentMadeCreate = () => {
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
    setFormData({
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
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (submitFn: (data: PaymentMadeFormData) => Promise<any>) => {
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
  }, [formData, validateForm, resetForm]);

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