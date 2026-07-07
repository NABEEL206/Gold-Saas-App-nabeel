// src/hooks/VendorCredits/useVendorCreditsCreate.ts

import { useState, useCallback } from 'react';
import type { VendorCreditFormData, VendorCreditItem } from '../../types/VendorCredits/VendorCreditsType';
import { 
  validateVendorCredit, 
  validateVendorCreditField,
  validateVendorCreditBusinessRules 
} from '../../validations/vendorCreditsValidation';

export const useVendorCreditsCreate = () => {
  const [formData, setFormData] = useState<VendorCreditFormData>({
    creditDate: new Date().toISOString().split('T')[0],
    billId: undefined,
    billNumber: undefined,
    vendorId: undefined,
    vendorName: undefined,
    vendorEmail: undefined,
    vendorPhone: undefined,
    vendorGST: undefined,
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    reason: 'return',
    status: 'draft',
    items: [],
    notes: undefined,
    referenceNumber: undefined,
    usedAmount: 0,
    balanceAmount: 0,
    expiryDate: undefined,
    currency: 'INR',
    exchangeRate: 1,
    attachment: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof VendorCreditFormData, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      const fieldError = validateVendorCreditField(field, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[field] = fieldError;
        else delete newErrors[field];
        return newErrors;
      });
      if (field === 'usedAmount') {
        return { ...newFormData, balanceAmount: newFormData.totalAmount - (value || 0) };
      }
      return newFormData;
    });
  }, []);

  const handleItemsChange = useCallback((items: VendorCreditItem[]) => {
    let subtotal = 0, discountTotal = 0, taxTotal = 0;
    items.forEach(item => {
      const itemTotal = (item.quantity || 0) * (item.rate || 0);
      subtotal += itemTotal;
      const discountAmount = item.discountType === 'fixed' ? (item.discount || 0) : itemTotal * ((item.discount || 0) / 100);
      discountTotal += discountAmount;
      taxTotal += (itemTotal - discountAmount) * ((item.taxRate || 0) / 100);
    });
    const totalAmount = subtotal - discountTotal + taxTotal;
    setFormData(prev => ({
      ...prev, items,
      amount: subtotal - discountTotal,
      taxAmount: taxTotal,
      totalAmount,
      balanceAmount: totalAmount - (prev.usedAmount || 0)
    }));
    if (items.length > 0) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors.items; return newErrors; });
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const { isValid, errors: validationErrors } = validateVendorCredit(formData);
    setErrors(validationErrors);
    if (isValid) setWarnings(validateVendorCreditBusinessRules(formData));
    else setWarnings([]);
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      creditDate: new Date().toISOString().split('T')[0], billId: undefined, billNumber: undefined,
      vendorId: undefined, vendorName: undefined, vendorEmail: undefined, vendorPhone: undefined,
      vendorGST: undefined, amount: 0, taxAmount: 0, totalAmount: 0, reason: 'return',
      status: 'draft', items: [], notes: undefined, referenceNumber: undefined,
      usedAmount: 0, balanceAmount: 0, expiryDate: undefined, currency: 'INR', exchangeRate: 1, attachment: undefined
    });
    setErrors({}); setWarnings([]); setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (submitFn: (data: VendorCreditFormData) => Promise<any>) => {
    if (!validateForm()) return false;
    setIsSubmitting(true);
    try { await submitFn(formData); resetForm(); return true; }
    catch (error) {
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to create vendor credit' }));
      return false;
    } finally { setIsSubmitting(false); }
  }, [formData, validateForm, resetForm]);

  return { formData, errors, warnings, isSubmitting, handleChange, handleItemsChange, handleSubmit, validateForm, resetForm, setFormData, setErrors, setWarnings };
};