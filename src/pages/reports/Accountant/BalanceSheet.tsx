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
      <div className="flex items-center justify-center h-screen themed-transition" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
          <p className="mt-4 font-medium themed-transition" style={{ color: 'var(--foreground)' }}>Loading Balance Sheet...</p>
          <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen themed-transition" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4" style={{ color: 'var(--error)' }}>⚠️</div>
          <h2 className="text-xl font-semibold themed-transition" style={{ color: 'var(--foreground)' }}>Error Loading Report</h2>
          <p className="mt-2 themed-transition" style={{ color: 'var(--foreground-secondary)' }}>{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 mx-auto themed-transition"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <div
        className="backdrop-blur-md sticky top-0 z-10 themed-transition"
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/reports')}
                className="p-2 rounded-xl transition-colors group themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl text-white shadow-lg themed-transition"
                  style={{
                    background: 'var(--primary)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1
                    className="text-xl font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {data?.title || 'Balance Sheet'}
                  </h1>
                  <p
                    className="text-sm themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    {data?.category || 'Accountant'} • As of March 31, 2026
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors themed-transition"
                style={{
                  color: 'var(--foreground-secondary)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Calendar className="h-4 w-4" />
                Date Range
              </button>
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors themed-transition"
                style={{
                  color: 'var(--foreground-secondary)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors themed-transition"
                style={{
                  color: 'var(--foreground-secondary)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors themed-transition"
                style={{
                  color: 'var(--foreground-secondary)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={refreshData}
                className="p-2 rounded-xl transition-colors themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--foreground)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--foreground-secondary)';
                }}
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
          <div
            className="backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <p className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
              Total Assets
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--info)' }}>
              ₹{reportData?.assets?.total?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" style={{ color: 'var(--success)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>↑ +8.2%</span>
            </div>
          </div>
          <div
            className="backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <p className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
              Total Liabilities
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--error)' }}>
              ₹{reportData?.liabilities?.total?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3" style={{ color: 'var(--error)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--error)' }}>↓ +4.5%</span>
            </div>
          </div>
          <div
            className="backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <p className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
              Total Equity
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--success)' }}>
              ₹{reportData?.equity?.total?.toLocaleString() || '0'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" style={{ color: 'var(--success)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>↑ +11.3%</span>
            </div>
          </div>
          <div
            className="backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <p className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
              Debt to Equity Ratio
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--gold)' }}>
              {reportData?.ratios?.debtToEquity?.toFixed(2) || '0.00'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3" style={{ color: 'var(--success)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>↓ -0.05</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheet Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div
          className="backdrop-blur-sm rounded-2xl overflow-hidden themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="p-6">
            {reportData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assets */}
                <div>
                  <h3
                    className="text-sm font-semibold mb-4 pb-2 flex items-center gap-2 themed-transition"
                    style={{
                      color: 'var(--foreground)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span className="p-1 rounded-lg" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                      <DollarSign className="h-4 w-4" />
                    </span>
                    ASSETS
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Current Assets
                      </span>
                      <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                        ₹{reportData.assets?.current?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                        Cash & Bank
                      </span>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        ₹{reportData.breakdown?.cash?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                        Accounts Receivable
                      </span>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        ₹{reportData.breakdown?.accountsReceivable?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                        Inventory
                      </span>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        ₹{reportData.breakdown?.inventory?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                        Fixed Assets
                      </span>
                      <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                        ₹{reportData.assets?.fixed?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                        Property & Equipment
                      </span>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        ₹{reportData.breakdown?.property?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                        Goodwill
                      </span>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        ₹{reportData.breakdown?.goodwill?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 mt-2 pt-2 font-bold" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground)' }}>
                        Total Assets
                      </span>
                      <span className="text-sm" style={{ color: 'var(--info)' }}>
                        ₹{reportData.assets?.total?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div>
                  <h3
                    className="text-sm font-semibold mb-4 pb-2 flex items-center gap-2 themed-transition"
                    style={{
                      color: 'var(--foreground)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span className="p-1 rounded-lg" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                      <TrendingDown className="h-4 w-4" />
                    </span>
                    LIABILITIES & EQUITY
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Current Liabilities
                      </span>
                      <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                        ₹{reportData.liabilities?.current?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                        Accounts Payable
                      </span>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        ₹{reportData.breakdown?.accountsPayable?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                        Long-term Liabilities
                      </span>
                      <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                        ₹{reportData.liabilities?.longTerm?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                        Shareholders' Equity
                      </span>
                      <span className="text-sm font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                        ₹{reportData.equity?.total?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                        Share Capital
                      </span>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        ₹{reportData.equity?.shareCapital?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pl-4">
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                        Retained Earnings
                      </span>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        ₹{reportData.equity?.retainedEarnings?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 mt-2 pt-2 font-bold" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="text-sm themed-transition" style={{ color: 'var(--foreground)' }}>
                        Total Liabilities & Equity
                      </span>
                      <span className="text-sm" style={{ color: 'var(--info)' }}>
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