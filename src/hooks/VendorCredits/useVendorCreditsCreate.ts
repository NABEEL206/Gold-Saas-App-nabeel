// src/hooks/VendorCredits/useVendorCreditsCreate.ts

import { useState } from 'react';
import type { VendorCreditFormData, VendorCreditItem } from '../../types/VendorCredits/VendorCreditsType';

export const useVendorCreditsCreate = () => {
  const [formData, setFormData] = useState<VendorCreditFormData>({
    creditDate: new Date().toISOString().split('T')[0],
    billId: '',
    billNumber: '',
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    vendorGST: '',
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    reason: 'return',
    status: 'draft',
    items: [],
    notes: '',
    referenceNumber: '',
    usedAmount: 0,
    balanceAmount: 0,
    expiryDate: '',
    currency: 'INR',
    exchangeRate: 1,
    attachment: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof VendorCreditFormData, value: any) => {
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

  const handleItemsChange = (items: VendorCreditItem[]) => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      subtotal += item.quantity * item.rate;
      const discountAmount = item.discountType === 'fixed' 
        ? item.discount 
        : (item.quantity * item.rate) * (item.discount / 100);
      discountTotal += discountAmount;
      const afterDiscount = (item.quantity * item.rate) - discountAmount;
      const taxAmount = afterDiscount * (item.taxRate / 100);
      taxTotal += taxAmount;
    });

    const totalAmount = subtotal - discountTotal + taxTotal;
    const balanceAmount = totalAmount - (formData.usedAmount || 0);

    setFormData(prev => ({
      ...prev,
      items,
      amount: subtotal - discountTotal,
      taxAmount: taxTotal,
      totalAmount,
      balanceAmount
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorId && !formData.vendorName) {
      newErrors.vendorId = 'Vendor is required';
    }

    if (!formData.creditDate) {
      newErrors.creditDate = 'Credit date is required';
    }

    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.productName) {
          newErrors[`item_${index}_productName`] = 'Product name is required';
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
        }
        if (!item.rate || item.rate <= 0) {
          newErrors[`item_${index}_rate`] = 'Rate must be greater than 0';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      creditDate: new Date().toISOString().split('T')[0],
      billId: '',
      billNumber: '',
      vendorId: '',
      vendorName: '',
      vendorEmail: '',
      vendorPhone: '',
      vendorGST: '',
      amount: 0,
      taxAmount: 0,
      totalAmount: 0,
      reason: 'return',
      status: 'draft',
      items: [],
      notes: '',
      referenceNumber: '',
      usedAmount: 0,
      balanceAmount: 0,
      expiryDate: '',
      currency: 'INR',
      exchangeRate: 1,
      attachment: ''
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: VendorCreditFormData) => Promise<any>) => {
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
        submit: error instanceof Error ? error.message : 'Failed to create vendor credit'
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
    handleItemsChange,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors
  };
};