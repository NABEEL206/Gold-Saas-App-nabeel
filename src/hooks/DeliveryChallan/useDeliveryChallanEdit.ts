// src/hooks/DeliveryChallan/useDeliveryChallanEdit.ts
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryChallan } from './useDeliveryChallan';
import {
  validateDeliveryChallanForm,
  formatValidationErrors,
  type ValidationResult,
} from '../../validations/deliveryChallan.validation';
import type { 
  DeliveryChallanFormData, 
  DeliveryChallanItem 
} from '../../types/deliveryChallan/DeliveryChallanTypes';

// Mock data for demo
const MOCK_CHALLAN_DATA: Record<string, any> = {
  '1': {
    id: '1',
    challanNumber: 'DC-2024-001',
    challanDate: '2024-01-15',
    deliveryDate: '2024-01-20',
    customerId: 'CUST-001',
    customerName: 'Rajesh Jewelers',
    customerEmail: 'rajesh@jewelers.com',
    customerPhone: '+91-98765-43210',
    customerGst: '22AAAAA0000A1Z5',
    customerAddress: '123, Jewelry Market, Mumbai',
    deliveryAddress: '123, Jewelry Market, Mumbai',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Gold Ring',
        description: '22K Gold Ring with diamond',
        quantity: 2,
        unit: 'Pcs',
        rate: 7500,
        discount: 5,
        taxRate: 18,
        taxAmount: 2565,
        total: 15750,
        purity: '22K',
      },
      {
        id: '2',
        productId: '2',
        productName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 1,
        unit: 'Pcs',
        rate: 4500,
        discount: 0,
        taxRate: 18,
        taxAmount: 810,
        total: 5310,
        purity: '22K',
      },
    ],
    transporterName: 'Fast Logistics',
    vehicleNumber: 'MH-01-AB-1234',
    lrNumber: 'LR-2024-001',
    lrDate: '2024-01-16',
    paymentTerms: 'Net 30',
    notes: 'Please deliver before 5 PM',
    termsAndConditions: 'Goods once sold cannot be returned',
    discount: 500,
    discountType: 'fixed',
    shippingCharge: 100,
    otherCharges: 0,
    subtotal: 21060,
    taxAmount: 3375,
    total: 24035,
    status: 'draft',
  },
  '2': {
    id: '2',
    challanNumber: 'DC-2024-002',
    challanDate: '2024-01-20',
    deliveryDate: '2024-01-25',
    customerId: 'CUST-002',
    customerName: 'Priya Gold House',
    customerEmail: 'priya@goldhouse.com',
    customerPhone: '+91-98765-43211',
    customerGst: '22BBBBB0000B1Z5',
    customerAddress: '45, Gold Street, Chennai',
    deliveryAddress: '45, Gold Street, Chennai',
    items: [
      {
        id: '3',
        productId: '3',
        productName: 'Gold Earrings',
        description: '22K Gold Earrings with pearl',
        quantity: 3,
        unit: 'Pair',
        rate: 3200,
        discount: 10,
        taxRate: 18,
        taxAmount: 1555.2,
        total: 10195.2,
        purity: '22K',
      },
    ],
    transporterName: 'Speed Cargo',
    vehicleNumber: 'MH-02-CD-5678',
    lrNumber: 'LR-2024-002',
    lrDate: '2024-01-21',
    paymentTerms: 'Net 15',
    notes: 'Handle with care',
    termsAndConditions: 'Standard terms apply',
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 50,
    otherCharges: 0,
    subtotal: 9600,
    taxAmount: 1555.2,
    total: 11205.2,
    status: 'sent',
  },
};

// Mock product suggestions
const MOCK_PRODUCTS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', category: 'Ring', purity: '22K', price: 7500, description: '22K Gold Ring with diamond', unit: 'Pcs' },
  { id: '2', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 4500, description: '22K Gold Chain with pendant', unit: 'Pcs' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 3200, description: '22K Gold Earrings with pearl', unit: 'Pair' },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500, description: '18K Diamond Ring with 0.5ct diamond', unit: 'Pcs' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 3800, description: '22K Gold Bracelet with diamonds', unit: 'Pcs' },
  { id: '6', name: 'Silver Necklace', code: 'SN-001', category: 'Necklace', purity: '18K', price: 2800, description: '18K Silver Necklace with chain', unit: 'Pcs' },
];

// Helper to get initial form data
const getInitialFormData = (): DeliveryChallanFormData => ({
  challanNumber: '',
  challanDate: '',
  deliveryDate: '',
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
  paymentTerms: 'Net 30',
  notes: '',
  termsAndConditions: '',
});

