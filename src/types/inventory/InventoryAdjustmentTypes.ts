// src/types/inventory/InventoryAdjustmentTypes.ts

export interface InventoryAdjustment {
  id: string;
  adjustmentNo: string;
  date: string;
  type: 'quantity' | 'weight' | 'value';
  itemCount: number;
  branch: string;
  value: number;
  status: 'draft' | 'pending' | 'adjusted';
  reason?: string;
  items: AdjustmentItem[];
  totalGain: number;
  totalLoss: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AdjustmentItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  previousQuantity: number;
  adjustedQuantity: number;
  newQuantity: number;
  previousWeight: number;
  adjustedWeight: number;
  newWeight: number;
  previousValue: number;
  adjustedValue: number;
  newValue: number;
  difference: number;
  reason?: string;
}

export interface InventoryAdjustmentFormData {
  reason: string;
  type: 'quantity' | 'weight' | 'value';
  branch: string;
  date: string;
  notes?: string;
  items: AdjustmentItemFormData[];
}

export interface AdjustmentItemFormData {
  itemId: string;
  itemCode: string;
  itemName: string;
  previousQuantity: number;
  adjustedQuantity: number;
  previousWeight: number;
  adjustedWeight: number;
  previousValue: number;
  adjustedValue: number;
  reason?: string;
  difference?: number;
}

export interface InventoryAdjustmentFilters {
  searchQuery: string;
  status: 'all' | 'draft' | 'pending' | 'adjusted';
  type: 'all' | 'quantity' | 'weight' | 'value';
  branch: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface InventoryAdjustmentStats {
  totalAdjustments: number;
  draft: number;
  pending: number;
  adjusted: number;
  totalGain: number;
  totalLoss: number;
  netAdjustment: number;
}

export interface AdjustmentSummary {
  totalItems: number;
  totalValue: number;
  gainCount: number;
  lossCount: number;
}

export type AdjustmentStatus = 'draft' | 'pending' | 'adjusted';
export type AdjustmentType = 'quantity' | 'weight' | 'value';