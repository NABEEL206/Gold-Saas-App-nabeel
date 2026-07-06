// src/hooks/DeliveryChallan/useDeliveryChallanCreate.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  DeliveryChallan, 
  DeliveryChallanItem,
  DeliveryChallanFormData 
} from '../../types/deliveryChallan/DeliveryChallanTypes';
import {
  validateDeliveryChallanForm,
  formatValidationErrors,
  type ValidationResult,
} from '../../validations/deliveryChallan.validation';
import type { ItemSelectionItem } from '../../components/common/ItemSelectionTable';

// Mock customer data
const MOCK_CUSTOMERS = [
  { id: '1', name: 'Rajesh Jewelers', email: 'rajesh@jewelers.com', phone: '+91-98765-43210', gst: '22AAAAA0000A1Z5', address: '123, Jewelry Market, Mumbai, Maharashtra' },
  { id: '2', name: 'Priya Gold House', email: 'priya@goldhouse.com', phone: '+91-98765-43211', gst: '22BBBBB0000B1Z5', address: '45, Gold Street, Chennai, Tamil Nadu' },
  { id: '3', name: 'Suresh Gold Mart', email: 'suresh@goldmart.com', phone: '+91-98765-43212', gst: '22CCCCC0000C1Z5', address: '78, Gold Plaza, Delhi' },
  { id: '4', name: 'Meera Jewel World', email: 'meera@jewelworld.com', phone: '+91-98765-43213', gst: '22DDDDD0000D1Z5', address: '56, Diamond District, Surat, Gujarat' },
];

// Mock products
const MOCK_PRODUCTS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', category: 'Ring', purity: '22K', price: 7500 },
  { id: '2', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 7500 },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 6500 },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500 },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 7000 },
];

