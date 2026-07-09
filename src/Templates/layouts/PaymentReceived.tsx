// src/templates/layouts/PaymentReceived.tsx

import React from 'react';
import type { TemplateProps } from '../../types/Template/TemplateTypes';
import { CompanyInfo } from '../components/CompanyInfo';
import { CustomerInfo } from '../components/CustomerInfo';
import { Notes } from '../components/Notes';
import { Signature } from '../components/Signature';

const PaymentReceivedLayout: React.FC<TemplateProps> = ({ data, config }) => {
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      cash: 'Cash', bank_transfer: 'Bank Transfer', cheque: 'Cheque',
      credit_card: 'Credit Card', upi: 'UPI', other: 'Other',
    };
    return labels[method] || method;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; label: string }> = {
      completed: { color: '#166534', bg: '#dcfce7', label: 'Completed' },
      pending: { color: '#854d0e', bg: '#fef9c3', label: 'Pending' },
      failed: { color: '#991b1b', bg: '#fee2e2', label: 'Failed' },
      refunded: { color: '#374151', bg: '#f3f4f6', label: 'Refunded' },
    };
    return configs[status] || { color: '#374151', bg: '#f3f4f6', label: status };
  };

  const paymentMethod = data.additionalFields?.['Payment Method'] || 'N/A';
  const status = data.additionalFields?.['Status'] || 'completed';
  const invoiceNumber = data.additionalFields?.['Invoice'] || 'N/A';
  const referenceNumber = data.additionalFields?.['Reference'] || 'N/A';
  const bankName = data.additionalFields?.['Bank'] || 'N/A';
  const chequeNumber = data.additionalFields?.['Cheque'] || 'N/A';
  const statusConfig = getStatusConfig(status);

  return (
    <div
      className="bg-white"
      style={{
        maxWidth: config.orientation === 'portrait' ? '210mm' : '297mm',
        margin: '0 auto',
        fontFamily: config.fonts.body,
        color: config.colors.text,
        border: `3px double ${config.colors.primary}`,
        padding: config.margins.top || 30,
      }}
    >
      {/* Header */}
      <div className="border-b-2 pb-4 mb-6" style={{ borderColor: config.colors.primary }}>
        <div className="flex justify-between items-start">
          <CompanyInfo company={data.company} config={config} showLogo={config.showCompanyLogo} />
          <div className="text-right">
            <h1 className="text-2xl font-bold" style={{ color: config.colors.primary, fontFamily: config.fonts.heading }}>
              PAYMENT RECEIVED
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
          {data.referenceNumber && (
            <div className="flex gap-2">
              <span style={{ color: config.colors.lightText }}>Ref:</span>
              <span className="font-medium">{data.referenceNumber}</span>
            </div>
          )}
          {/* Status Badge */}
          <div className="flex gap-2 items-center mt-2">
            <span style={{ color: config.colors.lightText }}>Status:</span>
            <span
              className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          {data.customer && <CustomerInfo customer={data.customer} config={config} label="Received From" />}
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="mb-6 border rounded-lg overflow-hidden" style={{ borderColor: config.colors.tableBorder }}>
        <div className="px-4 py-3 font-semibold text-sm uppercase tracking-wider" style={{ backgroundColor: '#f0fdf4', color: '#166534', borderBottom: `1px solid ${config.colors.tableBorder}` }}>
          Payment Details
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: config.colors.lightText }}>Amount Received</p>
              <p className="text-3xl font-bold" style={{ color: '#166534' }}>{formatCurrency(data.totalAmount)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ color: config.colors.lightText }}>Payment Method:</span>
                <span className="font-medium" style={{ color: config.colors.text }}>{getMethodLabel(paymentMethod)}</span>
              </div>
              {invoiceNumber !== 'N/A' && (
                <div className="flex justify-between">
                  <span style={{ color: config.colors.lightText }}>Invoice:</span>
                  <span className="font-medium" style={{ color: config.colors.text }}>{invoiceNumber}</span>
                </div>
              )}
              {referenceNumber !== 'N/A' && (
                <div className="flex justify-between">
                  <span style={{ color: config.colors.lightText }}>Reference:</span>
                  <span className="font-medium" style={{ color: config.colors.text }}>{referenceNumber}</span>
                </div>
              )}
              {bankName !== 'N/A' && (
                <div className="flex justify-between">
                  <span style={{ color: config.colors.lightText }}>Bank:</span>
                  <span className="font-medium" style={{ color: config.colors.text }}>{bankName}</span>
                </div>
              )}
              {chequeNumber !== 'N/A' && (
                <div className="flex justify-between">
                  <span style={{ color: config.colors.lightText }}>Cheque No:</span>
                  <span className="font-medium" style={{ color: config.colors.text }}>{chequeNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: config.colors.lightText }}>Notes</h4>
          <p className="text-sm" style={{ color: config.colors.text }}>{data.notes}</p>
        </div>
      )}

      {/* Terms */}
      {data.terms && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: config.colors.lightText }}>Terms & Conditions</h4>
          <p className="text-sm whitespace-pre-wrap" style={{ color: config.colors.lightText }}>{data.terms}</p>
        </div>
      )}

      {/* Signature */}
      {config.showSignature && (
        <div className="flex justify-between mt-12 pt-6 border-t" style={{ borderColor: config.colors.tableBorder }}>
          <div className="text-center">
            <div className="border-b border-gray-300 w-40 mb-2" />
            <p className="text-sm font-medium" style={{ color: config.colors.text }}>Received By</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-300 w-40 mb-2" />
            <p className="text-sm font-medium" style={{ color: config.colors.text }}>Authorized Signature</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReceivedLayout;