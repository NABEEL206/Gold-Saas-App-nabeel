// src/templates/layouts/Classic.tsx

import React from 'react';
import type { TemplateProps } from '../../types/Template/TemplateTypes';
import { CompanyInfo } from '../components/CompanyInfo';
import { CustomerInfo } from '../components/CustomerInfo';
import { VendorInfo } from '../components/VendorInfo';
import { ItemTable } from '../components/ItemTable';
import { OldGoldTable } from '../components/OldGoldTable';
import { Totals } from '../components/Totals';
import { Notes } from '../components/Notes';
import { Signature } from '../components/Signature';

const ClassicLayout: React.FC<TemplateProps> = ({ data, config }) => {
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
  manual_journal: 'JOURNAL VOUCHER', 
};

  const title = titleMap[config.documentType] || 'DOCUMENT';

  return (
    <div
      className="bg-white"
      style={{
        maxWidth: config.orientation === 'portrait' ? '210mm' : '297mm',
        margin: '0 auto',
        fontFamily: config.fonts.body,
        color: config.colors.text,
        border: `3px double ${config.colors.primary}`,
        padding: config.margins.top,
      }}
    >
      {/* Header with Border */}
      <div className="border-b-2 pb-4 mb-6" style={{ borderColor: config.colors.primary }}>
        <div className="flex justify-between items-start">
          <CompanyInfo company={data.company} config={config} showLogo={config.showCompanyLogo} />
          <div className="text-right">
            <h1 className="text-2xl font-bold" style={{ color: config.colors.primary, fontFamily: config.fonts.heading }}>
              {title}
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: config.colors.text }}>
              {data.documentNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Dates & Customer Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span style={{ color: config.colors.lightText }}>Date:</span>
            <span className="font-medium">{data.documentDate}</span>
          </div>
          {data.dueDate && (
            <div className="flex gap-2">
              <span style={{ color: config.colors.lightText }}>Due Date:</span>
              <span className="font-medium">{data.dueDate}</span>
            </div>
          )}
          {data.referenceNumber && (
            <div className="flex gap-2">
              <span style={{ color: config.colors.lightText }}>Ref:</span>
              <span className="font-medium">{data.referenceNumber}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          {data.customer && <CustomerInfo customer={data.customer} config={config} />}
          {data.vendor && <VendorInfo vendor={data.vendor} config={config} />}
        </div>
      </div>

      {/* Items */}
      <ItemTable 
        items={data.items} 
        config={config} 
        showHSN={true} 
        showDescription={true} 
        showUnit={true} 
        showDiscount={true} 
        showTax={true} 
      />

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
      {(data.notes || data.terms) && <Notes notes={data.notes} terms={data.terms} config={config} />}

      {/* Signature */}
      {config.showSignature && <Signature config={config} />}
    </div>
  );
};

export default ClassicLayout;