// src/templates/components/ItemTable.tsx

import React from 'react';
import type { DocumentItem, TemplateConfig } from '../../types/Template/TemplateTypes';

interface ItemTableProps {
  items: DocumentItem[];
  config: TemplateConfig;
  showHSN?: boolean;
  showDescription?: boolean;
  showUnit?: boolean;
  showDiscount?: boolean;
  showTax?: boolean;
}

export const ItemTable: React.FC<ItemTableProps> = ({
  items,
  config,
  showHSN = false,
  showDescription = true,
  showUnit = true,
  showDiscount = true,
  showTax = true,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const headerStyle = {
    backgroundColor: config.colors.tableHeader,
    color: config.colors.text,
    borderBottom: `2px solid ${config.colors.primary}`,
  };

  const stripedBg = config.tableStyle === 'striped' ? 'even:bg-gray-50' : '';
  const bordered = config.tableStyle === 'bordered' ? 'border border-gray-200' : '';

  return (
    <div className={`overflow-x-auto ${bordered} rounded-lg`}>
      <table className="w-full text-sm">
        <thead>
          <tr style={headerStyle}>
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">#</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Item</th>
            {showHSN && <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">HSN</th>}
            {showDescription && <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Description</th>}
            <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Qty</th>
            {showUnit && <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">Unit</th>}
            <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Rate</th>
            {showDiscount && <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Disc</th>}
            {showTax && <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Tax</th>}
            <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <tr key={item.id || index} className={`${stripedBg} hover:bg-gray-50 transition-colors`}>
              <td className="px-3 py-2.5 text-gray-500">{index + 1}</td>
              <td className="px-3 py-2.5 font-medium text-gray-900">{item.name}</td>
              {showHSN && <td className="px-3 py-2.5 text-center text-gray-500">{item.hsn || '-'}</td>}
              {showDescription && <td className="px-3 py-2.5 text-gray-500 max-w-[200px] truncate">{item.description || '-'}</td>}
              <td className="px-3 py-2.5 text-right text-gray-900">{item.quantity}</td>
              {showUnit && <td className="px-3 py-2.5 text-center text-gray-500">{item.unit || '-'}</td>}
              <td className="px-3 py-2.5 text-right text-gray-900">{formatCurrency(item.rate)}</td>
              {showDiscount && <td className="px-3 py-2.5 text-right text-gray-500">{item.discount ? `${item.discount}${item.discountType === 'percentage' ? '%' : ''}` : '-'}</td>}
              {showTax && <td className="px-3 py-2.5 text-right text-gray-500">{item.taxRate ? `${item.taxRate}%` : '-'}</td>}
              <td className="px-3 py-2.5 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};