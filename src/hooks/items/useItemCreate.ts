// src/hooks/items/useItemCreate.ts
import { useState, useCallback, useRef } from 'react';
import type { ItemFormData } from '../../types/items/Itemstype';

// Dynamic Data based on selections
export const itemTypeData = {
  Gold: {
    categories: ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Chain', 'Pendant', 'Bangle', 'Bar'],
    metalTypes: ['Gold'],
    purities: ['24K', '22K', '18K', '14K', '10K'],
    units: ['g', 'kg', 'oz'],
  },
  Silver: {
    categories: ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Chain', 'Pendant', 'Bangle', 'Coin'],
    metalTypes: ['Silver'],
    purities: ['925', '950', '999'],
    units: ['g', 'kg', 'oz'],
  },
  Diamond: {
    categories: ['Ring', 'Earrings', 'Pendant', 'Necklace', 'Bracelet'],
    metalTypes: ['Gold', 'Silver', 'Platinum'],
    purities: ['18K', '14K', '10K'],
    units: ['ct', 'g'],
  },
  Platinum: {
    categories: ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Chain'],
    metalTypes: ['Platinum'],
    purities: ['950', '900', '850'],
    units: ['g', 'kg', 'oz'],
  },
  Other: {
    categories: ['Accessories', 'Custom', 'Special'],
    metalTypes: ['Gold', 'Silver', 'Platinum', 'Other'],
    purities: ['24K', '22K', '18K', '925', '950'],
    units: ['g', 'kg', 'oz', 'pcs'],
  },
};

// Gold rate data (mock)
export const goldRates = {
  '24K': 15142,
  '22K': 13875,
  '18K': 11465,
  '14K': 8920,
  '10K': 6370,
  '925': 85,
  '950': 87,
  '999': 89,
};

export const categoryPrefixes = {
  Ring: 'RNG',
  Necklace: 'NCK',
  Earrings: 'EAR',
  Bracelet: 'BRL',
  Chain: 'CHN',
  Pendant: 'PND',
  Bangle: 'BNG',
  Bar: 'BAR',
  Coin: 'COI',
  Accessories: 'ACC',
  Custom: 'CUS',
  Special: 'SPC',
};

const hsnCodes = {
  Ring: '7113.19',
  Necklace: '7113.19',
  Earrings: '7113.19',
  Bracelet: '7113.19',
  Chain: '7113.19',
  Pendant: '7113.19',
  Bangle: '7113.19',
  Bar: '7108.12',
  Coin: '7118.90',
  Accessories: '7117.19',
  Custom: '7113.19',
  Special: '7113.19',
};

export interface ExtendedItemFormData extends ItemFormData {
  currency: string;
  mrp: string;
  description: string;
}

