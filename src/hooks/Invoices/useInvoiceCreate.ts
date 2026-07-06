// src/hooks/Invoices/useInvoiceCreate.ts
import { useState, useEffect, useMemo } from 'react';
import type { InvoiceItemFormData } from '../../types/Invoice/InvoiceTypes';
import type { CustomerSuggestion, ItemSuggestion } from '../../types/Invoice/InvoiceTypes';
import {
  validateInvoiceItems,
  validateOldGoldItems,
  type ValidationResult,
} from '../../validations/invoice.validation';

const calculateItemTotals = (item: InvoiceItemFormData) => {
  const quantity = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const makingCharges = Number(item.makingCharges) || 0;
  const stoneCharges = Number(item.stoneCharges) || 0;
  const baseAmount = quantity * rate + makingCharges + stoneCharges;
  const discountAmount = Number(item.discount) || 0;
  const taxableAmount = Math.max(baseAmount - discountAmount, 0);
  const taxAmount = (taxableAmount * (Number(item.taxRate) || 0)) / 100;
  const total = taxableAmount + taxAmount;

  return {
    baseAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
  };
};

const getInvoiceSummary = (items: InvoiceItemFormData[], oldGoldItems: any[]) => {
  const itemCount = items.length;
  const oldGoldItemCount = oldGoldItems?.length || 0;
  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + calculateItemTotals(item).total, 0);

  return {
    itemCount,
    oldGoldItemCount,
    totalWeight,
    totalAmount,
  };
};

const calculateInvoiceTotals = (
  items: InvoiceItemFormData[],
  oldGoldItems: any[],
  additionalCharges: any[],
  discount: number,
  discountType: string
) => {
  const itemTotals = items.map(calculateItemTotals);
  const subtotal = itemTotals.reduce((sum, item) => sum + item.baseAmount, 0);
  const totalItemDiscount = itemTotals.reduce((sum, item) => sum + item.discountAmount, 0);
  const taxAmount = itemTotals.reduce((sum, item) => sum + item.taxAmount, 0);
  const additionalChargesTotal = additionalCharges?.reduce((sum, charge) => {
    const amount = Number(charge?.amount ?? charge?.value ?? 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0) || 0;
  const oldGoldTotal = oldGoldItems?.reduce((sum, goldItem) => sum + Number(goldItem?.amount ?? 0), 0) || 0;

  const subtotalBeforeGlobalDiscount = subtotal - totalItemDiscount + taxAmount + additionalChargesTotal + oldGoldTotal;
  const globalDiscountAmount = discountType === 'percentage'
    ? (subtotalBeforeGlobalDiscount * (discount || 0)) / 100
    : Number(discount || 0);

  const grandTotal = Math.max(subtotalBeforeGlobalDiscount - globalDiscountAmount, 0);
  const netTotal = grandTotal;

  return {
    subtotal,
    totalDiscount: totalItemDiscount + globalDiscountAmount,
    taxAmount,
    oldGoldTotal,
    additionalChargesTotal,
    grandTotal,
    netTotal,
  };
};

// Mock data
const MOCK_CUSTOMERS: CustomerSuggestion[] = [
  { id: '1', name: 'Rajesh Jewelers', email: 'rajesh@jewelers.com', phone: '9876543210', gst: '22AAAAA0000A1Z5' },
  { id: '2', name: 'Priya Gold House', email: 'priya@goldhouse.com', phone: '9876543211' },
  { id: '3', name: 'Suresh Gold Mart', email: 'suresh@goldmart.com', phone: '9876543212' },
  { id: '4', name: 'Meera Jewel World', email: 'meera@jewelworld.com', phone: '9876543213' },
];

const MOCK_ITEMS: ItemSuggestion[] = [
  { id: '1', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 4500 },
  { id: '2', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500 },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 3200 },
  { id: '4', name: 'Silver Necklace', code: 'SN-001', category: 'Necklace', purity: '18K', price: 2800 },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 3800 },
];

// Types for the hook
interface UseInvoiceCreateReturn {
  formData: any;
  customerSearch: string;
  setCustomerSearch: (value: string) => void;
  customerSuggestions: CustomerSuggestion[];
  showCustomerDropdown: boolean;
  setShowCustomerDropdown: (value: boolean) => void;
  selectedCustomer: CustomerSuggestion | null;
  itemSearch: string;
  setItemSearch: (value: string) => void;
  itemSuggestions: ItemSuggestion[];
  showItemDropdown: boolean;
  setShowItemDropdown: (value: boolean) => void;
  errors: Record<string, string>;
  saving: boolean;
  selectedTax: string;
  setSelectedTax: (value: string) => void;
  files: File[];
  totals: ReturnType<typeof calculateInvoiceTotals>;
  selectCustomer: (customer: CustomerSuggestion) => void;
  addItem: (item?: ItemSuggestion) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: keyof InvoiceItemFormData, value: any) => void;
  handleSubmit: (navigate: any) => Promise<any>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  updateFormData: (field: string, value: any) => void;
  validateForm: () => boolean;
  summary: ReturnType<typeof getInvoiceSummary>;
  validationResult: ValidationResult;
  clearErrors: () => void;
}

