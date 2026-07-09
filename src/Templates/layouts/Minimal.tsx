// src/templates/layouts/Minimal.tsx

import React from 'react';
import type { TemplateProps } from '../../types/Template/TemplateTypes';
import { ItemTable } from '../components/ItemTable';
import { OldGoldTable } from '../components/OldGoldTable';
import { Totals } from '../components/Totals';

const MinimalLayout: React.FC<TemplateProps> = ({ data, config }) => {
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
      className="bg-white p-8"
      style={{
        maxWidth: config.orientation === 'portrait' ? '210mm' : '297mm',
        margin: '0 auto',
        fontFamily: config.fonts.body,
        color: config.colors.text,
      }}
    >
      <div className="space-y-6">
        {/* Minimal Header */}
        <div className="flex justify-between items-baseline">
          <h1 className="text-lg font-light tracking-widest uppercase" style={{ color: config.colors.primary }}>
            {titleMap[config.documentType] || 'Document'}
          </h1>
          <div className="text-right text-xs space-y-0.5" style={{ color: config.colors.lightText }}>
            <p>{data.documentNumber}</p>
            <p>{data.documentDate}</p>
            {data.dueDate && <p>Due: {data.dueDate}</p>}
          </div>
        </div>

        {/* Minimal Company & Customer */}
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-0.5">
            <p className="font-medium" style={{ color: config.colors.text }}>{data.company.name}</p>
            {data.company.address && <p style={{ color: config.colors.lightText }}>{data.company.address}</p>}
            {data.company.gst && <p style={{ color: config.colors.lightText }}>GST: {data.company.gst}</p>}
          </div>
          <div className="text-right space-y-0.5">
            {data.customer && (
              <>
                <p className="font-medium" style={{ color: config.colors.text }}>{data.customer.name}</p>
                {data.customer.address && <p style={{ color: config.colors.lightText }}>{data.customer.address}</p>}
                {data.customer.gst && <p style={{ color: config.colors.lightText }}>GST: {data.customer.gst}</p>}
              </>
            )}
          </div>
        </div>

        {/* Items */}
        <ItemTable items={data.items} config={config} showHSN={false} showDescription={true} showUnit={true} showDiscount={false} showTax={true} />

        {/* Old Gold Exchange */}
        {data.oldGoldItems && data.oldGoldItems.length > 0 && (
          <OldGoldTable 
            items={data.oldGoldItems} 
            total={data.oldGoldTotal || 0} 
            config={config} 
          />
        )}

        {/* Totals */}
        <Totals data={data} config={config} />

        {/* Notes */}
        {data.notes && (
          <p className="text-xs italic mt-4" style={{ color: config.colors.lightText }}>{data.notes}</p>
        )}
      </div>
    </div>
  );
};

export default MinimalLayout;