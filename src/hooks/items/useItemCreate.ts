// src/hooks/items/useItemCreate.ts
import { useState, useCallback } from 'react';
import type{ ItemFormData } from '../../types/items/Itemstype';

const INITIAL_FORM_DATA: ItemFormData = {
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
  salesAccount: 'sales',
  salesDescription: '',
  purchasePrice: '',
  purchaseDescription: '',
  purchaseAccount: 'cogs',
  preferredVendor: '',
  openingStock: '',
  reorderLevel: '',
  hsnCode: '',
  gstPercentage: '18',
  currency: 'INR',
  mrp: '',
  description: '',
  tagNumber: '',
  barcode: '',
};

export const useItemCreate = () => {
  const [formData, setFormData] = useState<ItemFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear error for this field
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

    // Required fields validation
    if (!formData.itemCode.trim()) {
      newErrors.itemCode = 'Item code is required';
    }
    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }

    // Conditional validation
    if (formData.metalType && !formData.purity) {
      newErrors.purity = 'Purity is required when metal type is selected';
    }

    if (formData.grossWeight && !formData.netWeight) {
      newErrors.netWeight = 'Net weight is required when gross weight is provided';
    }

    if (formData.hsnCode && formData.hsnCode.length < 4) {
      newErrors.hsnCode = 'HSN code must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setImageUrls([]);
    setExpandedSections(['basic']);
  }, []);

  return {
    formData,
    errors,
    loading,
    expandedSections,
    imageUrls,
    setLoading,
    toggleSection,
    handleInputChange,
    handleManualChange,
    handleImageUpload,
    removeImage,
    validateForm,
    resetForm,
  };
};