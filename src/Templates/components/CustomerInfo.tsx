// src/templates/components/CustomerInfo.tsx

import React from 'react';
import type { CustomerInfo as CustomerInfoType, TemplateConfig } from '../../types/Template/TemplateTypes';

interface CustomerInfoProps {
  customer: CustomerInfoType;
  config: TemplateConfig;
  label?: string;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer, config, label = 'Bill To' }) => {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: config.colors.lightText }}>
        {label}
      </h3>
      <div className="text-sm space-y-0.5">
        <p className="font-semibold" style={{ color: config.colors.text }}>{customer.name}</p>
        {customer.address && <p style={{ color: config.colors.lightText }}>{customer.address}</p>}
        {customer.city && (
          <p style={{ color: config.colors.lightText }}>
            {[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}
          </p>
        )}
        {customer.phone && <p style={{ color: config.colors.lightText }}>Phone: {customer.phone}</p>}
        {customer.email && <p style={{ color: config.colors.lightText }}>Email: {customer.email}</p>}
        {customer.gst && <p className="font-medium" style={{ color: config.colors.text }}>GST: {customer.gst}</p>}
      </div>
    </div>
  );
};