// src/pages/reports/Accountant/ProfitandLoss.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Download, Printer, Share2, Calendar, RefreshCw } from 'lucide-react';
import { useReportDetail } from '../../../hooks/Reports/useReportDetail';

const ProfitandLoss: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refreshData, exportReport } = useReportDetail({
    reportId: 'profit-loss',
    autoFetch: true,
  });

  const reportData = data?.data;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Profit & Loss...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Report</h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <button onClick={refreshData} className="mt-4 px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/reports')} className="p-2 hover:bg-gray-100 rounded-xl">
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{data?.title || 'Profit & Loss'}</h1>
                  <p className="text-sm text-gray-500">{data?.category || 'Accountant'} • FY 2025-2026</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200">
                <Calendar className="h-4 w-4" /> Date Range
              </button>
              <button onClick={() => exportReport('pdf')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200">
                <Download className="h-4 w-4" /> Export
              </button>
              <button onClick={refreshData} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
          <p className="text-gray-500 text-center py-8">
            Profit & Loss data will be displayed here
          </p>
          {reportData && (
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitandLoss;