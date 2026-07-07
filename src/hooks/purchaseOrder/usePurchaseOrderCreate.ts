// src/hooks/purchaseOrder/usePurchaseOrderCreate.ts

import { useState, useCallback } from 'react';
import type { PurchaseOrderFormData, PurchaseOrderItem } from '../../types/purchaseOrder/PurchaseOrderType';
import { 
  validatePurchaseOrder, 
  validatePurchaseOrderField,
  validatePurchaseOrderBusinessRules 
} from '../../validations/purchaseOrderValidation';

export const usePurchaseOrderCreate = () => {
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

  const handleItemsChange = useCallback((items: PurchaseOrderItem[]) => {
    // Calculate totals
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
    if (items.length > 0 && errors.items) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  }, [formData.shippingCharges, formData.handlingCharges, formData.otherCharges, errors.items]);

  const validateForm = useCallback((): boolean => {
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
    setFormData({
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
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (submitFn: (data: PurchaseOrderFormData) => Promise<any>) => {
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