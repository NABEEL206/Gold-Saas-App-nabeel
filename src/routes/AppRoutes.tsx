// src/AppRoutes.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useToastAndConfirm } from '../hooks/ToastConfirmModal/useToastAndConfirm';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Public Pages
import Register from '../pages/Register/Register';
import Login from '../pages/Login/Login';
import ForgotPassword from '../pages/forgot/ForgotPassword';
import VerifyOTP from '../pages/forgot/VerifyOTP';
import ResetPassword from '../pages/forgot/ResetPassword';

// Dashboard
import Home from '../pages/Dashboard/Dashboard';

// Items
import Items from '../pages/Items/Items';
import ItemCreate from '../pages/Items/itemCreate';
import ItemView from '../pages/Items/ItemView';
import ItemEdit from '../pages/Items/ItemEdit';

// Inventory
import Adjustments from '../pages/Inventory/InventoryAdjustments';
import InventoryAdjustmentCreate from '../pages/Inventory/InventoryAdjustmentCreate';
import InventoryAdjustmentView from '../pages/Inventory/InventoryAdjustmentView';

// Sales - Customers
import Customers from '../pages/sales/customers/Customers';
import { CustomerEdit } from '../pages/sales/customers/CustomerEdit';
import CustomerView from '../pages/sales/customers/CustomerView';
import { CustomerCreate } from '../pages/sales/customers/CustomerCreate';

// Sales - Quotes
import Quote from '../pages/sales/Quote/Quotes';
import QuoteCreate from '../pages/sales/Quote/QuoteCreate';
import QuoteView from '../pages/sales/Quote/QuoteView';
import QuoteEdit from '../pages/sales/Quote/QuoteEdit';

// Sales - Proforma Invoice
import ProformaInvoiceList from '../pages/sales/proforma/ProformaInvoice';
import ProformaInvoiceCreate from '../pages/sales/proforma/ProformaInvoiceCreate';
import ProformaInvoiceEdit from '../pages/sales/proforma/ProformaInvoiceEdit';
import ProformaInvoiceView from '../pages/sales/proforma/ProformaInvoiceView';

// Sales - Invoices
import Invoices from '../pages/sales/invoice/Invoices';
import InvoiceCreate from '../pages/sales/invoice/InvoiceCreate';
import InvoiceEdit from '../pages/sales/invoice/InvoiceEdit';
import InvoiceView from '../pages/sales/invoice/InvoiceView';

// Sales - Delivery Challan
import DeliveryChallans from '../pages/sales/deliveryChallan/DeliveryChallans';
import DeliveryChallanView from '../pages/sales/deliveryChallan/DeliveryChallanView';
import DeliveryChallanCreate from '../pages/sales/deliveryChallan/DeliveryChallanCreate';
import DeliveryChallanEdit from '../pages/sales/deliveryChallan/DeliveryChallanEdit';

// Sales - Payments Received
import PaymentsReceived from '../pages/sales/PaymentsReceived/PaymentsReceived';
import PaymentReceivedView from '../pages/sales/PaymentsReceived/PaymentReceivedView';
import PaymentReceivedCreate from '../pages/sales/PaymentsReceived/PaymentReceivedCreate';

// Sales - Credit Notes
import CreditNotes from '../pages/sales/CreditNotes/CreditNotes';
import CreditNoteView from '../pages/sales/CreditNotes/CreditNoteView';
import CreditNoteCreate from '../pages/sales/CreditNotes/CreditNoteCreate';

// Purchases - Vendors
import Vendors from '../pages/purchases/Vendors/Vendors';
import VendorCreate from '../pages/purchases/Vendors/VendorCreate';
import VendorEdit from '../pages/purchases/Vendors/VendorEdit';
import VendorView from '../pages/purchases/Vendors/VendorView';

// Purchases - Expenses
import Expenses from '../pages/purchases/Expenses/Expenses';
import ExpenseCreate from '../pages/purchases/Expenses/ExpenseCreate';
import ExpenseView from '../pages/purchases/Expenses/ExpenseView';
import ExpenseEdit from '../pages/purchases/Expenses/ExpenseEdit';

// Purchases - Recurring Expenses
import RecurringExpenses from '../pages/purchases/RecurringExpenses/RecurringExpenses';
import RecurringExpenseCreate from '../pages/purchases/RecurringExpenses/RecurringExpenseCreate';
import RecurringExpenseView from '../pages/purchases/RecurringExpenses/RecurringExpenseView';
import RecurringExpenseEdit from '../pages/purchases/RecurringExpenses/RecurringExpenseEdit';

// Purchases - Purchase Orders
import PurchaseOrders from '../pages/purchases/PurchaseOrders/PurchaseOrders';
import PurchaseOrderCreate from '../pages/purchases/PurchaseOrders/PurchaseOrderCreate';
import PurchaseOrderView from '../pages/purchases/PurchaseOrders/PurchaseOrderView';
import PurchaseOrderEdit from '../pages/purchases/PurchaseOrders/PurchaseOrderEdit';

// Purchases - Bills
import Bills from '../pages/purchases/Bills/Bills';
import BillCreate from '../pages/purchases/Bills/BillCreate';
import BillView from '../pages/purchases/Bills/BillView';
import BillEdit from '../pages/purchases/Bills/BillEdit';

// Purchases - Payments Made
import PaymentsMade from '../pages/purchases/PaymentsMade/PaymentsMade';
import PaymentMadeCreate from '../pages/purchases/PaymentsMade/PaymentMadeCreate';
import PaymentMadeView from '../pages/purchases/PaymentsMade/PaymentMadeView';
import PaymentMadeEdit from '../pages/purchases/PaymentsMade/PaymentMadeEdit';

// Purchases - Vendor Credits
import VendorCredits from '../pages/purchases/VendorCredits/VendorCredits';
import VendorCreditsCreate from '../pages/purchases/VendorCredits/VendorCreditsCreate';
import VendorCreditsView from '../pages/purchases/VendorCredits/VendorCreditsView';
import VendorCreditsEdit from '../pages/purchases/VendorCredits/VendorCreditsEdit';

// Banking
import Banks from '../pages/Banking/Banks';
import BankCreate from '../pages/Banking/BankCreate';
import BankView from '../pages/Banking/BankView';
import BankEdit from '../pages/Banking/BankEdit';

// Accountant - Manual Journals
import ManualJournals from '../pages/accountant/ManualJournal/ManualJournals';
import ManualJournalCreate from '../pages/accountant/ManualJournal/ManualJournalCreate';
import ManualJournalView from '../pages/accountant/ManualJournal/ManualJournalView';
import ManualJournalEdit from '../pages/accountant/ManualJournal/ManualJournalEdit';

// Accountant - Chart of Accounts
import ChartOfAccounts from '../pages/accountant/ChartOfAccounts/ChartOfAccounts';
import ChartOfAccountsCreate from '../pages/accountant/ChartOfAccounts/ChartOfAccountsCreate';
import ChartOfAccountsView from '../pages/accountant/ChartOfAccounts/ChartOfAccountsView';
import ChartOfAccountsEdit from '../pages/accountant/ChartOfAccounts/ChartOfAccountsEdit';

// Reports & Documents
import Reports from '../pages/reports/Reports';
import Documents from '../pages/documents/Documents';
import PaymentReceivedEdit from '../pages/sales/PaymentsReceived/PaymentReceivedEdit';
import CreditNoteEdit from '../pages/sales/CreditNotes/CreditNoteEdit';

// ========== REPORT PAGES IMPORTS ==========
// Accountant Reports
import BalanceSheet from '../pages/reports/Accountant/BalanceSheet';
import ProfitandLoss from '../pages/reports/Accountant/ProfitandLoss';
import TrialBalance from '../pages/reports/Accountant/TrialBalance';

// Banking Reports
import BankTransactionsDetails from '../pages/reports/Banking/BankTransactionsDetails';

// Inventory Reports
import GoldInventorySummary from '../pages/reports/Inventory/GoldInventorySummary';
import StockMovement from '../pages/reports/Inventory/StockMovement';

// Inventory Valuation Reports
import InventoryValuation from '../pages/reports/inventoryValuation/InventoryValuation';

// Payables Reports
import PayableSummary from '../pages/reports/Payables/PayableSummary';
import PurchaseOrderDetails from '../pages/reports/Payables/PurchaseOrderDetails';
import VendorPayment from '../pages/reports/Payables/VendorPayment';

// Payments Received Reports
import PaymentReceived from '../pages/reports/PaymentsReceived/PaymentReceived';

// Purchase and Expenses Reports
import ExpenseReport from '../pages/reports/PurchaseAndExpenses/ExpenseReport';
import { PurchaseSummary } from '../pages/reports/PurchaseAndExpenses/PurchaseSummary';

// Receivables Reports
import InvoiceDetails from '../pages/reports/Receivables/InvoiceDetails';
import ReceivablesSummary from '../pages/reports/Receivables/ReceivablesSummary';

// Repair Reports
import RepairsSummary from '../pages/reports/Repair/RepairsSummary';

// Sales Reports
import SalesbyCustomer from '../pages/reports/sales/SalesbyCustomer';
import SalesbyProduct from '../pages/reports/sales/SalesbyProduct';
import SalesSummary from '../pages/reports/sales/SalesSummary';

// Tax Reports
import TaxSummary from '../pages/reports/Tax/TaxSummary';

// Create a wrapper component for cleaner code
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <MainLayout>{children}</MainLayout>
);

// Main Routes Component with Toast and Confirmation Modal
const AppRoutes: React.FC = () => {
  const {
    isOpen,
    options,
    isLoading,
    handleConfirm,
    handleCancel,
  } = useToastAndConfirm();

  return (
    <>
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Default - Redirect to Home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Protected Routes with Layout */}
        {/* Dashboard & Items */}
        <Route path="/home" element={<LayoutWrapper><Home /></LayoutWrapper>} />
        <Route path="/items" element={<LayoutWrapper><Items /></LayoutWrapper>} />
        <Route path="/items/create" element={<LayoutWrapper><ItemCreate /></LayoutWrapper>} />
        <Route path="/items/:id" element={<LayoutWrapper><ItemView /></LayoutWrapper>} />
        <Route path="/items/edit/:id" element={<LayoutWrapper><ItemEdit /></LayoutWrapper>} />

        {/* Inventory Routes */}
        <Route path="/inventory/adjustments" element={<LayoutWrapper><Adjustments /></LayoutWrapper>} />
        <Route path="/inventory/adjustments/create" element={<LayoutWrapper><InventoryAdjustmentCreate /></LayoutWrapper>} />
        <Route path="/inventory/adjustments/:id" element={<LayoutWrapper><InventoryAdjustmentView /></LayoutWrapper>} />
        <Route path="/inventory/adjustments/edit/:id" element={<LayoutWrapper><InventoryAdjustmentCreate /></LayoutWrapper>} />

        {/* Sales Routes - Customers */}
        <Route path="/sales/customers" element={<LayoutWrapper><Customers /></LayoutWrapper>} />
        <Route path="/customers/create" element={<LayoutWrapper><CustomerCreate /></LayoutWrapper>} />
        <Route path="/customers/:id" element={<LayoutWrapper><CustomerView /></LayoutWrapper>} />
        <Route path="/customers/edit/:id" element={<LayoutWrapper><CustomerEdit /></LayoutWrapper>} />

        {/* Sales Routes - Quotes */}
        <Route path="/sales/quotes" element={<LayoutWrapper><Quote /></LayoutWrapper>} />
        <Route path="/sales/quotes/create" element={<LayoutWrapper><QuoteCreate /></LayoutWrapper>} />
        <Route path="/sales/quotes/:id" element={<LayoutWrapper><QuoteView /></LayoutWrapper>} />
        <Route path="/sales/quotes/edit/:id" element={<LayoutWrapper><QuoteEdit /></LayoutWrapper>} />

        {/* Sales Routes - Proforma Invoice */}
        <Route path="/sales/proforma" element={<LayoutWrapper><ProformaInvoiceList /></LayoutWrapper>} />
        <Route path="/sales/proforma/create" element={<LayoutWrapper><ProformaInvoiceCreate /></LayoutWrapper>} />
        <Route path="/sales/proforma/:id/edit" element={<LayoutWrapper><ProformaInvoiceEdit /></LayoutWrapper>} />
        <Route path="/sales/proforma/:id/view" element={<LayoutWrapper><ProformaInvoiceView /></LayoutWrapper>} />
        <Route path="/sales/proforma-invoices" element={<LayoutWrapper><ProformaInvoiceList /></LayoutWrapper>} />

        {/* Sales Routes - Invoices */}
        <Route path="/sales/invoices" element={<LayoutWrapper><Invoices /></LayoutWrapper>} />
        <Route path="/sales/invoices/create" element={<LayoutWrapper><InvoiceCreate /></LayoutWrapper>} />
        <Route path="/sales/invoices/edit/:id" element={<LayoutWrapper><InvoiceEdit /></LayoutWrapper>} />
        <Route path="/sales/invoices/:id" element={<LayoutWrapper><InvoiceView /></LayoutWrapper>} />

        {/* Sales Routes - Delivery Challan */}
        <Route path="/sales/delivery-challan" element={<LayoutWrapper><DeliveryChallans /></LayoutWrapper>} />
        <Route path="/sales/delivery-challan/create" element={<LayoutWrapper><DeliveryChallanCreate /></LayoutWrapper>} />
        <Route path="/sales/delivery-challan/:id/view" element={<LayoutWrapper><DeliveryChallanView /></LayoutWrapper>} />
        <Route path="/sales/delivery-challan/:id/edit" element={<LayoutWrapper><DeliveryChallanEdit /></LayoutWrapper>} />
        <Route path="/sales/delivery-challans" element={<LayoutWrapper><DeliveryChallans /></LayoutWrapper>} />

        {/* Sales Routes - Payments Received */}
        <Route path="/sales/payments-received" element={<LayoutWrapper><PaymentsReceived /></LayoutWrapper>} />
        <Route path="/sales/payments-received/create" element={<LayoutWrapper><PaymentReceivedCreate /></LayoutWrapper>} />
        <Route path="/sales/payments-received/:id/view" element={<LayoutWrapper><PaymentReceivedView /></LayoutWrapper>} />
        <Route path="/sales/payments-received/:id/edit" element={<LayoutWrapper><PaymentReceivedEdit /></LayoutWrapper>} />

        {/* Sales Routes - Credit Notes */}
        <Route path="/sales/credit-notes" element={<LayoutWrapper><CreditNotes /></LayoutWrapper>} />
        <Route path="/sales/credit-notes/create" element={<LayoutWrapper><CreditNoteCreate /></LayoutWrapper>} />
        <Route path="/sales/credit-notes/:id/view" element={<LayoutWrapper><CreditNoteView /></LayoutWrapper>} />
        <Route path="/sales/credit-notes/:id/edit" element={<LayoutWrapper><CreditNoteEdit /></LayoutWrapper>} />

        {/* Purchases Routes - Vendors */}
        <Route path="/purchases/vendors" element={<LayoutWrapper><Vendors /></LayoutWrapper>} />
        <Route path="/purchases/vendors/create" element={<LayoutWrapper><VendorCreate /></LayoutWrapper>} />
        <Route path="/purchases/vendors/:id" element={<LayoutWrapper><VendorView /></LayoutWrapper>} />
        <Route path="/purchases/vendors/:id/edit" element={<LayoutWrapper><VendorEdit /></LayoutWrapper>} />

        {/* Purchases Routes - Expenses */}
        <Route path="/purchases/expenses" element={<LayoutWrapper><Expenses /></LayoutWrapper>} />
        <Route path="/purchases/expenses/create" element={<LayoutWrapper><ExpenseCreate /></LayoutWrapper>} />
        <Route path="/purchases/expenses/:id" element={<LayoutWrapper><ExpenseView /></LayoutWrapper>} />
        <Route path="/purchases/expenses/:id/edit" element={<LayoutWrapper><ExpenseEdit /></LayoutWrapper>} />
        
        {/* Purchases Routes - Recurring Expenses */}
        <Route path="/purchases/recurring-expenses" element={<LayoutWrapper><RecurringExpenses /></LayoutWrapper>} />
        <Route path="/purchases/recurring-expenses/create" element={<LayoutWrapper><RecurringExpenseCreate /></LayoutWrapper>} />
        <Route path="/purchases/recurring-expenses/:id" element={<LayoutWrapper><RecurringExpenseView /></LayoutWrapper>} />
        <Route path="/purchases/recurring-expenses/:id/edit" element={<LayoutWrapper><RecurringExpenseEdit /></LayoutWrapper>} />

        {/* Purchases Routes - Purchase Orders */}
        <Route path="/purchases/orders" element={<LayoutWrapper><PurchaseOrders /></LayoutWrapper>} />
        <Route path="/purchases/orders/create" element={<LayoutWrapper><PurchaseOrderCreate /></LayoutWrapper>} />
        <Route path="/purchases/orders/:id" element={<LayoutWrapper><PurchaseOrderView /></LayoutWrapper>} />
        <Route path="/purchases/orders/:id/edit" element={<LayoutWrapper><PurchaseOrderEdit /></LayoutWrapper>} />

        {/* Purchases Routes - Bills */}
        <Route path="/purchases/bills" element={<LayoutWrapper><Bills /></LayoutWrapper>} />
        <Route path="/purchases/bills/create" element={<LayoutWrapper><BillCreate /></LayoutWrapper>} />
        <Route path="/purchases/bills/:id" element={<LayoutWrapper><BillView /></LayoutWrapper>} />
        <Route path="/purchases/bills/:id/edit" element={<LayoutWrapper><BillEdit /></LayoutWrapper>} />

        {/* Purchases Routes - Payments Made */}
        <Route path="/purchases/payments-made" element={<LayoutWrapper><PaymentsMade /></LayoutWrapper>} />
        <Route path="/purchases/payments-made/create" element={<LayoutWrapper><PaymentMadeCreate /></LayoutWrapper>} />
        <Route path="/purchases/payments-made/:id" element={<LayoutWrapper><PaymentMadeView /></LayoutWrapper>} />
        <Route path="/purchases/payments-made/:id/edit" element={<LayoutWrapper><PaymentMadeEdit /></LayoutWrapper>} />

        {/* Purchases Routes - Vendor Credits */}
        <Route path="/purchases/vendor-credits" element={<LayoutWrapper><VendorCredits /></LayoutWrapper>} />
        <Route path="/purchases/vendor-credits/create" element={<LayoutWrapper><VendorCreditsCreate /></LayoutWrapper>} />
        <Route path="/purchases/vendor-credits/:id" element={<LayoutWrapper><VendorCreditsView /></LayoutWrapper>} />
        <Route path="/purchases/vendor-credits/:id/edit" element={<LayoutWrapper><VendorCreditsEdit /></LayoutWrapper>} />
        
        {/* Banking */}
        <Route path="/banking/banks" element={<LayoutWrapper><Banks /></LayoutWrapper>} />
        <Route path="/banking/banks/create" element={<LayoutWrapper><BankCreate /></LayoutWrapper>} />
        <Route path="/banking/banks/:id" element={<LayoutWrapper><BankView /></LayoutWrapper>} />
        <Route path="/banking/banks/:id/edit" element={<LayoutWrapper><BankEdit /></LayoutWrapper>} />
        
        {/* Accountant Routes - Manual Journals */}
        <Route path="/accountant/manual-journals" element={<LayoutWrapper><ManualJournals /></LayoutWrapper>} />
        <Route path="/accountant/manual-journals/create" element={<LayoutWrapper><ManualJournalCreate /></LayoutWrapper>} />
        <Route path="/accountant/manual-journals/:id" element={<LayoutWrapper><ManualJournalView /></LayoutWrapper>} />
        <Route path="/accountant/manual-journals/:id/edit" element={<LayoutWrapper><ManualJournalEdit /></LayoutWrapper>} />

        {/* Accountant Routes - Chart of Accounts */}
        <Route path="/accountant/chart-of-accounts" element={<LayoutWrapper><ChartOfAccounts /></LayoutWrapper>} />
        <Route path="/accountant/chart-of-accounts/create" element={<LayoutWrapper><ChartOfAccountsCreate /></LayoutWrapper>} />
        <Route path="/accountant/chart-of-accounts/:id" element={<LayoutWrapper><ChartOfAccountsView /></LayoutWrapper>} />
        <Route path="/accountant/chart-of-accounts/:id/edit" element={<LayoutWrapper><ChartOfAccountsEdit /></LayoutWrapper>} />
        
        {/* ========== REPORTS ROUTES ========== */}
        {/* Main Reports Page */}
        <Route path="/reports" element={<LayoutWrapper><Reports /></LayoutWrapper>} />
        <Route path="/reports/:category" element={<LayoutWrapper><Reports /></LayoutWrapper>} />
        
        {/* Accountant Reports */}
        <Route path="/reports/balance-sheet" element={<LayoutWrapper><BalanceSheet /></LayoutWrapper>} />
        <Route path="/reports/profit-loss" element={<LayoutWrapper><ProfitandLoss /></LayoutWrapper>} />
        <Route path="/reports/trial-balance" element={<LayoutWrapper><TrialBalance /></LayoutWrapper>} />
        
        {/* Banking Reports */}
        <Route path="/reports/bank-transactions" element={<LayoutWrapper><BankTransactionsDetails /></LayoutWrapper>} />
        
        {/* Inventory Reports */}
        <Route path="/reports/gold-inventory-summary" element={<LayoutWrapper><GoldInventorySummary /></LayoutWrapper>} />
        <Route path="/reports/stock-movement" element={<LayoutWrapper><StockMovement /></LayoutWrapper>} />
        <Route path="/reports/inventory-valuation" element={<LayoutWrapper><InventoryValuation /></LayoutWrapper>} />
        
        {/* Payables Reports */}
        <Route path="/reports/payable-summary" element={<LayoutWrapper><PayableSummary /></LayoutWrapper>} />
        <Route path="/reports/purchase-order-details" element={<LayoutWrapper><PurchaseOrderDetails /></LayoutWrapper>} />
        <Route path="/reports/vendor-payment" element={<LayoutWrapper><VendorPayment /></LayoutWrapper>} />
        
        {/* Payments Received Reports */}
        <Route path="/reports/payment-received" element={<LayoutWrapper><PaymentReceived /></LayoutWrapper>} />
        
        {/* Purchase and Expenses Reports */}
        <Route path="/reports/expense-report" element={<LayoutWrapper><ExpenseReport /></LayoutWrapper>} />
        <Route path="/reports/purchase-summary" element={<LayoutWrapper><PurchaseSummary /></LayoutWrapper>} />
        
        {/* Receivables Reports */}
        <Route path="/reports/invoice-details" element={<LayoutWrapper><InvoiceDetails /></LayoutWrapper>} />
        <Route path="/reports/receivables-summary" element={<LayoutWrapper><ReceivablesSummary /></LayoutWrapper>} />
        
        {/* Repair Reports */}
        <Route path="/reports/repairs-summary" element={<LayoutWrapper><RepairsSummary /></LayoutWrapper>} />
        
        {/* Sales Reports */}
        <Route path="/reports/sales-by-customer" element={<LayoutWrapper><SalesbyCustomer /></LayoutWrapper>} />
        <Route path="/reports/sales-by-product" element={<LayoutWrapper><SalesbyProduct /></LayoutWrapper>} />
        <Route path="/reports/sales-summary" element={<LayoutWrapper><SalesSummary /></LayoutWrapper>} />
        
        {/* Tax Reports */}
        <Route path="/reports/tax-summary" element={<LayoutWrapper><TaxSummary /></LayoutWrapper>} />
        
        {/* Documents */}
        <Route path="/documents" element={<LayoutWrapper><Documents /></LayoutWrapper>} />
        
        {/* Catch All */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {/* Global Confirmation Modal */}
      {options && (
        <ConfirmationModal
          isOpen={isOpen}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          variant={options.variant}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default AppRoutes;