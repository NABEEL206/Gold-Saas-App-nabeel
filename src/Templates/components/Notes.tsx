// src/templates/components/Notes.tsx

import React from 'react';
import type { TemplateConfig } from '../../types/Template/TemplateTypes';

interface NotesProps {
  notes?: string;
  terms?: string;
  config: TemplateConfig;
}

export const Notes: React.FC<NotesProps> = ({ notes, terms, config }) => {
  if (!notes && !terms) return null;

  return (
    <div className="mt-6 space-y-4">
      {notes && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: config.colors.lightText }}>
            Notes
          </h4>
          <p className="text-sm" style={{ color: config.colors.text }}>{notes}</p>
        </div>
      )}
      {terms && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: config.colors.lightText }}>
            Terms & Conditions
          </h4>
          <p className="text-sm whitespace-pre-wrap" style={{ color: config.colors.lightText }}>{terms}</p>
        </div>
      )}
    </div>
  );
};