// src/components/Reports/ReportTable.tsx

import React from 'react';
import { Eye, Download, MoreVertical, FileText } from 'lucide-react';
import type { ReportItem } from '../../types/Reports/ReportType';

interface ReportTableProps {
  reports: ReportItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  viewMode: 'grid' | 'list';
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-500',
  green: 'bg-green-50 text-green-500',
  purple: 'bg-purple-50 text-purple-500',
  amber: 'bg-amber-50 text-amber-500',
  indigo: 'bg-indigo-50 text-indigo-500',
  teal: 'bg-teal-50 text-teal-500',
  cyan: 'bg-cyan-50 text-cyan-500',
  orange: 'bg-orange-50 text-orange-500',
  red: 'bg-red-50 text-red-500',
  emerald: 'bg-emerald-50 text-emerald-500',
  lime: 'bg-lime-50 text-lime-500',
  violet: 'bg-violet-50 text-violet-500',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-500',
  rose: 'bg-rose-50 text-rose-500',
};

const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  selectedId,
  onSelect,
  viewMode,
}) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {reports.map((report) => {
          const colorClass = colorClasses[report.color] || 'bg-gray-50 text-gray-500';
          return (
            <div
              key={report.id}
              onClick={() => onSelect(report.id)}
              className="rounded-lg p-4 cursor-pointer transition-all duration-200 themed-transition"
              style={{
                background: 'var(--card)',
                border: selectedId === report.id
                  ? '1px solid var(--gold)'
                  : '1px solid var(--border)',
                boxShadow: selectedId === report.id ? '0 0 0 2px var(--focus-ring)' : 'var(--shadow-sm)',
              }}
              onMouseEnter={e => { if (selectedId !== report.id) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { if (selectedId !== report.id) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <FileText className="h-5 w-5" />
                </div>
                {report.popular && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Popular</span>
                )}
              </div>
              <h3 className="font-medium text-sm mb-1 line-clamp-2" style={{ color: 'var(--text)' }}>
                {report.title}
              </h3>
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{report.category}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {report.createdBy} • {report.lastVisited}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead
        className="sticky top-0"
        style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border)' }}
      >
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Report Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Report Category</th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Created By</th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Last Visited</th>
          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
        </tr>
      </thead>
      <tbody style={{ borderColor: 'var(--border)' }}>
        {reports.map((report) => {
          const colorClass = colorClasses[report.color] || 'bg-gray-50 text-gray-500';
          return (
            <tr
              key={report.id}
              onClick={() => onSelect(report.id)}
              className="transition-colors cursor-pointer"
              style={{
                background: selectedId === report.id ? 'var(--active-bg)' : 'transparent',
                borderBottom: '1px solid var(--border)',
              }}
              onMouseEnter={e => { if (selectedId !== report.id) (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
              onMouseLeave={e => { if (selectedId !== report.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <td className="px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${colorClass}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{report.title}</span>
                  {report.popular && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">★</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{report.category}</td>
              <td className="px-6 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{report.createdBy}</td>
              <td className="px-6 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{report.lastVisited}</td>
              <td className="px-6 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    className="p-1.5 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = ''; }}
                  ><Eye className="h-4 w-4" /></button>
                  <button
                    className="p-1.5 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = ''; }}
                  ><Download className="h-4 w-4" /></button>
                  <button
                    className="p-1.5 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = ''; }}
                  ><MoreVertical className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ReportTable;