// src/hooks/VendorCredits/useVendorCreditsEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { VendorCredit, VendorCreditFormData } from '../../types/VendorCredits/VendorCreditsType';
import { 
  validateVendorCredit, 
  validateVendorCreditField,
  validateVendorCreditBusinessRules 
} from '../../validations/vendorCreditsValidation';

export const useVendorCreditsEdit = (credit: VendorCredit | null) => {
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

  useEffect(() => {
    if (credit) {
      setFormData({
        creditDate: credit.creditDate || new Date().toISOString().split('T')[0],
        billId: credit.billId || undefined,
        billNumber: credit.billNumber || undefined,
        vendorId: credit.vendorId || undefined,
        vendorName: credit.vendorName || undefined,
        vendorEmail: credit.vendorEmail || undefined,
        vendorPhone: credit.vendorPhone || undefined,
        vendorGST: credit.vendorGST || undefined,
        amount: credit.amount || 0,
        taxAmount: credit.taxAmount || 0,
        totalAmount: credit.totalAmount || 0,
        reason: credit.reason || 'return',
        status: credit.status || 'draft',
        items: credit.items || [],
        notes: credit.notes || undefined,
        referenceNumber: credit.referenceNumber || undefined,
        usedAmount: credit.usedAmount || 0,
        balanceAmount: credit.balanceAmount || 0,
        expiryDate: credit.expiryDate || undefined,
        currency: credit.currency || 'INR',
        exchangeRate: credit.exchangeRate || 1,
        attachment: credit.attachment || undefined
      });
    }
  }, [credit]);

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

  const handleItemsChange = useCallback((items: any[]) => {
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
      setErrors(prev => { const n = { ...prev }; delete n.items; return n; });
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
    if (credit) {
      setFormData({
        creditDate: credit.creditDate || new Date().toISOString().split('T')[0],
        billId: credit.billId || undefined, billNumber: credit.billNumber || undefined,
        vendorId: credit.vendorId || undefined, vendorName: credit.vendorName || undefined,
        vendorEmail: credit.vendorEmail || undefined, vendorPhone: credit.vendorPhone || undefined,
        vendorGST: credit.vendorGST || undefined, amount: credit.amount || 0,
        taxAmount: credit.taxAmount || 0, totalAmount: credit.totalAmount || 0,
        reason: credit.reason || 'return', status: credit.status || 'draft',
        items: credit.items || [], notes: credit.notes || undefined,
        referenceNumber: credit.referenceNumber || undefined,
        usedAmount: credit.usedAmount || 0, balanceAmount: credit.balanceAmount || 0,
        expiryDate: credit.expiryDate || undefined,
        currency: credit.currency || 'INR', exchangeRate: credit.exchangeRate || 1,
        attachment: credit.attachment || undefined
      });
    }
    setErrors({}); setWarnings([]); setIsSubmitting(false);
  }, [credit]);

  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: VendorCreditFormData) => Promise<any>
  ) => {
    if (!validateForm() || !credit) return false;
    setIsSubmitting(true);
    try { await submitFn(credit.id, formData); return true; }
    catch (error) {
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to update vendor credit' }));
      return false;
    } finally { setIsSubmitting(false); }
  }, [formData, validateForm, credit]);

  return { formData, errors, warnings, isSubmitting, handleChange, handleItemsChange, handleSubmit, validateForm, resetForm, setFormData, setErrors, setWarnings };
};