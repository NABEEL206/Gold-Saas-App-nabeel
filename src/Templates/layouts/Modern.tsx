// src/templates/layouts/Modern.tsx

import React from 'react';
import type { TemplateProps } from '../../types/Template/TemplateTypes';
import { CompanyInfo } from '../components/CompanyInfo';
import { CustomerInfo } from '../components/CustomerInfo';
import { VendorInfo } from '../components/VendorInfo';
import { DocumentHeader } from '../components/Header';
import { ItemTable } from '../components/ItemTable';
import { OldGoldTable } from '../components/OldGoldTable';
import { Totals } from '../components/Totals';
import { Notes } from '../components/Notes';
import { Signature } from '../components/Signature';

const ModernLayout: React.FC<TemplateProps> = ({ data, config }) => {
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

  const title = titleMap[config.documentType] || 'DOCUMENT';

  return (
    <div
      className="bg-white shadow-lg rounded-lg overflow-hidden"
      style={{
        maxWidth: config.orientation === 'portrait' ? '210mm' : '297mm',
        margin: '0 auto',
        fontFamily: config.fonts.body,
        color: config.colors.text,
      }}
    >
      {/* Header */}
      <DocumentHeader data={data} config={config} title={title} />

      <div className="p-6 space-y-6">
        {/* Company & Customer/Vendor Info */}
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            <CompanyInfo company={data.company} config={config} showLogo={config.showCompanyLogo} />
          </div>
          <div className="flex-1 text-right">
            {data.customer && <CustomerInfo customer={data.customer} config={config} />}
            {data.vendor && <VendorInfo vendor={data.vendor} config={config} />}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <ItemTable
            items={data.items}
            config={config}
            showHSN={true}
            showDescription={true}
            showUnit={true}
            showDiscount={true}
            showTax={true}
          />
        </div>

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

        {/* Notes & Terms */}
        {(data.notes || data.terms) && (
          <Notes notes={data.notes} terms={data.terms} config={config} />
        )}

        {/* Signature */}
        {config.showSignature && <Signature config={config} />}
      </div>
    </div>
  );
};

export default ModernLayout;