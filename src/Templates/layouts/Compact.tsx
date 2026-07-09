// src/templates/layouts/Compact.tsx

import React from 'react';
import type { TemplateProps } from '../../types/Template/TemplateTypes';
import { ItemTable } from '../components/ItemTable';
import { OldGoldTable } from '../components/OldGoldTable';

const CompactLayout: React.FC<TemplateProps> = ({ data, config }) => {
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount) || 0);

  const formatWeight = (value: number | string | undefined): string => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toFixed(3) : '0.000';
  };

const titleMap: Record<string, string> = {
  invoice: 'TAX INVOICE',
  quote: 'QUOTATION',
  purchase_order: 'PURCHASE ORDER',
  bill: 'BILL',
  payment_receipt: 'PAYMENT RECEIPT',
  credit_note: 'CREDIT NOTE',
  proforma_invoice: 'PROFORMA INVOICE',
  payment_received: 'PAYMENT RECEIVED',
  delivery_challan: 'DELIVERY CHALLAN',
  vendor_credit: 'VENDOR CREDIT NOTE',
  payment_made: 'PAYMENT MADE',
};

  return (
    <div
      className="bg-white p-4"
      style={{
        maxWidth: config.orientation === 'portrait' ? '210mm' : '297mm',
        margin: '0 auto',
        fontFamily: config.fonts.body,
        fontSize: '12px',
        color: config.colors.text,
      }}
    >
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: config.colors.tableBorder }}>
        <div>
          <span className="font-bold" style={{ color: config.colors.primary }}>{data.company.name}</span>
          {data.company.gst && <span className="text-xs ml-2" style={{ color: config.colors.lightText }}>GST: {data.company.gst}</span>}
        </div>
        <div className="text-right">
          <span className="font-bold text-sm">{titleMap[config.documentType] || 'DOC'}</span>
          <span className="mx-2">|</span>
          <span className="font-medium">{data.documentNumber}</span>
        </div>
      </div>

      {/* Compact Info Row */}
      <div className="flex justify-between text-xs mb-3">
        <div>
          {data.customer && <span>To: <span className="font-medium">{data.customer.name}</span></span>}
          {data.vendor && <span>From: <span className="font-medium">{data.vendor.name}</span></span>}
        </div>
        <div className="space-x-3">
          <span>Date: {data.documentDate}</span>
          {data.dueDate && <span>Due: {data.dueDate}</span>}
        </div>
      </div>

      {/* Items - Compact */}
      <ItemTable items={data.items} config={config} showHSN={false} showDescription={false} showUnit={false} showDiscount={false} showTax={false} />

      {/* Old Gold Exchange - Compact */}
      {data.oldGoldItems && data.oldGoldItems.length > 0 && (
        <div className="mt-3 border-t pt-2" style={{ borderColor: config.colors.tableBorder }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold" style={{ color: '#b45309' }}>Old Gold Exchange ({data.oldGoldItems.length} items)</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${config.colors.tableBorder}` }}>
                <th className="text-left py-1 text-[10px] font-medium" style={{ color: config.colors.lightText }}>Desc</th>
                <th className="text-right py-1 text-[10px] font-medium" style={{ color: config.colors.lightText }}>N.WT</th>
                <th className="text-center py-1 text-[10px] font-medium" style={{ color: config.colors.lightText }}>Purity</th>
                <th className="text-right py-1 text-[10px] font-medium" style={{ color: config.colors.lightText }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.oldGoldItems.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="py-1">{item.description}</td>
                  <td className="py-1 text-right">{formatWeight(item.netWt)}</td>
                  <td className="py-1 text-center">{item.purity}</td>
                  <td className="py-1 text-right font-medium" style={{ color: '#b45309' }}>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Compact Totals */}
      <div className="flex justify-end mt-3 pt-2 border-t" style={{ borderColor: config.colors.tableBorder }}>
        <div className="space-y-1 text-xs w-48">
          <div className="flex justify-between">
            <span style={{ color: config.colors.lightText }}>Subtotal</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          {data.oldGoldTotal && data.oldGoldTotal > 0 && (
            <div className="flex justify-between">
              <span style={{ color: '#b45309' }}>Old Gold</span>
              <span style={{ color: '#b45309' }}>-{formatCurrency(data.oldGoldTotal)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 border-t" style={{ borderColor: config.colors.tableBorder }}>
            <span>Total</span>
            <span style={{ color: config.colors.primary }}>{formatCurrency(data.totalAmount)}</span>
          </div>
        </div>
      </div>

      {data.notes && (
        <p className="text-xs mt-2 italic" style={{ color: config.colors.lightText }}>{data.notes}</p>
      )}
    </div>
  );
};

export default CompactLayout;
