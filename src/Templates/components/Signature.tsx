// src/templates/components/Signature.tsx

import React from 'react';
import type { TemplateConfig } from '../../types/Template/TemplateTypes';

interface SignatureProps {
  config: TemplateConfig;
}

export const Signature: React.FC<SignatureProps> = ({ config }) => {
  return (
    <div className="flex justify-end mt-12">
      <div className="text-center">
        <div className="border-b border-gray-300 w-48 mb-2" />
        <p className="text-sm font-medium" style={{ color: config.colors.text }}>Authorized Signature</p>
        <p className="text-xs mt-1" style={{ color: config.colors.lightText }}>Thank you for your business!</p>
      </div>
    </div>
  );
};