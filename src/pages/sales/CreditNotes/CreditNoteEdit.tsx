// src/pages/sales/CreditNotes/CreditNoteEdit.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Receipt,
  Users,
  FileText,
  AlertCircle,
  Send,
  Trash2,
} from 'lucide-react';
import { useCreditNote } from '../../../hooks/CreditNote/useCreditNote';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';
import type { CreditNote } from '../../../types/creditNote/CreditNoteTypes';

// ─── Static data ──────────────────────────────────────────────────────────────

const DEMO_CUSTOMERS = [
  { id: '1', name: 'Rajesh Jewelers',  email: 'rajesh@jewelers.com', phone: '+91-98765-43210', gst: '22AAAAA0000A1Z5' },
  { id: '2', name: 'Priya Gold House', email: 'priya@goldhouse.com',  phone: '+91-98765-43211', gst: '22BBBBB0000B1Z5' },
  { id: '3', name: 'Suresh Gold Mart', email: 'suresh@goldmart.com',  phone: '+91-98765-43212', gst: '22CCCCC0000C1Z5' },
  { id: '4', name: 'Meera Jewel World',email: 'meera@jewelworld.com', phone: '+91-98765-43213', gst: '22DDDDD0000D1Z5' },
];

const DEMO_INVOICES = [
  { id: '1', number: 'INV-000001', amount: 29500 },
  { id: '2', number: 'INV-000002', amount: 50445 },
  { id: '3', number: 'INV-000003', amount: 37760 },
  { id: '4', number: 'INV-000004', amount: 12862 },
];

