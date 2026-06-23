// src/hooks/Invoices/useInvoiceCreate.ts
import { useState, useEffect } from 'react';
import type { InvoiceItemFormData } from '../../types/Invoice/InvoiceTypes';
import type { CustomerSuggestion, ItemSuggestion } from '../../types/Invoice/InvoiceTypes';

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

export const useInvoiceCreate = () => {
  const [formData, setFormData] = useState<any>({
    invoiceNo: `INV-${String(Math.floor(Math.random() * 900000) + 100000)}`,
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 0,
    otherCharges: 0,
    notes: 'Thank you for your business.',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable\n3. Payment terms: 15 days',
    paymentTerms: 'Net 15',
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
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    
    formData.items.forEach((item: any) => {
      const itemTotal = item.quantity * item.rate;
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
    
    formData.items.forEach((item: any, index: number) => {
      if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity is required';
      if (item.rate <= 0) newErrors[`item_${index}_rate`] = 'Rate is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (navigate: any) => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      setSaving(false);
      return formData;
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
  };
};