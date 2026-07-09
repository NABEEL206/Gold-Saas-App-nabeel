// src/templates/components/VendorInfo.tsx

import React from 'react';
import type { VendorInfo as VendorInfoType, TemplateConfig } from '../../types/Template/TemplateTypes';

interface VendorInfoProps {
  vendor: VendorInfoType;
  config: TemplateConfig;
  label?: string;
}

export const VendorInfo: React.FC<VendorInfoProps> = ({ vendor, config, label = 'Vendor' }) => {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: config.colors.lightText }}>
        {label}
      </h3>
      <div className="text-sm space-y-0.5">
        <p className="font-semibold" style={{ color: config.colors.text }}>{vendor.name}</p>
        {vendor.address && <p style={{ color: config.colors.lightText }}>{vendor.address}</p>}
        {vendor.city && (
          <p style={{ color: config.colors.lightText }}>
            {[vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(', ')}
          </p>
        )}
        {vendor.phone && <p style={{ color: config.colors.lightText }}>Phone: {vendor.phone}</p>}
        {vendor.email && <p style={{ color: config.colors.lightText }}>Email: {vendor.email}</p>}
        {vendor.gst && <p className="font-medium" style={{ color: config.colors.text }}>GST: {vendor.gst}</p>}
      </div>
    </div>
  );
};