export const useDeliveryChallanEdit = (challanId?: string) => {
  const navigate = useNavigate();
  const { getChallan, updateChallan, loading: submitLoading } = useDeliveryChallan();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<DeliveryChallanFormData>(getInitialFormData());
  const [challanStatus, setChallanStatus] = useState<string>('draft');
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions] = useState(MOCK_PRODUCTS);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });

  // Convert formData.items to ItemSelectionItem format for validation
  const getItemsForValidation = useCallback(() => {
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

  // Validate form using the validation file
  const validateForm = useCallback(() => {
    const items = getItemsForValidation();
    const result = validateDeliveryChallanForm(formData, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, getItemsForValidation]);

  // Load challan data
  const loadChallan = useCallback(async (id: string, showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // TODO: Replace with actual API call
      // const data = await getChallan(id);
      
      // Using mock data for demo
      const data = MOCK_CHALLAN_DATA[id];
      
      if (data) {
        setFormData({
          challanNumber: data.challanNumber || '',
          challanDate: data.challanDate || '',
          deliveryDate: data.deliveryDate || '',
          customerId: data.customerId || '',
          customerName: data.customerName || '',
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone || '',
          customerGst: data.customerGst || '',
          customerAddress: data.customerAddress || '',
          items: data.items || [],
          discount: data.discount || 0,
          discountType: data.discountType || 'fixed',
          shippingCharge: data.shippingCharge || 0,
          otherCharges: data.otherCharges || 0,
          deliveryAddress: data.deliveryAddress || '',
          transporterName: data.transporterName || '',
          vehicleNumber: data.vehicleNumber || '',
          lrNumber: data.lrNumber || '',
          lrDate: data.lrDate || '',
          paymentTerms: data.paymentTerms || 'Net 30',
          notes: data.notes || '',
          termsAndConditions: data.termsAndConditions || '',
        });
        setChallanStatus(data.status || 'draft');
        setErrors({});
        setValidationResult({
          isValid: true,
          errors: {},
          itemErrors: [],
        });
      } else {
        // If no data found, navigate back
        navigate('/sales/delivery-challan');
      }
    } catch (error) {
      console.error('Failed to load challan:', error);
      setErrors({ load: 'Failed to load challan data. Please try again.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  // Initial load
  useEffect(() => {
    if (challanId) {
      loadChallan(challanId);
    }
  }, [challanId, loadChallan]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (challanId) {
      loadChallan(challanId, true);
    }
  }, [challanId, loadChallan]);

  // Update form field
  const updateFormData = useCallback((field: keyof DeliveryChallanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Update item
  const updateItem = useCallback((index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      
      // Recalculate totals for this item
      const item = updatedItems[index];
      const itemTotal = (item.quantity || 1) * (item.rate || 0);
      let discountAmount = 0;
      if (formData.discountType === 'fixed') {
        discountAmount = item.discount || 0;
      } else {
        discountAmount = itemTotal * ((item.discount || 0) / 100);
      }
      const taxableAmount = itemTotal - discountAmount;
      const taxAmount = taxableAmount * ((item.taxRate || 0) / 100);
      item.total = taxableAmount + taxAmount;
      item.taxAmount = taxAmount;
      
      return { ...prev, items: updatedItems };
    });
    // Clear specific item error when field is updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`item_${index}_${field}`];
      return newErrors;
    });
  }, [formData.discountType]);

  // Add item
  const addItem = useCallback((product?: any) => {
    const newItem: DeliveryChallanItem = {
      productId: product?.id || `custom_${Date.now()}`,
      productName: product?.name || '',
      description: product?.description || '',
      quantity: 1,
      unit: product?.unit || 'Pcs',
      rate: product?.price || 0,
      discount: 0,
      taxRate: 18,
      taxAmount: 0,
      total: 0,
      purity: product?.purity || '22K',
    };
    
    // Calculate initial total
    const itemTotal = (newItem.quantity || 1) * (newItem.rate || 0);
    const taxAmount = itemTotal * ((newItem.taxRate || 0) / 100);
    newItem.total = itemTotal + taxAmount;
    newItem.taxAmount = taxAmount;
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    // Clear items error when adding an item
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  }, []);

  // Remove item
  const removeItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let totalTax = 0;
    let discountAmount = 0;

    formData.items.forEach((item) => {
      const itemTotal = (item.quantity || 1) * (item.rate || 0);
      subtotal += itemTotal;
      
      let itemDiscount = 0;
      if (formData.discountType === 'fixed') {
        itemDiscount = item.discount || 0;
      } else {
        itemDiscount = itemTotal * ((item.discount || 0) / 100);
      }
      discountAmount += itemDiscount;
      
      const taxableAmount = itemTotal - itemDiscount;
      totalTax += taxableAmount * ((item.taxRate || 0) / 100);
    });

    const total = subtotal - discountAmount + totalTax + 
                  (formData.shippingCharge || 0) + (formData.otherCharges || 0);
    
    return { subtotal, totalTax, discountAmount, total };
  }, [formData.items, formData.discountType, formData.shippingCharge, formData.otherCharges]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!challanId) {
      setErrors({ submit: 'Invalid challan ID' });
      return null;
    }

    if (!validateForm()) {
      return null;
    }

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // await updateChallan(challanId, formData);
      
      console.log('Updated delivery challan:', {
        id: challanId,
        ...formData,
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data after successful save
      await loadChallan(challanId);
      
      return formData;
    } catch (error) {
      console.error('Error updating delivery challan:', error);
      setErrors({ submit: 'Failed to update challan. Please try again.' });
      return null;
    } finally {
      setSaving(false);
    }
  }, [challanId, formData, validateForm, loadChallan]);

  // Check if editable
  const isEditable = challanStatus === 'draft';

  return {
    // State
    formData,
    errors,
    loading,
    refreshing,
    saving,
    submitLoading,
    productSearch,
    productSuggestions,
    challanStatus,
    isEditable,
    totals: calculateTotals(),
    validationResult,
    
    // Actions
    updateFormData,
    updateItem,
    addItem,
    removeItem,
    handleSubmit,
    handleRefresh,
    setProductSearch,
    validateForm,
  };
};