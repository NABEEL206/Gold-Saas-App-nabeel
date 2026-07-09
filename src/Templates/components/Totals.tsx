// src/templates/components/Totals.tsx

import React from 'react';
import type { DocumentData, TemplateConfig } from '../../types/Template/TemplateTypes';

interface TotalsProps {
  data: DocumentData;
  config: TemplateConfig;
}

export const Totals: React.FC<TotalsProps> = ({ data, config }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="flex justify-end mt-4">
      <div className="w-72 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span style={{ color: config.colors.lightText }}>Subtotal</span>
          <span className="font-medium" style={{ color: config.colors.text }}>{formatCurrency(data.subtotal)}</span>
        </div>
        
        {data.discountTotal ? (
          <div className="flex justify-between text-sm">
            <span style={{ color: config.colors.lightText }}>Discount</span>
            <span className="font-medium text-green-600">-{formatCurrency(data.discountTotal)}</span>
          </div>
        ) : null}
        
        {data.taxTotal ? (
          <div className="flex justify-between text-sm">
            <span style={{ color: config.colors.lightText }}>Tax</span>
            <span className="font-medium" style={{ color: config.colors.text }}>{formatCurrency(data.taxTotal)}</span>
          </div>
        ) : null}

        {/* Old Gold Exchange */}
        {data.oldGoldItems && data.oldGoldItems.length > 0 && data.oldGoldTotal ? (
          <div className="flex justify-between text-sm">
            <span style={{ color: '#b45309' }}>Old Gold Exchange</span>
            <span className="font-medium" style={{ color: '#b45309' }}>-{formatCurrency(data.oldGoldTotal)}</span>
          </div>
        ) : null}
        
        {data.shippingCharges ? (
          <div className="flex justify-between text-sm">
            <span style={{ color: config.colors.lightText }}>Shipping</span>
            <span className="font-medium" style={{ color: config.colors.text }}>{formatCurrency(data.shippingCharges)}</span>
          </div>
        ) : null}
        
        {data.handlingCharges ? (
          <div className="flex justify-between text-sm">
            <span style={{ color: config.colors.lightText }}>Handling</span>
            <span className="font-medium" style={{ color: config.colors.text }}>{formatCurrency(data.handlingCharges)}</span>
          </div>
        ) : null}
        
        {data.otherCharges ? (
          <div className="flex justify-between text-sm">
            <span style={{ color: config.colors.lightText }}>Other Charges</span>
            <span className="font-medium" style={{ color: config.colors.text }}>{formatCurrency(data.otherCharges)}</span>
          </div>
        ) : null}
        
        <div
          className="flex justify-between text-base font-bold pt-2 mt-1 rounded px-2 py-1.5"
          style={{
            borderTop: `2px solid ${config.colors.primary}`,
            color: config.colors.primary,
          }}
        >
          <span>Grand Total</span>
          <span>{formatCurrency(data.totalAmount)}</span>
        </div>
        
        {data.paidAmount !== undefined && data.paidAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Paid</span>
            <span className="font-medium">-{formatCurrency(data.paidAmount)}</span>
          </div>
        )}
        
        {data.balanceDue !== undefined && data.balanceDue > 0 && (
          <div className="flex justify-between text-sm font-bold text-red-600">
            <span>Balance Due</span>
            <span>{formatCurrency(data.balanceDue)}</span>
          </div>
        )}
      </div>
    </div>
  );
};