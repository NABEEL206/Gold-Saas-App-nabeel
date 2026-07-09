// src/templates/configs/defaultConfigs.ts

import type { TemplateConfig, TemplateColors, TemplateFonts } from '../../types/Template/TemplateTypes';

export const modernColors: TemplateColors = {
  primary: '#1a56db',
  secondary: '#3b82f6',
  text: '#111827',
  lightText: '#6b7280',
  background: '#ffffff',
  tableHeader: '#eff6ff',
  tableBorder: '#e5e7eb',
  totalHighlight: '#f0f9ff',
};

export const classicColors: TemplateColors = {
  primary: '#1e3a5f',
  secondary: '#2c5282',
  text: '#1a202c',
  lightText: '#718096',
  background: '#ffffff',
  tableHeader: '#edf2f7',
  tableBorder: '#cbd5e0',
  totalHighlight: '#f7fafc',
};

export const compactColors: TemplateColors = {
  primary: '#374151',
  secondary: '#6b7280',
  text: '#111827',
  lightText: '#9ca3af',
  background: '#ffffff',
  tableHeader: '#f3f4f6',
  tableBorder: '#d1d5db',
  totalHighlight: '#f9fafb',
};

export const minimalColors: TemplateColors = {
  primary: '#000000',
  secondary: '#4b5563',
  text: '#111827',
  lightText: '#9ca3af',
  background: '#ffffff',
  tableHeader: '#ffffff',
  tableBorder: '#e5e7eb',
  totalHighlight: '#ffffff',
};

const defaultFonts: TemplateFonts = {
  heading: 'Inter, sans-serif',
  body: 'Inter, sans-serif',
  mono: 'JetBrains Mono, monospace',
};

export const defaultTemplateConfigs: Record<string, TemplateConfig> = {
  modern: {
    id: 'modern-default',
    name: 'Modern',
    layout: 'modern',
    documentType: 'invoice',
    isDefault: true,
    colors: modernColors,
    fonts: defaultFonts,
    showCompanyLogo: true,
    showSignature: true,
    showTerms: true,
    paperSize: 'a4',
    orientation: 'portrait',
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    headerStyle: 'filled',
    tableStyle: 'striped',
  },
  classic: {
    id: 'classic-default',
    name: 'Classic',
    layout: 'classic',
    documentType: 'invoice',
    isDefault: false,
    colors: classicColors,
    fonts: defaultFonts,
    showCompanyLogo: true,
    showSignature: true,
    showTerms: true,
    paperSize: 'a4',
    orientation: 'portrait',
    margins: { top: 30, right: 30, bottom: 30, left: 30 },
    headerStyle: 'bordered',
    tableStyle: 'bordered',
  },
  compact: {
    id: 'compact-default',
    name: 'Compact',
    layout: 'compact',
    documentType: 'invoice',
    isDefault: false,
    colors: compactColors,
    fonts: defaultFonts,
    showCompanyLogo: false,
    showSignature: false,
    showTerms: false,
    paperSize: 'a4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    headerStyle: 'minimal',
    tableStyle: 'minimal',
  },
  minimal: {
    id: 'minimal-default',
    name: 'Minimal',
    layout: 'minimal',
    documentType: 'invoice',
    isDefault: false,
    colors: minimalColors,
    fonts: defaultFonts,
    showCompanyLogo: false,
    showSignature: false,
    showTerms: false,
    paperSize: 'a4',
    orientation: 'portrait',
    margins: { top: 25, right: 25, bottom: 25, left: 25 },
    headerStyle: 'minimal',
    tableStyle: 'minimal',
  },
};