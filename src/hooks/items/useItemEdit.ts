// src/hooks/items/useItemEdit.ts
import { useState, useCallback } from 'react';
import type { ItemFormData } from '../../types/items/Itemstype';

type Item = ItemFormData & { id?: string };

const initialFormData: ItemFormData = {
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
    mcType: 'percentage',
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
    barcode: ''
};

export const useItemEdit = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [showSalesInfo, setShowSalesInfo] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showMRP, setShowMRP] = useState(false);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }, []);

  const toggleSalesInfo = useCallback(() => {
    setShowSalesInfo(prev => !prev);
  }, []);

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/items/${id}`);
      // const data = await response.json();
      // setItem(data);
      
      console.log('Fetching item with id:', id);
      
      // For now, set to null to show error state
      setItem(null);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleManualChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newImageUrls]);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.itemCode) newErrors.itemCode = 'Item code is required';
    if (!formData.itemName) newErrors.itemName = 'Item name is required';
    if (!formData.itemType) newErrors.itemType = 'Item type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (showSalesInfo && !formData.sellingPrice) {
      newErrors.sellingPrice = 'Selling price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, showSalesInfo]);

  const updateItem = useCallback(async () => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/items/${item?.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      
      console.log('Updating item:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [formData, item]);

  const deleteItem = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/items/${item?.id}`, { method: 'DELETE' });
      
      console.log('Deleting item:', item?.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [item]);

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