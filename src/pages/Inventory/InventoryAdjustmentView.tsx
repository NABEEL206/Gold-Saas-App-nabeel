// src/pages/Inventory/InventoryAdjustmentView.tsx
import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Package,
  Scale,
  DollarSign,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  MoreVertical,
  Upload,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../components/common/ThreeDotDropdown';
import type { ThreeDotDropdownItem } from '../../components/common/ThreeDotDropdown';
import { useInventoryAdjustmentView } from '../../hooks/inventory/useInventoryAdjustmentView';

const InventoryAdjustmentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    adjustment,
    loading,
    activeTab,
    deleteModalOpen,
    approveModalOpen,
    actionLoading,
    error,
    setActiveTab,
    setDeleteModalOpen,
    setApproveModalOpen,
    handleEdit,
    handleDelete,
    handleApprove,
    handleExport,
    handlePrint,
    handleImport,
    getStatusInfo,
    getTypeInfo,
    formatDate,
    formatDateTime,
  } = useInventoryAdjustmentView(id!);

  // Define dropdown items
  const dropdownItems: ThreeDotDropdownItem[] = [
    {
      label: 'Export as PDF',
      icon: <FileText className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: () => handleExport('pdf'),
    },
    {
      label: 'Export as Excel',
      icon: <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--success)' }} />,
      onClick: () => handleExport('excel'),
    },
    {
      label: 'Print',
      icon: <Printer className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: handlePrint,
    },
  ];

  // Add edit/delete options if draft
  if (adjustment?.status === 'draft') {
    dropdownItems.push(
      {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
        onClick: handleEdit,
      },
      {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" style={{ color: 'var(--error)' }} />,
        onClick: () => setDeleteModalOpen(true),
        danger: true,
      }
    );
  }

  // Add approve option if pending
  if (adjustment?.status === 'pending') {
    dropdownItems.push({
      label: 'Approve',
      icon: <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />,
      onClick: () => setApproveModalOpen(true),
    });
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading adjustment details..." />
      </div>
    );
  }

  if (error || !adjustment) {
    return (
      <div className="p-6">
        <div
          className="rounded-lg p-6 text-center themed-transition"
          style={{
            background: 'var(--error-light)',
            border: '1px solid var(--error)',
          }}
        >
          <AlertCircle
            className="h-12 w-12 mx-auto mb-3"
            style={{ color: 'var(--error)' }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--error)' }}
          >
            Error Loading Adjustment
          </h3>
          <p className="text-sm" style={{ color: 'var(--error)' }}>
            {error || 'Adjustment not found'}
          </p>
          <button
            onClick={() => navigate('/inventory/adjustments')}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
            style={{
              background: 'var(--error)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(adjustment.status);
  const typeInfo = getTypeInfo(adjustment.type);

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inventory/adjustments')}
            className="p-2 rounded-lg transition-colors themed-transition"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <ArrowLeft
              className="h-5 w-5 themed-transition"
              style={{ color: 'var(--foreground-secondary)' }}
            />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl font-bold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                {adjustment.adjustmentNo}
              </h1>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium themed-transition"
                style={{
                  background: statusInfo.color,
                  color: statusInfo.color,
                }}
              >
                {statusInfo.icon === 'FileText' && <FileText className="h-3 w-3" />}
                {statusInfo.icon === 'Clock' && <Clock className="h-3 w-3" />}
                {statusInfo.icon === 'CheckCircle' && <CheckCircle className="h-3 w-3" />}
                {statusInfo.label}
              </span>
            </div>
            <p
              className="text-sm mt-0.5 themed-transition"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              View adjustment details and manage inventory
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Three Dot Dropdown with all actions */}
          <ThreeDotDropdown 
            items={dropdownItems}
            position="right"
            onImport={handleImport}
            importLabel="Import Adjustment"
            importIcon={<Upload className="h-4 w-4" style={{ color: 'var(--info)' }} />}
            importAccept=".csv,.xlsx,.xls"
            importMultiple={false}
          />

          {/* Quick Action Buttons for primary actions */}
          {adjustment.status === 'draft' && (
            <>
              <button
                onClick={handleEdit}
                className="px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 themed-transition"
                style={{
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </>
          )}

          {adjustment.status === 'pending' && (
            <button
              onClick={() => setApproveModalOpen(true)}
              className="px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 themed-transition"
              style={{
                color: 'var(--success)',
                background: 'var(--success-light)',
                border: '1px solid var(--success)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mb-6 p-4 rounded-lg flex items-center gap-3 themed-transition"
          style={{
            background: 'var(--error-light)',
            border: '1px solid var(--error)',
          }}
        >
          <AlertCircle
            className="h-5 w-5 flex-shrink-0"
            style={{ color: 'var(--error)' }}
          />
          <p className="text-sm" style={{ color: 'var(--error)' }}>
            {error}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div
            className="rounded-xl shadow-sm themed-transition"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="themed-transition"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors themed-transition ${
                    activeTab === 'details'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('items')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors themed-transition ${
                    activeTab === 'items'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Items ({adjustment.items.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors themed-transition ${
                    activeTab === 'history'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  History
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-xs font-medium uppercase themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Adjustment No
                      </label>
                      <p
                        className="text-sm font-medium mt-1 themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {adjustment.adjustmentNo}
                      </p>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium uppercase themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Date
                      </label>
                      <p
                        className="text-sm font-medium mt-1 themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {formatDate(adjustment.date)}
                      </p>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium uppercase themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Type
                      </label>
                      <div className="mt-1">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
                          style={{
                            background: typeInfo.color,
                            color: typeInfo.color,
                          }}
                        >
                          {typeInfo.icon === 'Package' && <Package className="h-3 w-3" />}
                          {typeInfo.icon === 'Scale' && <Scale className="h-3 w-3" />}
                          {typeInfo.icon === 'DollarSign' && <DollarSign className="h-3 w-3" />}
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium uppercase themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Branch
                      </label>
                      <p
                        className="text-sm font-medium mt-1 flex items-center gap-1 themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <MapPin
                          className="h-3 w-3 themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                        />
                        {adjustment.branch}
                      </p>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium uppercase themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Total Items
                      </label>
                      <p
                        className="text-sm font-medium mt-1 themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {adjustment.itemCount}
                      </p>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium uppercase themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Total Value
                      </label>
                      <p
                        className="text-sm font-medium mt-1 themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        ₹{adjustment.value}
                      </p>
                    </div>
                  </div>

                  {adjustment.notes && (
                    <div>
                      <label
                        className="text-xs font-medium uppercase themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Notes
                      </label>
                      <p
                        className="text-sm mt-1 p-3 rounded-lg themed-transition"
                        style={{
                          color: 'var(--foreground)',
                          background: 'var(--surface-hover)',
                        }}
                      >
                        {adjustment.notes}
                      </p>
                    </div>
                  )}

                  {adjustment.reason && (
                    <div>
                      <label
                        className="text-xs font-medium uppercase themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      >
                        Reason
                      </label>
                      <p
                        className="text-sm mt-1 themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {adjustment.reason}
                      </p>
                    </div>
                  )}

                  <div
                    className="pt-4 themed-transition"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <h4
                      className="text-sm font-semibold mb-3 themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className="p-3 rounded-lg themed-transition"
                        style={{
                          background: 'var(--success-light)',
                        }}
                      >
                        <p
                          className="text-xs font-medium"
                          style={{ color: 'var(--success)' }}
                        >
                          Total Gain
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{ color: 'var(--success)' }}
                        >
                          +{adjustment.totalGain}
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-lg themed-transition"
                        style={{
                          background: 'var(--error-light)',
                        }}
                      >
                        <p
                          className="text-xs font-medium"
                          style={{ color: 'var(--error)' }}
                        >
                          Total Loss
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{ color: 'var(--error)' }}
                        >
                          -{adjustment.totalLoss}
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-lg themed-transition"
                        style={{
                          background: 'var(--info-light)',
                        }}
                      >
                        <p
                          className="text-xs font-medium"
                          style={{ color: 'var(--info)' }}
                        >
                          Net Change
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{
                            color: adjustment.totalGain - adjustment.totalLoss >= 0 
                              ? 'var(--success)' 
                              : 'var(--error)',
                          }}
                        >
                          {adjustment.totalGain - adjustment.totalLoss >= 0 ? '+' : ''}
                          {adjustment.totalGain - adjustment.totalLoss}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Tab */}
              {activeTab === 'items' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead
                      className="themed-transition"
                      style={{ background: 'var(--surface-hover)' }}
                    >
                      <tr>
                        <th
                          className="px-3 py-2 text-left text-xs font-medium uppercase themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                        >
                          Item
                        </th>
                        <th
                          className="px-3 py-2 text-left text-xs font-medium uppercase themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                        >
                          Category
                        </th>
                        <th
                          className="px-3 py-2 text-right text-xs font-medium uppercase themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                        >
                          Previous
                        </th>
                        <th
                          className="px-3 py-2 text-right text-xs font-medium uppercase themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                        >
                          Adjusted
                        </th>
                        <th
                          className="px-3 py-2 text-right text-xs font-medium uppercase themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                        >
                          New
                        </th>
                        <th
                          className="px-3 py-2 text-right text-xs font-medium uppercase themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                        >
                          Difference
                        </th>
                        <th
                          className="px-3 py-2 text-left text-xs font-medium uppercase themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                        >
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y themed-transition"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {adjustment.items.map((item) => {
                        const diff = item.difference || 0;
                        return (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <div>
                                <p
                                  className="font-medium themed-transition"
                                  style={{ color: 'var(--foreground)' }}
                                >
                                  {item.itemName}
                                </p>
                                <p
                                  className="text-xs themed-transition"
                                  style={{ color: 'var(--foreground-secondary)' }}
                                >
                                  {item.itemCode}
                                </p>
                              </div>
                            </td>
                            <td
                              className="px-3 py-2 text-xs themed-transition"
                              style={{ color: 'var(--foreground-secondary)' }}
                            >
                              {item.category}
                            </td>
                            <td
                              className="px-3 py-2 text-right themed-transition"
                              style={{ color: 'var(--foreground-secondary)' }}
                            >
                              {adjustment.type === 'quantity' && item.previousQuantity}
                              {adjustment.type === 'weight' && item.previousWeight}
                              {adjustment.type === 'value' && item.previousValue}
                            </td>
                            <td
                              className="px-3 py-2 text-right themed-transition"
                              style={{ color: 'var(--foreground-secondary)' }}
                            >
                              {adjustment.type === 'quantity' && item.adjustedQuantity}
                              {adjustment.type === 'weight' && item.adjustedWeight}
                              {adjustment.type === 'value' && item.adjustedValue}
                            </td>
                            <td
                              className="px-3 py-2 text-right font-medium themed-transition"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {adjustment.type === 'quantity' && item.newQuantity}
                              {adjustment.type === 'weight' && item.newWeight}
                              {adjustment.type === 'value' && item.newValue}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span
                                className="font-medium"
                                style={{
                                  color: diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--error)' : 'var(--foreground-tertiary)',
                                }}
                              >
                                {diff > 0 ? '+' : ''}{diff}
                              </span>
                            </td>
                            <td
                              className="px-3 py-2 text-xs max-w-xs themed-transition"
                              style={{ color: 'var(--foreground-secondary)' }}
                            >
                              {item.reason || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div
                    className="flex items-start gap-3 pb-4 themed-transition"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <div
                      className="p-2 rounded-lg themed-transition"
                      style={{ background: 'var(--info-light)' }}
                    >
                      <FileText className="h-4 w-4" style={{ color: 'var(--info)' }} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Adjustment Created
                      </p>
                      <p
                        className="text-xs themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        By {adjustment.createdBy} at {formatDateTime(adjustment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {adjustment.status === 'adjusted' && adjustment.approvedBy && (
                    <div
                      className="flex items-start gap-3 pb-4 themed-transition"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <div
                        className="p-2 rounded-lg themed-transition"
                        style={{ background: 'var(--success-light)' }}
                      >
                        <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium themed-transition"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Adjustment Approved
                        </p>
                        <p
                          className="text-xs themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          By {adjustment.approvedBy} at {formatDateTime(adjustment.approvedAt || '')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg themed-transition"
                      style={{ background: 'var(--surface-hover)' }}
                    >
                      <Clock className="h-4 w-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Last Modified
                      </p>
                      <p
                        className="text-xs themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        at {formatDateTime(adjustment.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-lg mt-4 themed-transition"
                    style={{ background: 'var(--surface-hover)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Info
                        className="h-4 w-4 themed-transition"
                        style={{ color: 'var(--foreground-tertiary)' }}
                      />
                      <p
                        className="text-xs themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        Status: <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {statusInfo.label}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Status Card */}
          <div
            className="rounded-xl p-6 themed-transition"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              Status
            </h3>
            <div
              className="p-4 rounded-lg themed-transition"
              style={{
                background: statusInfo.color,
                color: statusInfo.color,
              }}
            >
              <div className="flex items-center gap-2">
                {statusInfo.icon === 'FileText' && <FileText className="h-5 w-5" />}
                {statusInfo.icon === 'Clock' && <Clock className="h-5 w-5" />}
                {statusInfo.icon === 'CheckCircle' && <CheckCircle className="h-5 w-5" />}
                <span className="font-medium">{statusInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Created By Card */}
          <div
            className="rounded-xl p-6 themed-transition"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              Created By
            </h3>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center themed-transition"
                style={{ background: 'var(--surface-hover)' }}
              >
                <User className="h-5 w-5" style={{ color: 'var(--foreground-tertiary)' }} />
              </div>
              <div>
                <p
                  className="text-sm font-medium themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  {adjustment.createdBy}
                </p>
                <p
                  className="text-xs themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {formatDateTime(adjustment.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {adjustment.status === 'draft' && (
            <div
              className="rounded-xl p-4 themed-transition"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p
                className="text-xs text-center themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                This adjustment is in draft mode
              </p>
              <div className="mt-2 space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 themed-transition"
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
                  <Edit className="h-4 w-4" />
                  Edit Adjustment
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 themed-transition"
                  style={{
                    color: 'var(--error)',
                    border: '1px solid var(--error)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--error-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Adjustment
                </button>
              </div>
            </div>
          )}

          {adjustment.status === 'pending' && (
            <div
              className="rounded-xl p-4 themed-transition"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p
                className="text-xs text-center themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Awaiting approval
              </p>
              <button
                onClick={() => setApproveModalOpen(true)}
                className="w-full mt-2 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 themed-transition"
                style={{
                  background: 'var(--success)',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <CheckCircle className="h-4 w-4" />
                Approve Adjustment
              </button>
            </div>
          )}

          {adjustment.status === 'adjusted' && (
            <div
              className="rounded-xl p-4 themed-transition"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ color: 'var(--success)' }}
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Approved</span>
              </div>
              <p
                className="text-xs mt-1 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                This adjustment has been approved and applied
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            className="rounded-xl shadow-xl max-w-md w-full themed-transition"
            style={{
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-full themed-transition"
                  style={{ background: 'var(--error-light)' }}
                >
                  <Trash2 className="h-6 w-6" style={{ color: 'var(--error)' }} />
                </div>
                <h3
                  className="text-lg font-semibold themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Delete Adjustment
                </h3>
              </div>
              <p
                className="text-sm mb-6 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Are you sure you want to delete adjustment{' '}
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                  {adjustment.adjustmentNo}
                </span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors themed-transition"
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
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 themed-transition"
                  style={{
                    background: 'var(--error)',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) {
                      e.currentTarget.style.opacity = '0.8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setApproveModalOpen(false)}
        >
          <div
            className="rounded-xl shadow-xl max-w-md w-full themed-transition"
            style={{
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-full themed-transition"
                  style={{ background: 'var(--success-light)' }}
                >
                  <CheckCircle className="h-6 w-6" style={{ color: 'var(--success)' }} />
                </div>
                <h3
                  className="text-lg font-semibold themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Approve Adjustment
                </h3>
              </div>
              <p
                className="text-sm mb-4 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Are you sure you want to approve adjustment{' '}
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                  {adjustment.adjustmentNo}
                </span>?
                This will apply the changes to inventory.
              </p>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Approval Notes (Optional)
                </label>
                <textarea
                  id="approvalNotes"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none themed-transition"
                  style={{
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Add any notes about this approval..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setApproveModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors themed-transition"
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
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const notes = (document.getElementById('approvalNotes') as HTMLTextAreaElement)?.value;
                    handleApprove({ notes });
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 themed-transition"
                  style={{
                    background: 'var(--success)',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) {
                      e.currentTarget.style.opacity = '0.8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAdjustmentView;