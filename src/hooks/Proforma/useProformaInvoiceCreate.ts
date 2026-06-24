import { useState, useCallback, useEffect } from 'react';
import type { 
  ProformaInvoice, 
  ProformaInvoiceFormData, 
  ProformaInvoiceItem 
} from '../../types/proforma/ProformaInvoiceType';

// Mock data for suggestions
const MOCK_CUSTOMERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+91-9876543210', address: '123 Main St, Mumbai' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+91-9876543211', address: '456 Oak Ave, Delhi' },
  { id: '3', name: 'ABC Corporation', email: 'info@abccorp.com', phone: '+91-9876543212', address: '789 Business Blvd, Bangalore' },
];

const MOCK_ITEMS = [
  { id: '1', name: 'Gold Chain', code: 'GC-001', category: 'Chain', price: 5000 },
  { id: '2', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', price: 15000 },
  { id: '3', name: 'Silver Bracelet', code: 'SB-001', category: 'Bracelet', price: 3000 },
];

// GST Options
const GST_OPTIONS = [
  { value: 'gst_0', label: 'GST 0%', rate: 0 },
  { value: 'gst_5', label: 'GST 5%', rate: 5 },
  { value: 'gst_12', label: 'GST 12%', rate: 12 },
  { value: 'gst_18', label: 'GST 18%', rate: 18 },
  { value: 'gst_28', label: 'GST 28%', rate: 28 },
];

interface UseProformaInvoiceCreateReturn {
  formData: ProformaInvoiceFormData;
  customerSearch: string;
  setCustomerSearch: (value: string) => void;
  customerSuggestions: typeof MOCK_CUSTOMERS;
  showCustomerDropdown: boolean;
  setShowCustomerDropdown: (value: boolean) => void;
  selectedCustomer: typeof MOCK_CUSTOMERS[0] | null;
  itemSearch: string;
  setItemSearch: (value: string) => void;
  itemSuggestions: typeof MOCK_ITEMS;
  showItemDropdown: boolean;
  setShowItemDropdown: (value: boolean) => void;
  errors: Record<string, string>;
  saving: boolean;
  selectedGST: string;
  setSelectedGST: (value: string) => void;
  files: File[];
  totals: {
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
  };
  selectCustomer: (customer: typeof MOCK_CUSTOMERS[0]) => void;
  addItem: (item?: typeof MOCK_ITEMS[0]) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: string, value: any) => void;
  handleSubmit: (navigate: any) => Promise<boolean>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  updateFormData: (field: string, value: any) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

export const useProformaInvoiceCreate = (): UseProformaInvoiceCreateReturn => {
  const [formData, setFormData] = useState<ProformaInvoiceFormData>({
    invoiceNumber: `PI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    currency: 'INR',
    paymentTerms: 'Net 30',
    deliveryTerms: 'FOB Shipping Point',
    notes: '',
    termsAndConditions: 'Standard terms apply',
    status: 'draft',
    discount: 0,
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState(MOCK_CUSTOMERS);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_CUSTOMERS[0] | null>(null);

  const [itemSearch, setItemSearch] = useState('');
  const [itemSuggestions, setItemSuggestions] = useState(MOCK_ITEMS);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedGST, setSelectedGST] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch.trim()) {
      const filtered = MOCK_CUSTOMERS.filter(c => 
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
      );
      setCustomerSuggestions(filtered);
      setShowCustomerDropdown(filtered.length > 0);
    } else {
      setCustomerSuggestions(MOCK_CUSTOMERS);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch]);

  // Filter items based on search
  useEffect(() => {
    if (itemSearch.trim()) {
      const filtered = MOCK_ITEMS.filter(i => 
        i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        i.code.toLowerCase().includes(itemSearch.toLowerCase()) ||
        i.category.toLowerCase().includes(itemSearch.toLowerCase())
      );
      setItemSuggestions(filtered);
      setShowItemDropdown(filtered.length > 0);
    } else {
      setItemSuggestions(MOCK_ITEMS);
      setShowItemDropdown(false);
    }
  }, [itemSearch]);

  // Get GST rate
  const getGSTRate = useCallback(() => {
    const gst = GST_OPTIONS.find(g => g.value === selectedGST);
    return gst ? gst.rate : 0;
  }, [selectedGST]);

  const calculateTotals = useCallback((items: ProformaInvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discount / 100)), 0);
    const taxRate = getGSTRate();
    const taxTotal = (subtotal - discountTotal) * (taxRate / 100);
    const grandTotal = subtotal - discountTotal + taxTotal;
    return { subtotal, discountTotal, taxTotal, grandTotal };
  }, [getGSTRate]);

  const totals = calculateTotals(formData.items);

  const selectCustomer = useCallback((customer: typeof MOCK_CUSTOMERS[0]) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address || '',
    }));
    if (errors.customerId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customerId;
        return newErrors;
      });
    }
  }, [errors]);

  const addItem = useCallback((item?: typeof MOCK_ITEMS[0]) => {
    if (item) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          id: Date.now().toString(),
          productId: item.id,
          productName: item.name,
          description: '',
          quantity: 1,
          unitPrice: item.price,
          discount: 0,
          taxRate: 0,
          total: item.price,
        }],
      }));
      setItemSearch('');
      setShowItemDropdown(false);
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          id: Date.now().toString(),
          productId: '',
          productName: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: 0,
          total: 0,
        }],
      }));
    }
    if (errors.items) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  }, [errors]);

  const removeItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const updateItem = useCallback((index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      const item = newItems[index];
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discount / 100);
      const taxRate = getGSTRate();
      const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
      item.total = subtotal - discountAmount + taxAmount;
      
      if (errors[`item_${index}_${field}`]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`item_${index}_${field}`];
          return newErrors;
        });
      }
      
      return { ...prev, items: newItems };
    });
  }, [errors, getGSTRate]);

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const newFiles = Array.from(fileList);
      const oversizedFiles = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setErrors(prev => ({ ...prev, files: 'Some files exceed the 10MB limit' }));
        return;
      }
      if (files.length + newFiles.length > 5) {
        setErrors(prev => ({ ...prev, files: 'Maximum 5 files allowed' }));
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
      if (errors.files) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.files;
          return newErrors;
        });
      }
    }
  }, [files, errors]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedCustomer && !formData.customerName) {
      newErrors.customerId = 'Please select a customer';
    }
    if (!formData.invoiceDate) {
      newErrors.date = 'Invoice date is required';
    }
    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }
    if (formData.invoiceDate && formData.validUntil && formData.validUntil < formData.invoiceDate) {
      newErrors.validUntil = 'Valid until date must be after invoice date';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    formData.items.forEach((item, index) => {
      if (!item.productName) {
        newErrors[`item_${index}_name`] = 'Item name is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_rate`] = 'Rate must be greater than 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedCustomer, formData]);

  const handleSubmit = useCallback(async (navigate: any) => {
    if (!validateForm()) {
      return false;
    }

    setSaving(true);
    setErrors({});
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const submissionData: ProformaInvoiceFormData = {
        ...formData,
        customerId: selectedCustomer?.id || formData.customerId,
        customerName: selectedCustomer?.name || formData.customerName,
        customerEmail: selectedCustomer?.email || formData.customerEmail,
        customerPhone: selectedCustomer?.phone || formData.customerPhone,
        customerAddress: selectedCustomer?.address || formData.customerAddress,
      };
      
      console.log('Submitting Proforma Invoice:', {
        data: submissionData,
        totals: totals,
        gst: selectedGST,
        files: files,
      });
      
      setSaving(false);
      return true;
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create proforma invoice. Please try again.' 
      });
      setSaving(false);
      return false;
    }
  }, [formData, selectedCustomer, selectedGST, files, totals, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({
      invoiceNumber: `PI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      currency: 'INR',
      paymentTerms: 'Net 30',
      deliveryTerms: 'FOB Shipping Point',
      notes: '',
      termsAndConditions: 'Standard terms apply',
      status: 'draft',
      discount: 0,
    });
    setCustomerSearch('');
    setSelectedCustomer(null);
    setItemSearch('');
    setFiles([]);
    setSelectedGST('');
    setErrors({});
  }, []);

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
    selectedGST,
    setSelectedGST,
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
    resetForm,
    validateForm,
  };
};