export const useInvoiceCreate = (): UseInvoiceCreateReturn => {
  const [formData, setFormData] = useState<any>({
    invoiceNo: `INV-${String(Math.floor(Math.random() * 900000) + 100000)}`,
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    oldGoldItems: [],
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 0,
    otherCharges: 0,
    notes: 'Thank you for your business.',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable\n3. Payment terms: 15 days',
    paymentTerms: 'Net 15',
    additionalCharges: [],
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
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
    oldGoldErrors: [],
  });

  // Calculate totals using the utility
  const totals = useMemo(() => {
    return calculateInvoiceTotals(
      formData.items || [],
      formData.oldGoldItems || [],
      formData.additionalCharges || [],
      formData.discount || 0,
      formData.discountType || 'percentage'
    );
  }, [formData.items, formData.oldGoldItems, formData.additionalCharges, formData.discount, formData.discountType]);

  // Get invoice summary
  const summary = useMemo(() => {
    return getInvoiceSummary(formData.items || [], formData.oldGoldItems || []);
  }, [formData.items, formData.oldGoldItems]);

  // Search customers
  useEffect(() => {
    if (customerSearch.length > 0) {
      const filtered = MOCK_CUSTOMERS.filter((c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
      );
      setCustomerSuggestions(filtered);
      setShowCustomerDropdown(true);
    } else {
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch]);

  // Search items
  useEffect(() => {
    if (itemSearch.length > 0) {
      const filtered = MOCK_ITEMS.filter((item) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(itemSearch.toLowerCase())
      );
      setItemSuggestions(filtered);
      setShowItemDropdown(true);
    } else {
      setItemSuggestions([]);
      setShowItemDropdown(false);
    }
  }, [itemSearch]);

  const selectCustomer = (customer: CustomerSuggestion) => {
    setSelectedCustomer(customer);
    setFormData((prev: any) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
    }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    // Clear customer error when selected
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.customerId;
      delete newErrors.customerName;
      return newErrors;
    });
  };

  const addItem = (item?: ItemSuggestion) => {
    const newItem: InvoiceItemFormData = {
      itemId: item?.id || `temp_${Date.now()}`,
      itemName: item?.name || '',
      description: '',
      quantity: 1,
      rate: item?.price || 0,
      discount: 0,
      taxRate: 18,
      purity: item?.purity || '22K',
      category: item?.category || 'Others',
      weight: 0,
      makingCharges: 0,
      wastagePercentage: 0,
      stoneCharges: 0,
    };
    setFormData((prev: any) => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setItemSearch('');
    setShowItemDropdown(false);
    // Clear items error when adding an item
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  };

  const removeItem = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItemFormData, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any, i: number) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
    // Clear specific item error when field is updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`item_${index}_${field}`];
      return newErrors;
    });
  };

  const clearErrors = () => {
    setErrors({});
    setValidationResult({
      isValid: true,
      errors: {},
      itemErrors: [],
      oldGoldErrors: [],
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // ─── 1. Validate Customer ───
    if (!formData.customerId || formData.customerId.trim() === '') {
      newErrors.customerId = 'Customer is required';
    }
    if (!formData.customerName || formData.customerName.trim() === '') {
      newErrors.customerName = 'Customer name is required';
    }
    
    // ─── 2. Validate Date ───
    if (!formData.date || formData.date.trim() === '') {
      newErrors.date = 'Invoice date is required';
    }
    
    // ─── 3. Validate Items ───
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    
    // ─── 4. Validate each item ───
    const itemValidation = validateInvoiceItems(formData.items || []);
    itemValidation.itemErrors.forEach((err) => {
      newErrors[`item_${err.index}_${err.field}`] = err.message;
    });

    // ─── 5. Validate Old Gold Items ───
    const oldGoldValidation = validateOldGoldItems(formData.oldGoldItems || []);
    oldGoldValidation.oldGoldErrors.forEach((err) => {
      newErrors[`oldGold_${err.index}_${err.field}`] = err.message;
    });

    // Update validation result
    setValidationResult({
      isValid: Object.keys(newErrors).length === 0,
      errors: {},
      itemErrors: itemValidation.itemErrors,
      oldGoldErrors: oldGoldValidation.oldGoldErrors,
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (navigate: any) => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Prepare invoice data with calculated totals
      const invoiceData = {
        ...formData,
        totals: {
          subtotal: totals.subtotal,
          totalDiscount: totals.totalDiscount,
          taxAmount: totals.taxAmount,
          oldGoldTotal: totals.oldGoldTotal,
          grandTotal: totals.grandTotal,
          netTotal: totals.netTotal,
        },
        summary,
      };
      
      setSaving(false);
      return invoiceData;
    } catch (error) {
      setErrors({ submit: 'Failed to create invoice. Please try again.' });
      setSaving(false);
      throw error;
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

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error for this field when updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return {
    formData,
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
    summary,
    validationResult,
    clearErrors,
  };
};