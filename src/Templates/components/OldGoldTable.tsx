// src/templates/components/OldGoldTable.tsx

import React from 'react';
import type { OldGoldItem, TemplateConfig } from '../../types/Template/TemplateTypes';

interface OldGoldTableProps {
  items: OldGoldItem[];
  total: number;
  config: TemplateConfig;
}

export const OldGoldTable: React.FC<OldGoldTableProps> = ({ items, total, config }) => {
  const formatWeight = (value: number | string | undefined): string => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toFixed(3) : '0.000';
  };

  const formatCurrency = (amount: number): string => {
    const parsed = Number(amount);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number.isFinite(parsed) ? parsed : 0);
  };

  const headerStyle = {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderBottom: `2px solid ${config.colors.primary}`,
  };

  return (
    <div className="mt-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#92400e' }}>
          Old Gold Exchange
        </h4>
        <p className="text-xs" style={{ color: config.colors.lightText }}>({items.length} items)</p>
      </div>
      
      <div className="overflow-x-auto border border-amber-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr style={headerStyle}>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">#</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">HSN</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">G.WT</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">Less W</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">N.WT</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">Purity</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">Rate</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-3 py-2 text-center text-gray-500">{index + 1}</td>
                <td className="px-3 py-2 text-gray-700">{item.description}</td>
                <td className="px-3 py-2 text-gray-500">{item.hsn || '-'}</td>
                <td className="px-3 py-2 text-right text-gray-700">{formatWeight(item.grossWt)}</td>
                <td className="px-3 py-2 text-right text-gray-700">{formatWeight(item.lessWastage)}</td>
                <td className="px-3 py-2 text-right font-medium" style={{ color: '#92400e' }}>{formatWeight(item.netWt)}</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex px-2 py-0.5 text-xs rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                    {item.purity || '91.6'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(item.rate || 0)}</td>
                <td className="px-3 py-2 text-right font-bold" style={{ color: '#92400e' }}>{formatCurrency(item.amount || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#fef3c7' }}>
              <td colSpan={8} className="px-3 py-2 text-right font-semibold" style={{ color: '#92400e' }}>
                Total Exchange Amount
              </td>
              <td className="px-3 py-2 text-right font-bold" style={{ color: '#92400e' }}>
                {formatCurrency(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
