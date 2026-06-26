// src/hooks/purchaseOrder/usePurchaseOrderCreate.ts

import { useState } from 'react';
import type{ PurchaseOrderFormData, PurchaseOrderItem } from '../../types/purchaseOrder/PurchaseOrderType';

export const usePurchaseOrderCreate = () => {
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    vendorAddress: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    expectedDeliveryDate: '',
    status: 'draft',
    priority: 'medium',
    items: [],
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    shippingCharges: 0,
    handlingCharges: 0,
    otherCharges: 0,
    totalAmount: 0,
    currency: 'INR',
    exchangeRate: 1,
    notes: '',
    terms: '',
    shippingAddress: '',
    billingAddress: '',
    paymentTerms: '',
    attachment: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof PurchaseOrderFormData, value: any) => {
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

  const handleItemsChange = (items: PurchaseOrderItem[]) => {
    // Calculate totals
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

    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorId && !formData.vendorName) {
      newErrors.vendorId = 'Vendor is required';
    }

    if (!formData.orderDate) {
      newErrors.orderDate = 'Order date is required';
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
      vendorId: '',
      vendorName: '',
      vendorEmail: '',
      vendorPhone: '',
      vendorAddress: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      expectedDeliveryDate: '',
      status: 'draft',
      priority: 'medium',
      items: [],
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      shippingCharges: 0,
      handlingCharges: 0,
      otherCharges: 0,
      totalAmount: 0,
      currency: 'INR',
      exchangeRate: 1,
      notes: '',
      terms: '',
      shippingAddress: '',
      billingAddress: '',
      paymentTerms: '',
      attachment: ''
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: PurchaseOrderFormData) => Promise<any>) => {
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
        submit: error instanceof Error ? error.message : 'Failed to create purchase order'
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