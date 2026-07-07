// src/hooks/purchaseOrder/usePurchaseOrderEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { PurchaseOrder, PurchaseOrderFormData } from '../../types/purchaseOrder/PurchaseOrderType';
import { 
  validatePurchaseOrder, 
  validatePurchaseOrderField,
  validatePurchaseOrderBusinessRules 
} from '../../validations/purchaseOrderValidation';

export const usePurchaseOrderEdit = (order: PurchaseOrder | null) => {
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    vendorId: undefined,
    vendorName: undefined,
    vendorEmail: undefined,
    vendorPhone: undefined,
    vendorAddress: undefined,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: undefined,
    expectedDeliveryDate: undefined,
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
    notes: undefined,
    terms: undefined,
    shippingAddress: undefined,
    billingAddress: undefined,
    paymentTerms: undefined,
    attachment: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        vendorId: order.vendorId || undefined,
        vendorName: order.vendorName || undefined,
        vendorEmail: order.vendorEmail || undefined,
        vendorPhone: order.vendorPhone || undefined,
        vendorAddress: order.vendorAddress || undefined,
        orderDate: order.orderDate || new Date().toISOString().split('T')[0],
        deliveryDate: order.deliveryDate || undefined,
        expectedDeliveryDate: order.expectedDeliveryDate || undefined,
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
        notes: order.notes || undefined,
        terms: order.terms || undefined,
        shippingAddress: order.shippingAddress || undefined,
        billingAddress: order.billingAddress || undefined,
        paymentTerms: order.paymentTerms || undefined,
        attachment: order.attachment || undefined
      });
    }
  }, [order]);

  const handleChange = useCallback((field: keyof PurchaseOrderFormData, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // Real-time field validation using the validation file
      const fieldError = validatePurchaseOrderField(field, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) {
          newErrors[field] = fieldError;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      // If shipping/handling/other charges change, recalculate total
      if (field === 'shippingCharges' || field === 'handlingCharges' || field === 'otherCharges') {
        const totalAmount = newFormData.subtotal - newFormData.discountTotal + newFormData.taxTotal + 
          (newFormData.shippingCharges || 0) + 
          (newFormData.handlingCharges || 0) + 
          (newFormData.otherCharges || 0);
        
        return {
          ...newFormData,
          totalAmount
        };
      }

      return newFormData;
    });
  }, []);

  const handleItemsChange = useCallback((items: any[]) => {
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

    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount
    }));

    // Clear items error if items exist
    if (items.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  }, [formData.shippingCharges, formData.handlingCharges, formData.otherCharges]);

  const validateForm = useCallback((): boolean => {
    // Use centralized validation
    const { isValid, errors: validationErrors } = validatePurchaseOrder(formData);
    setErrors(validationErrors);
    
    // Check business rules for warnings
    if (isValid) {
      const businessWarnings = validatePurchaseOrderBusinessRules(formData);
      setWarnings(businessWarnings);
    } else {
      setWarnings([]);
    }
    
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    if (order) {
      setFormData({
        vendorId: order.vendorId || undefined,
        vendorName: order.vendorName || undefined,
        vendorEmail: order.vendorEmail || undefined,
        vendorPhone: order.vendorPhone || undefined,
        vendorAddress: order.vendorAddress || undefined,
        orderDate: order.orderDate || new Date().toISOString().split('T')[0],
        deliveryDate: order.deliveryDate || undefined,
        expectedDeliveryDate: order.expectedDeliveryDate || undefined,
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
        notes: order.notes || undefined,
        terms: order.terms || undefined,
        shippingAddress: order.shippingAddress || undefined,
        billingAddress: order.billingAddress || undefined,
        paymentTerms: order.paymentTerms || undefined,
        attachment: order.attachment || undefined
      });
    }
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, [order]);

  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: PurchaseOrderFormData) => Promise<any>
  ) => {
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
  }, [formData, validateForm, order]);

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