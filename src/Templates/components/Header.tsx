// src/templates/components/Header.tsx

import React from 'react';
import type { TemplateConfig, DocumentData } from '../../types/Template/TemplateTypes';

interface HeaderProps {
  data: DocumentData;
  config: TemplateConfig;
  title: string;
}

export const DocumentHeader: React.FC<HeaderProps> = ({ data, config, title }) => {
  const headerStyles = {
    filled: {
      container: `bg-gradient-to-r from-[${config.colors.primary}] to-[${config.colors.secondary}] text-white p-6 rounded-t-lg`,
      title: 'text-white',
      label: 'text-white/70',
      value: 'text-white',
    },
    bordered: {
      container: `border-b-2 p-6`,
      borderColor: config.colors.primary,
      title: `text-[${config.colors.primary}]`,
      label: `text-[${config.colors.lightText}]`,
      value: `text-[${config.colors.text}]`,
    },
    minimal: {
      container: 'p-4',
      title: `text-[${config.colors.text}]`,
      label: `text-[${config.colors.lightText}]`,
      value: `text-[${config.colors.text}]`,
    },
  };

  const style = headerStyles[config.headerStyle] || headerStyles.minimal;

  return (
    <div
      className={style.container}
      style={
        config.headerStyle === 'bordered'
          ? { borderBottomColor: config.colors.primary }
          : config.headerStyle === 'filled'
          ? { background: `linear-gradient(to right, ${config.colors.primary}, ${config.colors.secondary})` }
          : {}
      }
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: config.headerStyle === 'filled' ? '#ffffff' : config.colors.primary, fontFamily: config.fonts.heading }}>
            {title}
          </h1>
          <p className="text-sm mt-1" style={{ color: config.headerStyle === 'filled' ? 'rgba(255,255,255,0.7)' : config.colors.lightText }}>
            {data.documentNumber}
          </p>
        </div>
        <div className="text-right text-sm space-y-1">
          <div>
            <span className={style.label}>Date: </span>
            <span className={`font-medium ${style.value}`}>{data.documentDate}</span>
          </div>
          {data.dueDate && (
            <div>
              <span className={style.label}>Due Date: </span>
              <span className={`font-medium ${style.value}`}>{data.dueDate}</span>
            </div>
          )}
          {data.referenceNumber && (
            <div>
              <span className={style.label}>Ref: </span>
              <span className={`font-medium ${style.value}`}>{data.referenceNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};