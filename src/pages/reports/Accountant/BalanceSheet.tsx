// src/pages/reports/Accountant/BalanceSheet.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText,
  RefreshCw,
  Download,
  Printer,
  Share2,
  Calendar
} from 'lucide-react';
import { useReportDetail } from '../../../hooks/Reports/useReportDetail';

const BalanceSheet: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refreshData, exportReport } = useReportDetail({
    reportId: 'balance-sheet',
    autoFetch: true,
  });

  const reportData = data?.data;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Balance Sheet...</p>
          <p className="text-sm text-gray-400">Please wait while we fetch your data</p>
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
          <button
            onClick={refreshData}
            className="mt-4 px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
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
              <button
                onClick={() => navigate('/reports')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{data?.title || 'Balance Sheet'}</h1>
                  <p className="text-sm text-gray-500">{data?.category || 'Accountant'} • As of March 31, 2026</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                <Calendar className="h-4 w-4" />
                Date Range
              </button>
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={refreshData}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 hover:shadow-xl transition-all duration-300">
            <p className="text-sm font-medium text-gray-500">Total Assets</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ₹{reportData?.assets?.total?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-green-600">↑ +8.2%</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 hover:shadow-xl transition-all duration-300">
            <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              ₹{reportData?.liabilities?.total?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-xs font-medium text-red-600">↓ +4.5%</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 hover:shadow-xl transition-all duration-300">
            <p className="text-sm font-medium text-gray-500">Total Equity</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₹{reportData?.equity?.total?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-green-600">↑ +11.3%</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 hover:shadow-xl transition-all duration-300">
            <p className="text-sm font-medium text-gray-500">Debt to Equity Ratio</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {reportData?.ratios?.debtToEquity?.toFixed(2) || '0.00'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-green-600">↓ -0.05</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheet Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
          <div className="p-6">
            {reportData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assets */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <span className="p-1 bg-blue-50 rounded-lg text-blue-500">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    ASSETS
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Current Assets</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{reportData.assets?.current?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm text-gray-500">Cash & Bank</span>
                      <span className="text-sm text-gray-700">₹{reportData.breakdown?.cash?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm text-gray-500">Accounts Receivable</span>
                      <span className="text-sm text-gray-700">₹{reportData.breakdown?.accountsReceivable?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm text-gray-500">Inventory</span>
                      <span className="text-sm text-gray-700">₹{reportData.breakdown?.inventory?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-2">
                      <span className="text-sm font-medium text-gray-900">Fixed Assets</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{reportData.assets?.fixed?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm text-gray-500">Property & Equipment</span>
                      <span className="text-sm text-gray-700">₹{reportData.breakdown?.property?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm text-gray-500">Goodwill</span>
                      <span className="text-sm text-gray-700">₹{reportData.breakdown?.goodwill?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-300 mt-2 pt-2 font-bold">
                      <span className="text-sm text-gray-900">Total Assets</span>
                      <span className="text-sm text-blue-600">
                        ₹{reportData.assets?.total?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <span className="p-1 bg-red-50 rounded-lg text-red-500">
                      <TrendingDown className="h-4 w-4" />
                    </span>
                    LIABILITIES & EQUITY
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Current Liabilities</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{reportData.liabilities?.current?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm text-gray-500">Accounts Payable</span>
                      <span className="text-sm text-gray-700">₹{reportData.breakdown?.accountsPayable?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-2">
                      <span className="text-sm font-medium text-gray-900">Long-term Liabilities</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{reportData.liabilities?.longTerm?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-2">
                      <span className="text-sm font-medium text-gray-900">Shareholders' Equity</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{reportData.equity?.total?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm text-gray-500">Share Capital</span>
                      <span className="text-sm text-gray-700">
                        ₹{reportData.equity?.shareCapital?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm text-gray-500">Retained Earnings</span>
                      <span className="text-sm text-gray-700">
                        ₹{reportData.equity?.retainedEarnings?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-300 mt-2 pt-2 font-bold">
                      <span className="text-sm text-gray-900">Total Liabilities & Equity</span>
                      <span className="text-sm text-blue-600">
                        ₹{((reportData.liabilities?.total || 0) + (reportData.equity?.total || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;