// src/hooks/Bill/useBillEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { Bill, BillFormData } from '../../types/Bill/BillTypes';
import { 
  validateBill, 
  validateBillField,
  validateBillBusinessRules 
} from '../../validations/billValidation';

export const useBillEdit = (bill: Bill | null) => {
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

  useEffect(() => {
    if (bill) {
      setFormData({
        billDate: bill.billDate || new Date().toISOString().split('T')[0],
        dueDate: bill.dueDate || undefined,
        vendorId: bill.vendorId || undefined,
        vendorName: bill.vendorName || undefined,
        vendorEmail: bill.vendorEmail || undefined,
        vendorPhone: bill.vendorPhone || undefined,
        vendorAddress: bill.vendorAddress || undefined,
        vendorGST: bill.vendorGST || undefined,
        purchaseOrderNumber: bill.purchaseOrderNumber || undefined,
        status: bill.status || 'draft',
        items: bill.items || [],
        subtotal: bill.subtotal || 0,
        discountTotal: bill.discountTotal || 0,
        taxTotal: bill.taxTotal || 0,
        shippingCharges: bill.shippingCharges || 0,
        handlingCharges: bill.handlingCharges || 0,
        otherCharges: bill.otherCharges || 0,
        totalAmount: bill.totalAmount || 0,
        paidAmount: bill.paidAmount || 0,
        balanceDue: bill.balanceDue || 0,
        currency: bill.currency || 'INR',
        exchangeRate: bill.exchangeRate || 1,
        notes: bill.notes || undefined,
        terms: bill.terms || undefined,
        attachment: bill.attachment || undefined,
        paymentTerms: bill.paymentTerms || undefined,
        paymentDate: bill.paymentDate || undefined,
        paymentMethod: bill.paymentMethod || 'bank'
      });
    }
  }, [bill]);

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

      // Recalculate balance when paid amount changes
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
    if (bill) {
      setFormData({
        billDate: bill.billDate || new Date().toISOString().split('T')[0],
        dueDate: bill.dueDate || undefined,
        vendorId: bill.vendorId || undefined,
        vendorName: bill.vendorName || undefined,
        vendorEmail: bill.vendorEmail || undefined,
        vendorPhone: bill.vendorPhone || undefined,
        vendorAddress: bill.vendorAddress || undefined,
        vendorGST: bill.vendorGST || undefined,
        purchaseOrderNumber: bill.purchaseOrderNumber || undefined,
        status: bill.status || 'draft',
        items: bill.items || [],
        subtotal: bill.subtotal || 0,
        discountTotal: bill.discountTotal || 0,
        taxTotal: bill.taxTotal || 0,
        shippingCharges: bill.shippingCharges || 0,
        handlingCharges: bill.handlingCharges || 0,
        otherCharges: bill.otherCharges || 0,
        totalAmount: bill.totalAmount || 0,
        paidAmount: bill.paidAmount || 0,
        balanceDue: bill.balanceDue || 0,
        currency: bill.currency || 'INR',
        exchangeRate: bill.exchangeRate || 1,
        notes: bill.notes || undefined,
        terms: bill.terms || undefined,
        attachment: bill.attachment || undefined,
        paymentTerms: bill.paymentTerms || undefined,
        paymentDate: bill.paymentDate || undefined,
        paymentMethod: bill.paymentMethod || 'bank'
      });
    }
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, [bill]);

  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: BillFormData) => Promise<any>
  ) => {
    if (!validateForm() || !bill) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(bill.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating bill:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update bill'
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, bill]);

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