// src/hooks/VendorCredits/useVendorCreditsEdit.ts

import { useState, useEffect } from 'react';
import type{ VendorCredit, VendorCreditFormData } from '../../types/VendorCredits/VendorCreditsType';

export const useVendorCreditsEdit = (credit: VendorCredit | null) => {
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

  useEffect(() => {
    if (credit) {
      setFormData({
        creditDate: credit.creditDate || new Date().toISOString().split('T')[0],
        billId: credit.billId || '',
        billNumber: credit.billNumber || '',
        vendorId: credit.vendorId || '',
        vendorName: credit.vendorName || '',
        vendorEmail: credit.vendorEmail || '',
        vendorPhone: credit.vendorPhone || '',
        vendorGST: credit.vendorGST || '',
        amount: credit.amount || 0,
        taxAmount: credit.taxAmount || 0,
        totalAmount: credit.totalAmount || 0,
        reason: credit.reason || 'return',
        status: credit.status || 'draft',
        items: credit.items || [],
        notes: credit.notes || '',
        referenceNumber: credit.referenceNumber || '',
        usedAmount: credit.usedAmount || 0,
        balanceAmount: credit.balanceAmount || 0,
        expiryDate: credit.expiryDate || '',
        currency: credit.currency || 'INR',
        exchangeRate: credit.exchangeRate || 1,
        attachment: credit.attachment || ''
      });
    }
  }, [credit]);

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

  const handleItemsChange = (items: any[]) => {
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
    if (credit) {
      setFormData({
        creditDate: credit.creditDate || new Date().toISOString().split('T')[0],
        billId: credit.billId || '',
        billNumber: credit.billNumber || '',
        vendorId: credit.vendorId || '',
        vendorName: credit.vendorName || '',
        vendorEmail: credit.vendorEmail || '',
        vendorPhone: credit.vendorPhone || '',
        vendorGST: credit.vendorGST || '',
        amount: credit.amount || 0,
        taxAmount: credit.taxAmount || 0,
        totalAmount: credit.totalAmount || 0,
        reason: credit.reason || 'return',
        status: credit.status || 'draft',
        items: credit.items || [],
        notes: credit.notes || '',
        referenceNumber: credit.referenceNumber || '',
        usedAmount: credit.usedAmount || 0,
        balanceAmount: credit.balanceAmount || 0,
        expiryDate: credit.expiryDate || '',
        currency: credit.currency || 'INR',
        exchangeRate: credit.exchangeRate || 1,
        attachment: credit.attachment || ''
      });
    }
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: VendorCreditFormData) => Promise<any>) => {
    if (!validateForm() || !credit) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(credit.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating vendor credit:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update vendor credit'
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