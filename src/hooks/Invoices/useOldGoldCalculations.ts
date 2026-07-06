import { useMemo } from 'react';
import { calculateOldGold, calculateTotalOldGold, formatCurrency } from '../../utils/Invoice/calculations';
import type { OldGoldItem } from '../../components/common/OldGoldTable';

export const useOldGoldCalculations = (items: OldGoldItem[]) => {
  // Recalculate all old gold items
  const calculatedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      ...calculateOldGold({
        grossWt: item.grossWt || 0,
        lessWastage: item.lessWastage || 0,
        rate: item.rate || 0,
      }),
    }));
  }, [items]);

  // Calculate total
  const total = useMemo(() => {
    return calculateTotalOldGold(calculatedItems);
  }, [calculatedItems]);

  // Format for display
  const formattedTotal = useMemo(() => {
    return formatCurrency(total);
  }, [total]);

  return {
    items: calculatedItems,
    total,
    formattedTotal,
    itemCount: calculatedItems.length,
  };
};