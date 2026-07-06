// src/hooks/calculations/useInvoiceCalculations.ts
import { useMemo } from 'react';
import { 
  calculateInvoiceTotals, 
  calculateItemTotals, 
  formatCurrency,
  calculateOldGold,
} from '../../utils/Invoice/calculations';
import type { ItemSelectionItem } from '../../components/common/ItemSelectionTable';
import type { OldGoldItem } from '../../components/common/OldGoldTable';

interface UseInvoiceCalculationsProps {
  items: ItemSelectionItem[];
  oldGoldItems: OldGoldItem[];
  additionalCharges: Array<{ label: string; value: number }>;
  headerDiscount: number;
  headerDiscountType: 'percentage' | 'fixed';
}

export const useInvoiceCalculations = ({
  items,
  oldGoldItems,
  additionalCharges,
  headerDiscount,
  headerDiscountType,
}: UseInvoiceCalculationsProps) => {
  // Calculate totals
  const totals = useMemo(() => {
    return calculateInvoiceTotals(
      items,
      oldGoldItems,
      additionalCharges,
      headerDiscount,
      headerDiscountType
    );
  }, [items, oldGoldItems, additionalCharges, headerDiscount, headerDiscountType]);

  // Calculate individual item details
  const itemDetails = useMemo(() => {
    return items.map((item) => ({
      ...item,
      calculation: calculateItemTotals(item),
      formattedTotal: formatCurrency(item.total || 0),
      formattedRate: formatCurrency(item.rate || 0),
    }));
  }, [items]);

  // Calculate old gold items with their calculations
  const oldGoldDetails = useMemo(() => {
    return oldGoldItems.map((item) => {
      const calculated = calculateOldGold({
        grossWt: item.grossWt || 0,
        lessWastage: item.lessWastage || 0,
        rate: item.rate || 0,
      });
      return {
        ...item,
        ...calculated,
        formattedAmount: formatCurrency(calculated.amount),
        formattedGrossWt: (item.grossWt || 0).toFixed(3),
        formattedNetWt: calculated.netWt.toFixed(3),
      };
    });
  }, [oldGoldItems]);

  // Get summary statistics
  const summary = useMemo(() => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalOldGoldItems = oldGoldItems.length;
    const totalWeight = items.reduce((sum, item) => sum + (item.grossWt || 0), 0);
    const totalOldGoldWeight = oldGoldItems.reduce((sum, item) => sum + (item.grossWt || 0), 0);
    
    return {
      totalItems,
      totalQuantity,
      totalOldGoldItems,
      totalWeight,
      totalOldGoldWeight,
      totalNetAmount: totals.netTotal,
    };
  }, [items, oldGoldItems, totals]);

  return {
    totals,
    itemDetails,
    oldGoldDetails,
    summary,
    oldGoldTotal: totals.oldGoldTotal,
    grandTotal: totals.grandTotal,
    netTotal: totals.netTotal,
    formatCurrency,
  };
};