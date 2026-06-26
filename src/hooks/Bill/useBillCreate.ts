// src/hooks/Bill/useBillCreate.ts

import { useState } from 'react';
import type{ BillFormData, BillItem } from '../../types/Bill/BillTypes';

export const useBillCreate = () => {
  const [formData, setFormData] = useState<BillFormData>({
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    vendorAddress: '',
    vendorGST: '',
    purchaseOrderNumber: '',
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
    notes: '',
    terms: '',
    attachment: '',
    paymentTerms: '',
    paymentDate: '',
    paymentMethod: 'bank'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof BillFormData, value: any) => {
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

  const handleItemsChange = (items: BillItem[]) => {
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
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorId && !formData.vendorName) {
      newErrors.vendorId = 'Vendor is required';
    }

    if (!formData.billDate) {
      newErrors.billDate = 'Bill date is required';
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
      billDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      vendorId: '',
      vendorName: '',
      vendorEmail: '',
      vendorPhone: '',
      vendorAddress: '',
      vendorGST: '',
      purchaseOrderNumber: '',
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
      notes: '',
      terms: '',
      attachment: '',
      paymentTerms: '',
      paymentDate: '',
      paymentMethod: 'bank'
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: BillFormData) => Promise<any>) => {
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