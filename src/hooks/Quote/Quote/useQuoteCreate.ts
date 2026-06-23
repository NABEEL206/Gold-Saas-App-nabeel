// src/hooks/Quote/useQuoteCreate.ts
import { useState, useEffect } from 'react';
import { useQuotes } from './useQuotes';
import type { QuoteFormData, QuoteItemFormData, CustomerSuggestion, ItemSuggestion } from '../../../types/Quote/QuoteTypes';

export const useQuoteCreate = () => {
  const { createQuote, getCustomers, getItems } = useQuotes();

  const [formData, setFormData] = useState<QuoteFormData>({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 0,
    otherCharges: 0,
    notes: 'Looking forward for your business.',
    termsAndConditions: '',
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSuggestion | null>(null);

  const [itemSearch, setItemSearch] = useState('');
  const [itemSuggestions, setItemSuggestions] = useState<ItemSuggestion[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedTax, setSelectedTax] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // Search customers
  useEffect(() => {
    if (customerSearch.length > 1) {
      getCustomers(customerSearch).then(setCustomerSuggestions);
      setShowCustomerDropdown(true);
    } else {
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch, getCustomers]);

  // Search items
  useEffect(() => {
    if (itemSearch.length > 1) {
      getItems(itemSearch).then(setItemSuggestions);
      setShowItemDropdown(true);
    } else {
      setItemSuggestions([]);
      setShowItemDropdown(false);
    }
  }, [itemSearch, getItems]);

  const selectCustomer = (customer: CustomerSuggestion) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const addItem = (item?: ItemSuggestion) => {
    const newItem: QuoteItemFormData = {
      itemId: item?.id || `temp_${Date.now()}`,
      itemName: item?.name || '',
      category: item?.category || 'Others',
      purity: item?.purity || '22K',
      weight: 0,
      makingCharges: 0,
      wastagePercentage: 0,
      stoneCharges: 0,
      quantity: 1,
      unitPrice: item?.price || 0,
      taxRate: 3,
      discount: 0,
      description: '',
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setItemSearch('');
    setShowItemDropdown(false);
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof QuoteItemFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    
    formData.items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      totalTax += itemTotal * (item.taxRate / 100);
    });

    const discountAmount = formData.discountType === 'percentage' 
      ? (subtotal * formData.discount / 100)
      : formData.discount;

    const total = subtotal + totalTax + formData.shippingCharge + formData.otherCharges - discountAmount;
    
    return { subtotal, totalTax, discountAmount, total };
  };

  const totals = calculateTotals();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    
    formData.items.forEach((item, index) => {
      if (item.weight <= 0) newErrors[`item_${index}_weight`] = 'Weight is required';
      if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity is required';
      if (item.unitPrice <= 0) newErrors[`item_${index}_unitPrice`] = 'Price is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (navigate: any) => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await createQuote(formData);
      navigate('/sales/quotes');
    } catch (error) {
      setErrors({ submit: 'Failed to create quote. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length <= 5) {
        setFiles([...files, ...newFiles]);
      } else {
        alert('You can upload a maximum of 5 files');
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const updateFormData = (field: keyof QuoteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    setFormData,
    customerSearch,
    setCustomerSearch,
    customerSuggestions,
    showCustomerDropdown,
    setShowCustomerDropdown,
    selectedCustomer,
    itemSearch,
    setItemSearch,
    itemSuggestions,
    showItemDropdown,
    setShowItemDropdown,
    errors,
    saving,
    selectedTax,
    setSelectedTax,
    files,
    totals,
    selectCustomer,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    handleFileUpload,
    removeFile,
    updateFormData,
    validateForm,
  };
};