const DEMO_ITEMS = [
  { id: '1', name: 'Gold Ring',     code: 'GR-001', purity: '22K', price: 7500, unit: 'Pcs' },
  { id: '2', name: 'Gold Chain',    code: 'GC-001', purity: '22K', price: 4500, unit: 'Pcs' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', purity: '22K', price: 3200, unit: 'Pcs' },
  { id: '4', name: 'Diamond Ring',  code: 'DR-001', purity: '18K', price: 8500, unit: 'Pcs' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', purity: '22K', price: 3800, unit: 'Pcs' },
];

// ─── Dropdown option lists ────────────────────────────────────────────────────

const CUSTOMER_OPTIONS: DropdownOption[] = DEMO_CUSTOMERS.map(c => ({
  value: c.id,
  label: c.name,
  group: 'Customers',
}));

const INVOICE_OPTIONS: DropdownOption[] = DEMO_INVOICES.map(inv => ({
  value: inv.id,
  label: `${inv.number} — ₹${inv.amount.toLocaleString()}`,
  group: 'Invoices',
}));

const REASON_OPTIONS: DropdownOption[] = [
  { value: 'Product damaged during shipping',       label: 'Product damaged during shipping' },
  { value: 'Quality issue - incorrect purity',      label: 'Quality issue — incorrect purity' },
  { value: 'Customer requested cancellation',       label: 'Customer requested cancellation' },
  { value: 'Wrong item delivered',                  label: 'Wrong item delivered' },
  { value: 'Price mismatch',                        label: 'Price mismatch' },
  { value: 'Other',                                 label: 'Other' },
];

// ─── Generate dummy credit note data ─────────────────────────────────────────

const generateDummyCreditNote = (id: string): CreditNote | null => {
  const dummyCreditNotes: Record<string, CreditNote> = {
    '1': {
      id: '1',
      creditNoteNumber: 'CN-2024-001',
      creditNoteDate: new Date().toISOString().split('T')[0],
      customerId: '1',
      customerName: 'Rajesh Jewelers',
      customerEmail: 'rajesh@jewelers.com',
      customerPhone: '+91-98765-43210',
      customerGst: '22AAAAA0000A1Z5',
      invoiceId: '1',
      invoiceNumber: 'INV-000001',
      items: [
        {
          id: 'item1',
          creditNoteId: '1',
          itemName: 'Gold Chain',
          description: '22K Gold Chain with pendant',
          quantity: 1,
          unit: 'Pcs',
          rate: 4500,
          discount: 0,
          taxRate: 18,
          taxAmount: 810,
          total: 5310,
          purity: '22K',
          weight: 5.5,
          makingCharges: 400,
        },
      ],
      subtotal: 4500,
      taxRate: 18,
      taxAmount: 810,
      discount: 0,
      discountType: 'percentage',
      total: 5310,
      reason: 'Product damaged during shipping',
      status: 'draft',
      notes: 'Customer returned damaged item',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    '2': {
      id: '2',
      creditNoteNumber: 'CN-2024-002',
      creditNoteDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: '2',
      customerName: 'Priya Gold House',
      customerEmail: 'priya@goldhouse.com',
      customerPhone: '+91-98765-43211',
      customerGst: '22BBBBB0000B1Z5',
      invoiceId: '2',
      invoiceNumber: 'INV-000002',
      items: [
        {
          id: 'item2',
          creditNoteId: '2',
          itemName: 'Gold Earrings',
          description: '22K Gold Earrings with pearl',
          quantity: 2,
          unit: 'Pcs',
          rate: 3200,
          discount: 0,
          taxRate: 18,
          taxAmount: 1152,
          total: 7552,
          purity: '22K',
          weight: 6.8,
          makingCharges: 400,
        },
      ],
      subtotal: 6400,
      taxRate: 18,
      taxAmount: 1152,
      discount: 0,
      discountType: 'percentage',
      total: 7552,
      reason: 'Quality issue - incorrect purity',
      status: 'draft',
      notes: 'Customer complained about purity mismatch',
      createdBy: 'admin',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };

  return dummyCreditNotes[id] || null;
};

// ─── Component ────────────────────────────────────────────────────────────────

const CreditNoteEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditNote, updateCreditNote, deleteCreditNote, loading: hookLoading, saving: hookSaving } = useCreditNote();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalCreditNote, setOriginalCreditNote] = useState<CreditNote | null>(null);

  // Use the toast and confirm hook
  const {
    success,
    error: showError,
    warning,
    withConfirmation,
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const [formData, setFormData] = useState({
    customerId:     '',
    customerName:   '',
    customerEmail:  '',
    customerPhone:  '',
    customerGst:    '',
    invoiceId:      '',
    invoiceNumber:  '',
    creditNoteDate: new Date().toISOString().split('T')[0],
    reason:         '',
    notes:          '',
    status: 'draft',
  });

  const [items, setItems]                   = useState<ItemSelectionItem[]>([]);
  const [productSearch, setProductSearch]   = useState('');
  const [productSuggestions]                = useState(DEMO_ITEMS);

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load credit note data
  useEffect(() => {
    if (id) {
      loadCreditNote(id);
    } else {
      showError('Invalid credit note ID');
      navigate('/sales/credit-notes');
    }
  }, [id]);

  const loadCreditNote = async (creditNoteId: string) => {
    setLoading(true);
    try {
      const data = await getCreditNote(creditNoteId) as CreditNote;
      if (data) {
        setOriginalCreditNote(data);
        // Populate form with credit note data
        setFormData({
          customerId:     data.customerId || '',
          customerName:   data.customerName || '',
          customerEmail:  data.customerEmail || '',
          customerPhone:  data.customerPhone || '',
          customerGst:    data.customerGst || '',
          invoiceId:      data.invoiceId || '',
          invoiceNumber:  data.invoiceNumber || '',
          creditNoteDate: data.creditNoteDate || new Date().toISOString().split('T')[0],
          reason:         data.reason || '',
          notes:          data.notes || '',
          status:         data.status || 'draft',
        });
        
        // Convert items to ItemSelectionItem format
        const formattedItems: ItemSelectionItem[] = data.items.map(item => ({
          productId: item.id || `item_${Date.now()}`,
          productName: item.itemName || '',
          description: item.description || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'Pcs',
          rate: item.rate || 0,
          discount: item.discount || 0,
          discountType: 'percentage',
          taxRate: item.taxRate || 18,
          taxAmount: item.taxAmount || 0,
          total: item.total || 0,
          purity: item.purity || '22K',
          weight: item.weight,
          makingCharges: item.makingCharges,
        }));
        setItems(formattedItems);
        
        // Set initial snapshot after form is populated
        setTimeout(() => {
          initialSnapshotRef.current = JSON.stringify({ formData, items: formattedItems });
          setHasChanges(false);
        }, 0);
      } else {
        // Fallback to dummy data if API returns nothing
        const dummyData = generateDummyCreditNote(creditNoteId);
        if (dummyData) {
          setOriginalCreditNote(dummyData);
          setFormData({
            customerId:     dummyData.customerId || '',
            customerName:   dummyData.customerName || '',
            customerEmail:  dummyData.customerEmail || '',
            customerPhone:  dummyData.customerPhone || '',
            customerGst:    dummyData.customerGst || '',
            invoiceId:      dummyData.invoiceId || '',
            invoiceNumber:  dummyData.invoiceNumber || '',
            creditNoteDate: dummyData.creditNoteDate || new Date().toISOString().split('T')[0],
            reason:         dummyData.reason || '',
            notes:          dummyData.notes || '',
            status:         dummyData.status || 'draft',
          });
          
          const formattedItems: ItemSelectionItem[] = dummyData.items.map(item => ({
            productId: item.id || `item_${Date.now()}`,
            productName: item.itemName || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            unit: item.unit || 'Pcs',
            rate: item.rate || 0,
            discount: item.discount || 0,
            discountType: 'percentage',
            taxRate: item.taxRate || 18,
            taxAmount: item.taxAmount || 0,
            total: item.total || 0,
            purity: item.purity || '22K',
            weight: item.weight,
            makingCharges: item.makingCharges,
          }));
          setItems(formattedItems);
          
          setTimeout(() => {
            initialSnapshotRef.current = JSON.stringify({ formData, items: formattedItems });
            setHasChanges(false);
          }, 0);
          warning('Loaded demo data for editing. Some features may be limited.');
        } else {
          showError('Credit note not found');
          navigate('/sales/credit-notes');
        }
      }
    } catch (error) {
      console.error('Error loading credit note:', error);
      // Try dummy data on error
      const dummyData = generateDummyCreditNote(creditNoteId);
      if (dummyData) {
        setOriginalCreditNote(dummyData);
        setFormData({
          customerId:     dummyData.customerId || '',
          customerName:   dummyData.customerName || '',
          customerEmail:  dummyData.customerEmail || '',
          customerPhone:  dummyData.customerPhone || '',
          customerGst:    dummyData.customerGst || '',
          invoiceId:      dummyData.invoiceId || '',
          invoiceNumber:  dummyData.invoiceNumber || '',
          creditNoteDate: dummyData.creditNoteDate || new Date().toISOString().split('T')[0],
          reason:         dummyData.reason || '',
          notes:          dummyData.notes || '',
          status:         dummyData.status || 'draft',
        });
        
        const formattedItems: ItemSelectionItem[] = dummyData.items.map(item => ({
          productId: item.id || `item_${Date.now()}`,
          productName: item.itemName || '',
          description: item.description || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'Pcs',
          rate: item.rate || 0,
          discount: item.discount || 0,
          discountType: 'percentage',
          taxRate: item.taxRate || 18,
          taxAmount: item.taxAmount || 0,
          total: item.total || 0,
          purity: item.purity || '22K',
          weight: item.weight,
          makingCharges: item.makingCharges,
        }));
        setItems(formattedItems);
        
        setTimeout(() => {
          initialSnapshotRef.current = JSON.stringify({ formData, items: formattedItems });
          setHasChanges(false);
        }, 0);
        showError('Failed to load credit note details. Loaded demo data instead.');
      } else {
        showError('Failed to load credit note details.');
        navigate('/sales/credit-notes');
      }
    } finally {
      setLoading(false);
    }
  };

  // Track changes
  useEffect(() => {
    if (initialSnapshotRef.current !== null && !loading) {
      const currentSnapshot = JSON.stringify({ formData, items });
      setHasChanges(currentSnapshot !== initialSnapshotRef.current);
    }
  }, [formData, items, loading]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCustomerSelect = (option: DropdownOption) => {
    const customer = DEMO_CUSTOMERS.find(c => c.id === option.value);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId:    customer.id,
        customerName:  customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerGst:   customer.gst,
      }));
      setErrors(prev => { const e = { ...prev }; delete e.customerId; return e; });
    }
  };

  const handleInvoiceSelect = (option: DropdownOption) => {
    const invoice = DEMO_INVOICES.find(inv => inv.id === option.value);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        invoiceId:     invoice.id,
        invoiceNumber: invoice.number,
      }));
    }
  };

  const handleReasonSelect = (option: DropdownOption) => {
    setFormData(prev => ({ ...prev, reason: option.value }));
    setErrors(prev => { const e = { ...prev }; delete e.reason; return e; });
  };

  const handleItemsChange = (newItems: ItemSelectionItem[]) => setItems(newItems);

  const handleAddCustomItem = () => {
    setItems(prev => [
      ...prev,
      {
        productId:    `custom_${Date.now()}`,
        productName:  '',
        description:  '',
        quantity:     1,
        unit:         'Pcs',
        rate:         0,
        discount:     0,
        discountType: 'percentage',
        taxRate:      18,
        taxAmount:    0,
        total:        0,
        purity:       '22K',
      },
    ]);
  };

  // ── Totals ───────────────────────────────────────────────────────────────────

  const calculateTotals = () => {
    let subtotal = 0, taxAmount = 0, totalDiscount = 0;
    items.forEach(item => {
      const base = (item.quantity || 1) * (item.rate || 0);
      subtotal += base;
      const disc = item.discountType === 'fixed'
        ? (item.discount || 0)
        : base * ((item.discount || 0) / 100);
      totalDiscount += disc;
      taxAmount += (base - disc) * ((item.taxRate || 18) / 100);
    });
    return { subtotal, totalDiscount, taxAmount, total: subtotal - totalDiscount + taxAmount };
  };

  const totals = calculateTotals();

  // ── Submit ───────────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.customerId) e.customerId = 'Customer is required';
    if (!formData.reason)     e.reason     = 'Reason is required';
    if (items.length === 0)   e.items      = 'At least one item is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'sent') => {
    if (!validateForm()) {
      showError('Please fix the validation errors before submitting.');
      return;
    }
    
    if (!id) {
      showError('Invalid credit note ID');
      return;
    }

    const actionLabel = status === 'draft' ? 'Saving draft' : 'Sending credit note';
    
    await withLoading(
      async () => {
        await updateCreditNote(id, {
          ...formData,
          items: items.map(item => ({
            ...item,
            total: (item.quantity || 1) * (item.rate || 0),
          })),
          subtotal:   totals.subtotal,
          taxAmount:  totals.taxAmount,
          discount:   totals.totalDiscount,
          total:      totals.total,
          status,
        });
        // Small delay to show success before navigation
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/sales/credit-notes/${id}/view`);
      },
      `${actionLabel}...`,
      status === 'draft' 
        ? 'Credit note updated and saved as draft successfully.' 
        : 'Credit note updated and sent successfully.',
      'Failed to update credit note. Please try again.'
    );
  };

  // Cancel handler with unsaved changes confirmation
  const handleCancel = async () => {
    if (!hasChanges) {
      navigate(`/sales/credit-notes/${id}/view`);
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate(`/sales/credit-notes/${id}/view`);
      }
    );
  };

  // Reset form to original state
  const handleReset = async () => {
    if (!hasChanges) {
      warning('No changes to reset.');
      return;
    }

    await withConfirmation(
      {
        title: 'Reset Form',
        message: 'Are you sure you want to reset all changes to the original credit note data?',
        confirmText: 'Reset',
        variant: 'warning',
      },
      async () => {
        if (originalCreditNote) {
          setFormData({
            customerId:     originalCreditNote.customerId || '',
            customerName:   originalCreditNote.customerName || '',
            customerEmail:  originalCreditNote.customerEmail || '',
            customerPhone:  originalCreditNote.customerPhone || '',
            customerGst:    originalCreditNote.customerGst || '',
            invoiceId:      originalCreditNote.invoiceId || '',
            invoiceNumber:  originalCreditNote.invoiceNumber || '',
            creditNoteDate: originalCreditNote.creditNoteDate || new Date().toISOString().split('T')[0],
            reason:         originalCreditNote.reason || '',
            notes:          originalCreditNote.notes || '',
            status:         originalCreditNote.status || 'draft',
          });
          
          const formattedItems: ItemSelectionItem[] = originalCreditNote.items.map(item => ({
            productId: item.id || `item_${Date.now()}`,
            productName: item.itemName || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            unit: item.unit || 'Pcs',
            rate: item.rate || 0,
            discount: item.discount || 0,
            discountType: 'percentage',
            taxRate: item.taxRate || 18,
            taxAmount: item.taxAmount || 0,
            total: item.total || 0,
            purity: item.purity || '22K',
            weight: item.weight,
            makingCharges: item.makingCharges,
          }));
          setItems(formattedItems);
          setErrors({});
          initialSnapshotRef.current = JSON.stringify({ formData, items: formattedItems });
          setHasChanges(false);
          success('Form reset to original credit note data.');
        }
      }
    );
  };

  // Delete credit note handler
  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Credit Note',
        message: 'Are you sure you want to delete this credit note? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteCreditNote(id);
            navigate('/sales/credit-notes');
          },
          'Deleting credit note...',
          'Credit note deleted successfully.',
          'Failed to delete credit note. Please try again.'
        );
      }
    );
  };

  // ── Columns config ───────────────────────────────────────────────────────────

  const creditNoteColumns = {
    item: true, purity: true, description: true,
    qty: true, unit: true, rate: true,
    discount: true, tax: true, amount: true, action: true,
  };

  // ── Loading guard ─────────────────────────────────────────────────────────────

  if (loading || hookLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading credit note data..." />
      </div>
    );
  }

  if (!originalCreditNote) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Credit Note not found</p>
          <button
            onClick={() => navigate('/sales/credit-notes')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Credit Notes
          </button>
        </div>
      </div>
    );
  }

  // Show warning if credit note is not in draft status
  const isEditable = originalCreditNote.status === 'draft';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="h-6 w-6 text-amber-500" />
                Edit Credit Note
              </h1>
              <p className="text-sm text-gray-500">
                Editing {originalCreditNote.creditNoteNumber} - {originalCreditNote.customerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditable && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                <AlertCircle className="h-4 w-4" />
                <span>Read-only: Credit note not in draft</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              title="Delete credit note"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || !isEditable}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset changes"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={saving || hookSaving || !isEditable || !hasChanges}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={!isEditable ? 'Only draft credit notes can be edited' : ''}
            >
              {saving || hookSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('sent')}
              disabled={saving || hookSaving || !isEditable || !hasChanges}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={!isEditable ? 'Only draft credit notes can be edited' : ''}
            >
              {saving || hookSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Update & Send
                </>
              )}
            </button>
          </div>
        </div>

        {/* Read-only warning */}
        {!isEditable && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Credit note is not in draft status</p>
              <p className="text-sm text-yellow-700 mt-1">
                Only draft credit notes can be edited. This credit note is currently marked as <strong>{originalCreditNote.status}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form className="space-y-6">

          {/* ── Customer Details ── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Customer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={CUSTOMER_OPTIONS}
                  value={formData.customerId || null}
                  onChange={handleCustomerSelect}
                  placeholder="Search customer..."
                  triggerPlaceholder="Select a customer..."
                  showEmptyState
                  emptyStateText="No customers found"
                  resetSearchOnOpen
                  disabled={!isEditable}
                />
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.customerId}
                  </p>
                )}
              </div>

              {/* Invoice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invoice (Optional)
                </label>
                <SearchableDropdown
                  options={INVOICE_OPTIONS}
                  value={formData.invoiceId || null}
                  onChange={handleInvoiceSelect}
                  placeholder="Search invoice..."
                  triggerPlaceholder="Select an invoice..."
                  showEmptyState
                  emptyStateText="No invoices found"
                  resetSearchOnOpen
                  disabled={!isEditable}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Credit Note Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.creditNoteDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditNoteDate: e.target.value }))}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    !isEditable ? 'bg-gray-50' : 'bg-white'
                  }`}
                  disabled={!isEditable}
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={REASON_OPTIONS}
                  value={formData.reason || null}
                  onChange={handleReasonSelect}
                  placeholder="Search reason..."
                  triggerPlaceholder="Select reason..."
                  showEmptyState
                  emptyStateText="No matching reasons"
                  resetSearchOnOpen
                  disabled={!isEditable}
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Customer info card */}
            {formData.customerName && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="font-medium text-gray-900">{formData.customerName}</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {formData.customerEmail} | {formData.customerPhone}
                </p>
                {formData.customerGst && (
                  <p className="text-sm text-gray-500 mt-0.5">GST: {formData.customerGst}</p>
                )}
              </div>
            )}
          </div>

          {/* ── Items ── */}
          <div className="relative">
            <ItemSelectionTable
              items={items}
              onItemsChange={handleItemsChange}
              productSuggestions={productSuggestions}
              productSearch={productSearch}
              onProductSearchChange={setProductSearch}
              onAddCustomItem={handleAddCustomItem}
              errors={errors}
              columns={creditNoteColumns}
              showPurity
              showDescription
              showUnit
              showDiscount
              showTax
              showSubtotalSection
              showTotalSection
              searchPlaceholder="Search items..."
              addButtonLabel="Add Item"
              title="Items"
              additionalCharges={[]}
              autoAddDefaultRow
              addButtonAtBottom
            />
            {!isEditable && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Items cannot be edited for non-draft credit notes
              </div>
            )}
          </div>

          {errors.items && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.items}
            </p>
          )}

          {/* ── Notes ── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Notes
            </h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none ${
                !isEditable ? 'bg-gray-50' : 'bg-white'
              }`}
              placeholder="Enter any additional notes..."
              disabled={!isEditable}
            />
          </div>

          {/* Form Actions - Mobile */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-6 md:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={saving || hookSaving || !isEditable || !hasChanges}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving || hookSaving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('sent')}
                disabled={saving || hookSaving || !isEditable || !hasChanges}
                className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving || hookSaving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={onModalCancel}
        onConfirm={onModalConfirm}
        title={modalOptions?.title}
        message={modalOptions?.message ?? ''}
        confirmText={modalOptions?.confirmText}
        cancelText={modalOptions?.cancelText}
        variant={modalOptions?.variant}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default CreditNoteEdit;