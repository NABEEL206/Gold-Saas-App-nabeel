// src/templates/DocumentRenderer.tsx

import React from 'react';
import type { TemplateProps } from '../types/Template/TemplateTypes';
import ModernLayout from './layouts/Modern';
import ClassicLayout from './layouts/Classic';
import CompactLayout from './layouts/Compact';
import MinimalLayout from './layouts/Minimal';
import PaymentReceivedLayout from './layouts/PaymentReceived';
import { defaultTemplateConfigs } from './configs/defaultConfigs';
import ManualJournalLayout from './layouts/ManualJournal';

interface DocumentRendererProps {
  data: TemplateProps['data'];
  layout?: 'modern' | 'classic' | 'compact' | 'minimal';
  config?: Partial<TemplateProps['config']>;
  className?: string;
}

const layoutMap: Record<string, React.FC<TemplateProps>> = {
  modern: ModernLayout,
  classic: ClassicLayout,
  compact: CompactLayout,
  minimal: MinimalLayout,
};

// Special document-type layouts that override the generic layouts
const documentTypeLayouts: Record<string, React.FC<TemplateProps>> = {
  payment_received: PaymentReceivedLayout,
  payment_made: PaymentReceivedLayout,
  manual_journal: ManualJournalLayout,
};

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  data,
  layout = 'modern',
  config: customConfig,
  className = '',
}) => {
  const baseConfig = defaultTemplateConfigs[layout] || defaultTemplateConfigs.modern;
  
  const config = {
    ...baseConfig,
    ...customConfig,
    colors: { ...baseConfig.colors, ...(customConfig?.colors || {}) },
    fonts: { ...baseConfig.fonts, ...(customConfig?.fonts || {}) },
    margins: { ...baseConfig.margins, ...(customConfig?.margins || {}) },
  };

  // Check if there's a special layout for this document type
  const docType = customConfig?.documentType || config.documentType || 'invoice';
  const LayoutComponent = documentTypeLayouts[docType] || layoutMap[layout] || layoutMap.modern;

  return (
    <div className={`template-renderer ${className}`}>
      <LayoutComponent data={data} config={config} />
    </div>
  );
};

export default DocumentRenderer;