export const useItemCreate = () => {
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'basic', 'metal', 'weight', 'diamond', 'pricing', 'sales', 'inventory', 'tracking', 'images'
  ]);
  
  // Sales Information state
  const [showSalesInfo, setShowSalesInfo] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showMRP, setShowMRP] = useState(false);

  const [formData, setFormData] = useState<ExtendedItemFormData>({
    itemCode: '',
    itemName: '',
    itemType: '',
    category: '',
    brand: '',
    designCode: '',
    metalType: '',
    purity: '',
    grossWeight: '',
    stoneWeight: '',
    netWeight: '',
    unit: 'g',
    diamondPieces: '',
    caratWeight: '',
    mcType: 'fixed',
    mcValue: '',
    goldRate: '',
    sellingPrice: '',
    currency: 'INR',
    mrp: '',
    description: '',
    openingStock: '',
    reorderLevel: '',
    hsnCode: '',
    gstPercentage: '18',
    tagNumber: '',
    barcode: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExtendedItemFormData, string>>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Use refs to track if auto-generation should happen
  const isAutoGenerating = useRef(false);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const toggleSalesInfo = useCallback(() => {
    setShowSalesInfo(prev => !prev);
    if (!showSalesInfo) {
      setShowDescription(true);
      setShowMRP(true);
    }
  }, [showSalesInfo]);

  const getCategories = useCallback(() => {
    if (!formData.itemType) return [];
    return itemTypeData[formData.itemType as keyof typeof itemTypeData]?.categories || [];
  }, [formData.itemType]);

  const getMetalTypes = useCallback(() => {
    if (!formData.itemType) return ['Gold', 'Silver', 'Platinum', 'Other'];
    return itemTypeData[formData.itemType as keyof typeof itemTypeData]?.metalTypes || ['Gold', 'Silver', 'Platinum', 'Other'];
  }, [formData.itemType]);

  const getPurities = useCallback(() => {
    if (!formData.metalType) return ['24K', '22K', '18K', '14K', '10K'];
    return itemTypeData[formData.itemType as keyof typeof itemTypeData]?.purities || ['24K', '22K', '18K', '14K', '10K'];
  }, [formData.itemType, formData.metalType]);

  const getUnits = useCallback(() => {
    if (!formData.itemType) return ['g', 'kg', 'oz', 'ct'];
    return itemTypeData[formData.itemType as keyof typeof itemTypeData]?.units || ['g', 'kg', 'oz', 'ct'];
  }, [formData.itemType]);

  const generateItemCode = useCallback((category: string) => {
    if (!category) return '';
    const prefix = categoryPrefixes[category as keyof typeof categoryPrefixes] || 'GEN';
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${randomNum}`;
  }, []);

  const getGoldRate = useCallback((purity: string) => {
    return goldRates[purity as keyof typeof goldRates] || 0;
  }, []);

  const calculateSellingPrice = useCallback(() => {
    const goldRate = parseFloat(formData.goldRate) || 0;
    const netWeight = parseFloat(formData.netWeight) || 0;
    const mcValue = parseFloat(formData.mcValue) || 0;
    const mcType = formData.mcType;

    if (goldRate && netWeight) {
      let basePrice = goldRate * netWeight;
      
      if (mcType === 'fixed') {
        basePrice += mcValue;
      } else if (mcType === 'percentage') {
        basePrice += (basePrice * mcValue) / 100;
      }
      
      return Math.round(basePrice * 100) / 100;
    }
    return 0;
  }, [formData.goldRate, formData.netWeight, formData.mcValue, formData.mcType]);

  const getHsnCode = useCallback((category: string) => {
    return hsnCodes[category as keyof typeof hsnCodes] || '7113.19';
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Prevent auto-generation loops
    if (isAutoGenerating.current) {
      isAutoGenerating.current = false;
      return;
    }

    // Update the specific field
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate Item Code when Category is selected
      if (name === 'category' && value) {
        updated.itemCode = generateItemCode(value);
        updated.hsnCode = getHsnCode(value);
      }
      
      // Auto-fill Gold Rate when Purity is selected
      if (name === 'purity' && value) {
        updated.goldRate = getGoldRate(value).toString();
      }
      
      // Recalculate Selling Price when related fields change
      if (['goldRate', 'netWeight', 'mcValue', 'mcType'].includes(name)) {
        const sellingPrice = calculateSellingPrice();
        if (sellingPrice > 0) {
          updated.sellingPrice = sellingPrice.toString();
        }
      }
      
      // Auto-generate Item Name
      if (name === 'itemType' || name === 'category') {
        if (updated.itemType && updated.category) {
          const purity = updated.purity || '';
          const metal = updated.metalType || '';
          const category = updated.category || '';
          const generatedName = `${purity} ${metal} ${category}`.trim();
          if (generatedName && !prev.itemName) {
            updated.itemName = generatedName;
          }
        }
      }
      
      return updated;
    });
    
    // Clear error for this field
    if (errors[name as keyof ExtendedItemFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [generateItemCode, getHsnCode, getGoldRate, calculateSellingPrice, errors]);

  const handleManualChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ExtendedItemFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...files]);
    setImageUrls(prev => [...prev, ...newImageUrls]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof ExtendedItemFormData, string>> = {};
    
    if (!formData.itemCode) newErrors.itemCode = 'Item Code is required';
    if (!formData.itemName) newErrors.itemName = 'Item Name is required';
    if (!formData.itemType) newErrors.itemType = 'Item Type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.metalType) newErrors.metalType = 'Metal Type is required';
    if (!formData.purity) newErrors.purity = 'Purity/Karat is required';
    if (!formData.grossWeight || parseFloat(formData.grossWeight) <= 0) {
      newErrors.grossWeight = 'Gross Weight must be greater than 0';
    }
    if (!formData.netWeight || parseFloat(formData.netWeight) <= 0) {
      newErrors.netWeight = 'Net Weight must be greater than 0';
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Selling Price must be greater than 0';
    }
    if (!formData.hsnCode) newErrors.hsnCode = 'HSN Code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      itemCode: '',
      itemName: '',
      itemType: '',
      category: '',
      brand: '',
      designCode: '',
      metalType: '',
      purity: '',
      grossWeight: '',
      stoneWeight: '',
      netWeight: '',
      unit: 'g',
      diamondPieces: '',
      caratWeight: '',
      mcType: 'fixed',
      mcValue: '',
      goldRate: '',
      sellingPrice: '',
      currency: 'INR',
      mrp: '',
      description: '',
      openingStock: '',
      reorderLevel: '',
      hsnCode: '',
      gstPercentage: '18',
      tagNumber: '',
      barcode: '',
    });
    setErrors({});
    setImageFiles([]);
    setImageUrls([]);
    setShowSalesInfo(false);
    setShowDescription(false);
    setShowMRP(false);
  }, []);

  return {
    // State
    formData,
    errors,
    loading,
    expandedSections,
    imageFiles,
    imageUrls,
    showSalesInfo,
    showDescription,
    showMRP,
    
    // Setters
    setLoading,
    setFormData,
    setErrors,
    setShowSalesInfo,
    setShowDescription,
    setShowMRP,
    
    // Actions
    toggleSection,
    toggleSalesInfo,
    handleInputChange,
    handleManualChange,
    handleImageUpload,
    removeImage,
    validateForm,
    resetForm,
    
    // Getters
    getCategories,
    getMetalTypes,
    getPurities,
    getUnits,
    generateItemCode,
    getGoldRate,
    calculateSellingPrice,
    getHsnCode,
  };
};