// Initial form data
const getInitialFormData = (): DeliveryChallanFormData => ({
  challanNumber: `DC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
  challanDate: new Date().toISOString().split('T')[0],
  deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  customerId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerGst: '',
  customerAddress: '',
  items: [],
  discount: 0,
  discountType: 'fixed',
  shippingCharge: 0,
  otherCharges: 0,
  deliveryAddress: '',
  transporterName: '',
  vehicleNumber: '',
  lrNumber: '',
  lrDate: '',
  paymentTerms: 'Net 15',
  notes: '',
  termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable\n3. Payment terms: 15 days',
});

export const useDeliveryChallanCreate = (existingChallan?: DeliveryChallan) => {
  const [formData, setFormData] = useState<DeliveryChallanFormData>(getInitialFormData);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<typeof MOCK_CUSTOMERS>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_CUSTOMERS[0] | null>(null);
  
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<typeof MOCK_PRODUCTS>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });

  // Convert formData.items to ItemSelectionItem format for validation
  const getItemsForValidation = useCallback((): ItemSelectionItem[] => {
    return formData.items.map((item: any) => ({
      productId: item.productId || '',
      productName: item.productName || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      unit: item.unit || 'Pcs',
      rate: item.rate || 0,
      discount: item.discount || 0,
      discountType: 'percentage' as const,
      taxRate: item.taxRate || 0,
      taxAmount: item.taxAmount || 0,
      total: item.total || 0,
      purity: item.purity || '22K',
    }));
  }, [formData.items]);

  // Load existing data for edit
  useEffect(() => {
    if (existingChallan) {
      setFormData({
        challanNumber: existingChallan.challanNumber,
        challanDate: existingChallan.challanDate,
        deliveryDate: existingChallan.deliveryDate,
        customerId: existingChallan.customerId,
        customerName: existingChallan.customerName,
        customerEmail: existingChallan.customerEmail,
        customerPhone: existingChallan.customerPhone,
        customerGst: existingChallan.customerGst || '',
        customerAddress: existingChallan.customerAddress || '',
        items: existingChallan.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'Pcs',
          rate: item.rate || 0,
          discount: item.discount || 0,
          taxRate: item.taxRate || 0,
          taxAmount: item.taxAmount || 0,
          total: item.total || 0,
          purity: item.purity || '22K',
          weight: item.weight || 0,
          grossWt: item.grossWt || 0,
          stoneWt: item.stoneWt || 0,
          netWt: item.netWt || 0,
          makingCharges: item.makingCharges || 0,
          stoneCharges: item.stoneCharges || 0,
        })),
        discount: existingChallan.discount || 0,
        discountType: existingChallan.discountType || 'fixed',
        shippingCharge: existingChallan.shippingCharge || 0,
        otherCharges: existingChallan.otherCharges || 0,
        deliveryAddress: existingChallan.deliveryAddress || '',
        transporterName: existingChallan.transporterName || '',
        vehicleNumber: existingChallan.vehicleNumber || '',
        lrNumber: existingChallan.lrNumber || '',
        lrDate: existingChallan.lrDate || '',
        paymentTerms: existingChallan.paymentTerms || 'Net 15',
        notes: existingChallan.notes || '',
        termsAndConditions: existingChallan.termsAndConditions || '',
      });
      
      setCustomerSearch(existingChallan.customerName);
      setSelectedCustomer({
        id: existingChallan.customerId,
        name: existingChallan.customerName,
        email: existingChallan.customerEmail,
        phone: existingChallan.customerPhone,
        gst: existingChallan.customerGst || '',
        address: existingChallan.customerAddress || '',
      });
    }
  }, [existingChallan]);

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

  // Search products
  useEffect(() => {
    if (productSearch.length > 0) {
      const filtered = MOCK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase())
      );
      setProductSuggestions(filtered);
      setShowProductDropdown(true);
    } else {
      setProductSuggestions([]);
      setShowProductDropdown(false);
    }
  }, [productSearch]);

  const selectCustomer = useCallback((customer: typeof MOCK_CUSTOMERS[0]) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerGst: customer.gst || '',
      customerAddress: customer.address || '',
      deliveryAddress: customer.address || '',
    }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    // Clear customer errors when selected
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.customerId;
      delete newErrors.customerName;
      return newErrors;
    });
  }, []);

  const addItem = useCallback((product?: typeof MOCK_PRODUCTS[0]) => {
    const newItem: DeliveryChallanItem = {
      productId: product?.id || `temp_${Date.now()}`,
      productName: product?.name || '',
      description: '',
      quantity: 1,
      unit: 'Pcs',
      rate: product?.price || 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      purity: product?.purity || '22K',
      weight: 0,
      grossWt: 0,
      stoneWt: 0,
      netWt: 0,
      makingCharges: 0,
      stoneCharges: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setProductSearch('');
    setShowProductDropdown(false);
    // Clear items error when adding an item
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const updateItem = useCallback((index: number, field: keyof DeliveryChallanItem, value: any) => {
    setFormData(prev => {
      const updatedItems = prev.items.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
    // Clear specific item error when field is updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`item_${index}_${field}`];
      return newErrors;
    });
  }, []);

  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let totalTax = 0;
    
    formData.items.forEach((item) => {
      subtotal += item.total || 0;
      totalTax += item.taxAmount || 0;
    });

    const discountAmount = formData.discountType === 'percentage' 
      ? (subtotal * (formData.discount || 0) / 100)
      : (formData.discount || 0);

    const total = subtotal + totalTax + (formData.shippingCharge || 0) + (formData.otherCharges || 0) - discountAmount;
    
    return { subtotal, totalTax, discountAmount, total };
  }, [formData.items, formData.discount, formData.discountType, formData.shippingCharge, formData.otherCharges]);

  const totals = useMemo(() => calculateTotals(), [calculateTotals]);

  const validateForm = useCallback((): boolean => {
    const items = getItemsForValidation();
    const result = validateDeliveryChallanForm(formData, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, getItemsForValidation]);

  const updateFormData = useCallback((field: keyof DeliveryChallanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return null;
    
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const formDataWithTotals = {
        ...formData,
        subtotal: totals.subtotal,
        taxAmount: totals.totalTax,
        discount: totals.discountAmount,
        total: totals.total,
      };
      
      setSaving(false);
      return formDataWithTotals;
    } catch (error) {
      setErrors({ submit: 'Failed to save delivery challan. Please try again.' });
      setSaving(false);
      throw error;
    }
  }, [formData, totals, validateForm]);

  return {
    formData,
    customerSearch,
    setCustomerSearch,
    customerSuggestions,
    showCustomerDropdown,
    setShowCustomerDropdown,
    selectedCustomer,
    productSearch,
    setProductSearch,
    productSuggestions,
    showProductDropdown,
    setShowProductDropdown,
    errors,
    saving,
    totals,
    validationResult,
    selectCustomer,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    updateFormData,
    validateForm,
  };
};