// src/hooks/items/useItemEdit.ts
import { useState, useCallback } from 'react';
import type{ Item, ItemFormData } from '../../types/items/Itemstype';

// Mock item data for editing
const MOCK_ITEM: Item = {
  id: '1',
  itemCode: 'GOLD-RING-001',
  itemName: 'Gold Diamond Ring',
  itemType: 'Gold',
  category: 'Rings',
  brand: 'Luxury Gold',
  designCode: 'GR-2024-001',
  metalType: 'Gold',
  purity: '22K',
  grossWeight: 8.5,
  stoneWeight: 1.2,
  netWeight: 7.3,
  unit: 'g',
  diamondPieces: 12,
  caratWeight: 0.75,
  mcType: 'percentage',
  mcValue: 10,
  goldRate: 5400,
  sellingPrice: 45000,
  mrp: 52000,
  currency: 'INR',
  openingStock: 25,
  reorderLevel: 5,
  hsnCode: '71131911',
  gstPercentage: 18,
  salesAccount: 'sales',
  salesDescription: 'Beautiful gold ring with diamonds',
  purchasePrice: 38000,
  purchaseDescription: 'Bulk purchase from supplier',
  purchaseAccount: 'cogs',
  preferredVendor: 'preferred_vendor',
  status: 'active',
  description: 'Elegant gold ring with diamond setting',
  images: ['https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Ring'],
  createdBy: 'admin',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-03-20T14:45:00Z'
};

export const useItemEdit = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({} as ItemFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [showSalesInfo, setShowSalesInfo] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [showMRP, setShowMRP] = useState(false);

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Use mock item
      const foundItem = MOCK_ITEM;
      setItem(foundItem);
      
      // Convert to form data
      const formDataObj: ItemFormData = {
        itemCode: foundItem.itemCode,
        itemName: foundItem.itemName,
        itemType: foundItem.itemType,
        category: foundItem.category,
        brand: foundItem.brand || '',
        designCode: foundItem.designCode || '',
        metalType: foundItem.metalType || '',
        purity: foundItem.purity || '',
        grossWeight: foundItem.grossWeight?.toString() || '',
        stoneWeight: foundItem.stoneWeight?.toString() || '',
        netWeight: foundItem.netWeight?.toString() || '',
        unit: foundItem.unit || 'g',
        diamondPieces: foundItem.diamondPieces?.toString() || '',
        caratWeight: foundItem.caratWeight?.toString() || '',
        mcType: foundItem.mcType || 'percentage',
        mcValue: foundItem.mcValue?.toString() || '',
        goldRate: foundItem.goldRate?.toString() || '',
        sellingPrice: foundItem.sellingPrice?.toString() || '',
        salesAccount: foundItem.salesAccount || 'sales',
        salesDescription: foundItem.salesDescription || '',
        purchasePrice: foundItem.purchasePrice?.toString() || '',
        purchaseDescription: foundItem.purchaseDescription || '',
        purchaseAccount: foundItem.purchaseAccount || 'cogs',
        preferredVendor: foundItem.preferredVendor || '',
        openingStock: foundItem.openingStock?.toString() || '',
        reorderLevel: foundItem.reorderLevel?.toString() || '',
        hsnCode: foundItem.hsnCode || '',
        gstPercentage: foundItem.gstPercentage?.toString() || '18',
        currency: foundItem.currency || 'INR',
        mrp: foundItem.mrp?.toString() || '',
        description: foundItem.description || '',
        tagNumber: foundItem.tagNumber || '',
        barcode: foundItem.barcode || '',
      };
      
      setFormData(formDataObj);
      setImageUrls(foundItem.images || []);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const toggleSalesInfo = useCallback(() => {
    setShowSalesInfo((prev) => !prev);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleManualChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const newImageUrls = Array.from(files).map((file) =>
          URL.createObjectURL(file)
        );
        setImageUrls((prev) => [...prev, ...newImageUrls]);
      }
    },
    []
  );

  const removeImage = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemCode?.trim()) {
      newErrors.itemCode = 'Item code is required';
    }
    if (!formData.itemName?.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    if (!formData.itemType) {
      newErrors.itemType = 'Item type is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateItem = useCallback(async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Updated item:', formData);
      // In real app, this would be an API call
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [formData]);

  const deleteItem = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Deleted item');
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    saving,
    formData,
    errors,
    item,
    imageUrls,
    expandedSections,
    showSalesInfo,
    showDescription,
    showMRP,
    fetchItem,
    updateItem,
    deleteItem,
    toggleSection,
    toggleSalesInfo,
    handleInputChange,
    handleManualChange,
    handleImageUpload,
    removeImage,
    validateForm,
  };
};