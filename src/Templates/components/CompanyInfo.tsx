// src/templates/components/CompanyInfo.tsx

import React from 'react';
import type { CompanyInfo as CompanyInfoType, TemplateConfig } from '../../types/Template/TemplateTypes';

interface CompanyInfoProps {
  company: CompanyInfoType;
  config: TemplateConfig;
  showLogo?: boolean;
}

export const CompanyInfo: React.FC<CompanyInfoProps> = ({ company, config, showLogo = true }) => {
  return (
    <div className="flex items-start gap-4">
      {showLogo && company.logo && (
        <div className="flex-shrink-0">
          <img src={company.logo} alt={company.name} className="h-16 w-auto object-contain" />
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold" style={{ color: config.colors.primary, fontFamily: config.fonts.heading }}>
          {company.name}
        </h2>
        <div className="mt-1 text-sm space-y-0.5" style={{ color: config.colors.lightText }}>
          {company.address && <p>{company.address}</p>}
          {company.city && (
            <p>{[company.city, company.state, company.pincode].filter(Boolean).join(', ')}</p>
          )}
          {company.phone && <p>Phone: {company.phone}</p>}
          {company.email && <p>Email: {company.email}</p>}
          {company.website && <p>Web: {company.website}</p>}
          {company.gst && <p className="font-medium" style={{ color: config.colors.text }}>GST: {company.gst}</p>}
          {company.pan && <p className="font-medium" style={{ color: config.colors.text }}>PAN: {company.pan}</p>}
        </div>
      </div>
    </div>
  );
};