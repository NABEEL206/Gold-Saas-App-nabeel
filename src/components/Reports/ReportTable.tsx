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
              className={`
                bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                ${selectedId === report.id ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <FileText className="h-5 w-5" />
                </div>
                {report.popular && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                {report.title}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{report.category}</p>
              <p className="text-xs text-gray-400">
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
      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Report Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Report Category
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created By
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Last Visited
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {reports.map((report) => {
          const colorClass = colorClasses[report.color] || 'bg-gray-50 text-gray-500';
          return (
            <tr
              key={report.id}
              onClick={() => onSelect(report.id)}
              className={`
                hover:bg-gray-50 transition-colors cursor-pointer
                ${selectedId === report.id ? 'bg-amber-50' : ''}
              `}
            >
              <td className="px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${colorClass}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {report.title}
                  </span>
                  {report.popular && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                      ★
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-3 text-sm text-gray-600">
                {report.category}
              </td>
              <td className="px-6 py-3 text-sm text-gray-500">
                {report.createdBy}
              </td>
              <td className="px-6 py-3 text-sm text-gray-400">
                {report.lastVisited}
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
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