// src/templates/layouts/ManualJournal.tsx

import React from 'react';
import type { TemplateProps } from '../../types/Template/TemplateTypes';
import { CompanyInfo } from '../components/CompanyInfo';
import { Notes } from '../components/Notes';
import { Signature } from '../components/Signature';

const ManualJournalLayout: React.FC<TemplateProps> = ({ data, config }) => {
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const description = data.additionalFields?.['Description'] || data.notes || 'N/A';
  const totalDebit = data.additionalFields?.['Total Debit'] || formatCurrency(data.subtotal);
  const totalCredit = data.additionalFields?.['Total Credit'] || formatCurrency(0);
  const isBalanced = data.additionalFields?.['Balanced'] === 'Yes';

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
              JOURNAL VOUCHER
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: config.colors.text }}>
              {data.documentNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Date & Reference */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div className="space-y-1">
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
        </div>
        <div className="text-right">
          <div className="flex gap-2 justify-end">
            <span style={{ color: config.colors.lightText }}>Description:</span>
            <span className="font-medium">{description}</span>
          </div>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="mb-6 border rounded-lg overflow-hidden" style={{ borderColor: config.colors.tableBorder }}>
        <div className="px-4 py-3 font-semibold text-sm uppercase tracking-wider" style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderBottom: `1px solid ${config.colors.tableBorder}` }}>
          Journal Entries
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: config.colors.tableHeader, borderBottom: `2px solid ${config.colors.primary}` }}>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: config.colors.text }}>#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: config.colors.text }}>Account</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: config.colors.text }}>Description</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#dc2626' }}>Debit (₹)</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#16a34a' }}>Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item, index) => {
                const isDebit = (item as any).isDebit !== false;
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900">{item.name}</p>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{item.description || '-'}</td>
                    <td className="px-4 py-2.5 text-right font-medium" style={{ color: '#dc2626' }}>
                      {isDebit ? formatCurrency(item.total) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium" style={{ color: '#16a34a' }}>
                      {!isDebit ? formatCurrency(item.total) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: config.colors.tableHeader, borderTop: `2px solid ${config.colors.primary}` }}>
                <td colSpan={3} className="px-4 py-2.5 text-right font-bold" style={{ color: config.colors.text }}>Totals</td>
                <td className="px-4 py-2.5 text-right font-bold" style={{ color: '#dc2626' }}>{totalDebit}</td>
                <td className="px-4 py-2.5 text-right font-bold" style={{ color: '#16a34a' }}>{totalCredit}</td>
              </tr>
              {isBalanced && (
                <tr>
                  <td colSpan={5} className="px-4 py-2.5 text-right text-sm font-semibold" style={{ color: '#16a34a' }}>
                    ✓ Journal is Balanced
                  </td>
                </tr>
              )}
              {!isBalanced && (
                <tr>
                  <td colSpan={5} className="px-4 py-2.5 text-right text-sm font-semibold" style={{ color: '#dc2626' }}>
                    ⚠ Journal is Unbalanced
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: config.colors.lightText }}>Notes</h4>
          <p className="text-sm" style={{ color: config.colors.text }}>{data.notes}</p>
        </div>
      )}

      {/* Signature */}
      {config.showSignature && (
        <div className="flex justify-between mt-12 pt-6 border-t" style={{ borderColor: config.colors.tableBorder }}>
          <div className="text-center">
            <div className="border-b border-gray-300 w-40 mb-2" />
            <p className="text-sm font-medium" style={{ color: config.colors.text }}>Prepared By</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-300 w-40 mb-2" />
            <p className="text-sm font-medium" style={{ color: config.colors.text }}>Authorized By</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualJournalLayout;