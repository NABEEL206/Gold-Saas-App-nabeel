// src/pages/sales/CreditNotes/CreditNoteEdit.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import ErrorSummary from '../../../components/common/ErrorSummary';
import {
  validateCreditNoteForm,
  formatValidationErrors,
  type ValidationResult,
} from '../../../validations/creditNote.validation';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';
import type { CreditNote } from '../../../types/creditNote/CreditNoteTypes';

// ============================================================
// CONSTANTS - Single source of truth (shared with Create page)
// ============================================================

// Customer data
const DEMO_CUSTOMERS = [
  { id: '1', name: 'Rajesh Jewelers',  email: 'rajesh@jewelers.com', phone: '+91-98765-43210', gst: '22AAAAA0000A1Z5' },
  { id: '2', name: 'Priya Gold House', email: 'priya@goldhouse.com',  phone: '+91-98765-43211', gst: '22BBBBB0000B1Z5' },
  { id: '3', name: 'Suresh Gold Mart', email: 'suresh@goldmart.com',  phone: '+91-98765-43212', gst: '22CCCCC0000C1Z5' },
  { id: '4', name: 'Meera Jewel World',email: 'meera@jewelworld.com', phone: '+91-98765-43213', gst: '22DDDDD0000D1Z5' },
];

// Invoice data
const DEMO_INVOICES = [
  { id: '1', number: 'INV-000001', amount: 29500 },
  { id: '2', number: 'INV-000002', amount: 50445 },
  { id: '3', number: 'INV-000003', amount: 37760 },
  { id: '4', number: 'INV-000004', amount: 12862 },
];

// Product/Item data
const DEMO_ITEMS = [
  { id: '1', name: 'Gold Ring',     code: 'GR-001', purity: '22K', price: 7500, unit: 'Pcs' },
  { id: '2', name: 'Gold Chain',    code: 'GC-001', purity: '22K', price: 4500, unit: 'Pcs' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', purity: '22K', price: 3200, unit: 'Pcs' },
  { id: '4', name: 'Diamond Ring',  code: 'DR-001', purity: '18K', price: 8500, unit: 'Pcs' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', purity: '22K', price: 3800, unit: 'Pcs' },
];

// Predefined reason options
const REASON_OPTIONS: DropdownOption[] = [
  { value: 'Product damaged during shipping',       label: 'Product damaged during shipping' },
  { value: 'Quality issue - incorrect purity',      label: 'Quality issue — incorrect purity' },
  { value: 'Customer requested cancellation',       label: 'Customer requested cancellation' },
  { value: 'Wrong item delivered',                  label: 'Wrong item delivered' },
  { value: 'Price mismatch',                        label: 'Price mismatch' },
  { value: 'Other',                                 label: 'Other' },
];

// Dropdown option lists
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

// ─── Dummy credit note data ─────────────────────────────────────────────────

const DUMMY_CREDIT_NOTES: Record<string, CreditNote> = {
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

// Helper function to get dummy credit note
const getDummyCreditNote = (id: string): CreditNote | null => {
  return DUMMY_CREDIT_NOTES[id] || null;
};

// ─── Component ────────────────────────────────────────────────────────────────

const CreditNoteEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditNote, updateCreditNote, deleteCreditNote, loading: hookLoading, saving: hookSaving } = useCreditNote();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });
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

  const loadCreditNote = useCallback(async (creditNoteId: string) => {
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
        const dummyData = getDummyCreditNote(creditNoteId);
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
      const dummyData = getDummyCreditNote(creditNoteId);
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
  }, [getCreditNote, showError, warning, navigate]);

  // Track changes
  useEffect(() => {
    if (initialSnapshotRef.current !== null && !loading) {
      const currentSnapshot = JSON.stringify({ formData, items });
      setHasChanges(currentSnapshot !== initialSnapshotRef.current);
    }
  }, [formData, items, loading]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCustomerSelect = useCallback((option: DropdownOption) => {
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
  }, []);

  const handleInvoiceSelect = useCallback((option: DropdownOption) => {
    const invoice = DEMO_INVOICES.find(inv => inv.id === option.value);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        invoiceId:     invoice.id,
        invoiceNumber: invoice.number,
      }));
    }
  }, []);

  const handleReasonSelect = useCallback((option: DropdownOption) => {
    setFormData(prev => ({ ...prev, reason: option.value }));
    setErrors(prev => { const e = { ...prev }; delete e.reason; return e; });
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  }, []);

  const handleItemsChange = useCallback((newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    setErrors(prev => { const e = { ...prev }; delete e.items; return e; });
  }, []);

  const handleAddCustomItem = useCallback(() => {
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
    setErrors(prev => { const e = { ...prev }; delete e.items; return e; });
  }, []);

  // ── Totals ───────────────────────────────────────────────────────────────────

  const calculateTotals = useCallback(() => {
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
  }, [items]);

  const totals = calculateTotals();

  // ── Submit ───────────────────────────────────────────────────────────────────

  const validateForm = useCallback((): boolean => {
    const result = validateCreditNoteForm(formData, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, items]);

  const handleSubmit = useCallback(async (status: 'draft' | 'sent') => {
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
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/sales/credit-notes/${id}/view`);
      },
      `${actionLabel}...`,
      status === 'draft' 
        ? 'Credit note updated and saved as draft successfully.' 
        : 'Credit note updated and sent successfully.',
      'Failed to update credit note. Please try again.'
    );
  }, [formData, items, totals, id, validateForm, showError, withLoading, updateCreditNote, navigate]);

  // Cancel handler with unsaved changes confirmation
  const handleCancel = useCallback(async () => {
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
  }, [hasChanges, withConfirmation, navigate, id]);

  // Reset form to original state
  const handleReset = useCallback(async () => {
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
          setValidationResult({
            isValid: true,
            errors: {},
            itemErrors: [],
          });
          initialSnapshotRef.current = JSON.stringify({ formData, items: formattedItems });
          setHasChanges(false);
          success('Form reset to original credit note data.');
        }
      }
    );
  }, [hasChanges, withConfirmation, originalCreditNote, warning, success]);

  // Delete credit note handler
  const handleDelete = useCallback(async () => {
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
  }, [id, withConfirmation, withLoading, deleteCreditNote, navigate]);

  // ── Columns config ───────────────────────────────────────────────────────────

  const creditNoteColumns = [
    { key: 'item', label: 'Item', width: 'min-w-[180px] max-w-[220px]' },
    { key: 'purity', label: 'Purity', width: 'w-28' },
    { key: 'description', label: 'Description', width: 'w-32' },
    { key: 'qty', label: 'Qty', width: 'w-24' },
    { key: 'unit', label: 'Unit', width: 'w-16' },
    { key: 'rate', label: 'Rate', width: 'w-28' },
    { key: 'discount', label: 'Discount', width: 'w-28' },
    { key: 'tax', label: 'Tax', width: 'w-20' },
    { key: 'amount', label: 'Amount', width: 'w-28' },
    { key: 'action', label: 'Action', width: 'w-10' },
  ];

  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0;

  // ── Loading guard ─────────────────────────────────────────────────────────────

  if (loading || hookLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!originalCreditNote) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Credit Note not found
          </p>
          <button
            onClick={() => navigate('/sales/credit-notes')}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
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
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1
                className="text-2xl font-semibold flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <Receipt className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                Edit Credit Note
              </h1>
              <p
                className="text-sm themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Editing {originalCreditNote.creditNoteNumber} - {originalCreditNote.customerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditable && (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs themed-transition"
                style={{
                  background: 'var(--warning-light)',
                  border: '1px solid var(--warning)',
                  color: 'var(--warning)',
                }}
              >
                <AlertCircle className="h-4 w-4" />
                <span>Read-only: Credit note not in draft</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 themed-transition"
              style={{
                color: 'var(--error)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--error-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Delete credit note"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            {hasChanges && isEditable && (
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || !isEditable}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
                style={{
                  color: 'var(--foreground-secondary)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (hasChanges && isEditable) {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Reset changes"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
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
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={saving || hookSaving || !isEditable || !hasChanges}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                if (!saving && !hookSaving && isEditable && hasChanges) {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
              }}
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
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!saving && !hookSaving && isEditable && hasChanges) {
                  e.currentTarget.style.background = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
              title={!isEditable ? 'Only draft credit notes can be edited' : ''}
            >
              {saving || hookSaving ? (
                <LoadingSpinner size="sm" />
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
          <div
            className="mb-6 p-4 rounded-lg flex items-start gap-3 themed-transition"
            style={{
              background: 'var(--warning-light)',
              border: '1px solid var(--warning)',
            }}
          >
            <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: 'var(--warning)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Credit note is not in draft status
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-secondary)' }}>
                Only draft credit notes can be edited. This credit note is currently marked as <strong>{originalCreditNote.status}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Error Summary */}
        {hasErrors && (
          <ErrorSummary
            errors={errors}
            title="Please fix the following errors:"
            variant="warning"
            maxDisplay={5}
          />
        )}

        <form className="space-y-6">

          {/* ── Customer Details ── */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              <Users className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              Customer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Customer */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Select Customer <span style={{ color: 'var(--error)' }}>*</span>
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
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {errors.customerId}
                  </p>
                )}
              </div>

              {/* Invoice */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
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
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Credit Note Date <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.creditNoteDate}
                  onChange={(e) => handleInputChange('creditNoteDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: `1px solid ${errors.creditNoteDate ? 'var(--error)' : 'var(--border)'}`,
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.creditNoteDate ? 'var(--error)' : 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  disabled={!isEditable}
                />
                {errors.creditNoteDate && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {errors.creditNoteDate}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Reason <span style={{ color: 'var(--error)' }}>*</span>
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
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {errors.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Customer info card */}
            {formData.customerName && (
              <div
                className="mt-4 p-4 rounded-lg themed-transition"
                style={{
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                }}
              >
                <p
                  className="font-medium themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  {formData.customerName}
                </p>
                <p
                  className="text-sm mt-0.5 themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {formData.customerEmail} | {formData.customerPhone}
                </p>
                {formData.customerGst && (
                  <p
                    className="text-sm mt-0.5 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    GST: {formData.customerGst}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Items ── */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
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
              autoAddDefaultRow={false}
              addButtonAtBottom
              className={!isEditable ? 'pointer-events-none opacity-75' : ''}
            />
            {errors.items && (
              <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                {errors.items}
              </p>
            )}
            {!isEditable && (
              <p
                className="mt-2 text-xs text-center themed-transition"
                style={{ color: 'var(--foreground-tertiary)' }}
              >
                Items cannot be edited for non-draft credit notes
              </p>
            )}
          </div>

          {/* ── Notes ── */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              <FileText className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              Notes
            </h2>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none themed-transition disabled:opacity-60"
              style={{
                border: '1px solid var(--border)',
                background: isEditable ? 'var(--background)' : 'var(--surface)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                if (isEditable) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="Enter any additional notes..."
              disabled={!isEditable}
            />
          </div>

        </form>
      </div>

      {/* Saving Overlay */}
      {saving && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            className="rounded-lg p-8 flex flex-col items-center themed-transition"
            style={{
              background: 'var(--card)',
            }}
          >
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )}

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