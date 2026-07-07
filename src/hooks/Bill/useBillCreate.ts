// src/hooks/Bill/useBillCreate.ts

import { useState, useCallback } from 'react';
import type { BillFormData, BillItem } from '../../types/Bill/BillTypes';
import { 
  validateBill, 
  validateBillField,
  validateBillBusinessRules 
} from '../../validations/billValidation';

export const useBillCreate = () => {
  const [formData, setFormData] = useState<BillFormData>({
    billDate: new Date().toISOString().split('T')[0],
    dueDate: undefined,
    vendorId: undefined,
    vendorName: undefined,
    vendorEmail: undefined,
    vendorPhone: undefined,
    vendorAddress: undefined,
    vendorGST: undefined,
    purchaseOrderNumber: undefined,
    status: 'draft',
    items: [],
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    shippingCharges: 0,
    handlingCharges: 0,
    otherCharges: 0,
    totalAmount: 0,
    paidAmount: 0,
    balanceDue: 0,
    currency: 'INR',
    exchangeRate: 1,
    notes: undefined,
    terms: undefined,
    attachment: undefined,
    paymentTerms: undefined,
    paymentDate: undefined,
    paymentMethod: 'bank'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof BillFormData, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // Real-time field validation
      const fieldError = validateBillField(field, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) {
          newErrors[field] = fieldError;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      // Recalculate balance when paid amount or total changes
      if (field === 'paidAmount') {
        const balanceDue = newFormData.totalAmount - (value || 0);
        return {
          ...newFormData,
          balanceDue
        };
      }

      return newFormData;
    });
  }, []);

  const handleItemsChange = useCallback((items: BillItem[]) => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      const itemTotal = (item.quantity || 0) * (item.rate || 0);
      subtotal += itemTotal;
      
      const discountAmount = item.discountType === 'fixed' 
        ? (item.discount || 0)
        : itemTotal * ((item.discount || 0) / 100);
      discountTotal += discountAmount;
      
      const afterDiscount = itemTotal - discountAmount;
      const taxAmount = afterDiscount * ((item.taxRate || 0) / 100);
      taxTotal += taxAmount;
    });

    const totalAmount = subtotal - discountTotal + taxTotal + 
      (formData.shippingCharges || 0) + 
      (formData.handlingCharges || 0) + 
      (formData.otherCharges || 0);

    const balanceDue = totalAmount - (formData.paidAmount || 0);

    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount,
      balanceDue
    }));

    // Clear items error if items exist
    if (items.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  }, [formData.shippingCharges, formData.handlingCharges, formData.otherCharges, formData.paidAmount]);

  const validateForm = useCallback((): boolean => {
    const { isValid, errors: validationErrors } = validateBill(formData);
    setErrors(validationErrors);
    
    if (isValid) {
      const businessWarnings = validateBillBusinessRules(formData);
      setWarnings(businessWarnings);
    } else {
      setWarnings([]);
    }
    
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      billDate: new Date().toISOString().split('T')[0],
      dueDate: undefined,
      vendorId: undefined,
      vendorName: undefined,
      vendorEmail: undefined,
      vendorPhone: undefined,
      vendorAddress: undefined,
      vendorGST: undefined,
      purchaseOrderNumber: undefined,
      status: 'draft',
      items: [],
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      shippingCharges: 0,
      handlingCharges: 0,
      otherCharges: 0,
      totalAmount: 0,
      paidAmount: 0,
      balanceDue: 0,
      currency: 'INR',
      exchangeRate: 1,
      notes: undefined,
      terms: undefined,
      attachment: undefined,
      paymentTerms: undefined,
      paymentDate: undefined,
      paymentMethod: 'bank'
    });
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (submitFn: (data: BillFormData) => Promise<any>) => {
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
        submit: error instanceof Error ? error.message : 'Failed to create bill'
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
    handleItemsChange,
    handleSubmit,
    validateForm,
    resetForm,
    setFormData,
    setErrors,
    setWarnings
  };
};