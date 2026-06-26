// src/hooks/purchaseOrder/usePurchaseOrderEdit.ts

import { useState, useEffect } from 'react';
import type{ PurchaseOrder, PurchaseOrderFormData } from '../../types/purchaseOrder/PurchaseOrderType';

export const usePurchaseOrderEdit = (order: PurchaseOrder | null) => {
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

  useEffect(() => {
    if (order) {
      setFormData({
        vendorId: order.vendorId || '',
        vendorName: order.vendorName || '',
        vendorEmail: order.vendorEmail || '',
        vendorPhone: order.vendorPhone || '',
        vendorAddress: order.vendorAddress || '',
        orderDate: order.orderDate || new Date().toISOString().split('T')[0],
        deliveryDate: order.deliveryDate || '',
        expectedDeliveryDate: order.expectedDeliveryDate || '',
        status: order.status || 'draft',
        priority: order.priority || 'medium',
        items: order.items || [],
        subtotal: order.subtotal || 0,
        discountTotal: order.discountTotal || 0,
        taxTotal: order.taxTotal || 0,
        shippingCharges: order.shippingCharges || 0,
        handlingCharges: order.handlingCharges || 0,
        otherCharges: order.otherCharges || 0,
        totalAmount: order.totalAmount || 0,
        currency: order.currency || 'INR',
        exchangeRate: order.exchangeRate || 1,
        notes: order.notes || '',
        terms: order.terms || '',
        shippingAddress: order.shippingAddress || '',
        billingAddress: order.billingAddress || '',
        paymentTerms: order.paymentTerms || '',
        attachment: order.attachment || ''
      });
    }
  }, [order]);

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
    if (order) {
      setFormData({
        vendorId: order.vendorId || '',
        vendorName: order.vendorName || '',
        vendorEmail: order.vendorEmail || '',
        vendorPhone: order.vendorPhone || '',
        vendorAddress: order.vendorAddress || '',
        orderDate: order.orderDate || new Date().toISOString().split('T')[0],
        deliveryDate: order.deliveryDate || '',
        expectedDeliveryDate: order.expectedDeliveryDate || '',
        status: order.status || 'draft',
        priority: order.priority || 'medium',
        items: order.items || [],
        subtotal: order.subtotal || 0,
        discountTotal: order.discountTotal || 0,
        taxTotal: order.taxTotal || 0,
        shippingCharges: order.shippingCharges || 0,
        handlingCharges: order.handlingCharges || 0,
        otherCharges: order.otherCharges || 0,
        totalAmount: order.totalAmount || 0,
        currency: order.currency || 'INR',
        exchangeRate: order.exchangeRate || 1,
        notes: order.notes || '',
        terms: order.terms || '',
        shippingAddress: order.shippingAddress || '',
        billingAddress: order.billingAddress || '',
        paymentTerms: order.paymentTerms || '',
        attachment: order.attachment || ''
      });
    }
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: PurchaseOrderFormData) => Promise<any>) => {
    if (!validateForm() || !order) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(order.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update purchase order'
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