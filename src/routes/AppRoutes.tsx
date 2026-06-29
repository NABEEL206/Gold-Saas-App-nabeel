// src/AppRoutes.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Register from '../pages/Register/Register';
import Login from '../pages/Login/Login';
import ForgotPassword from '../pages/forgot/ForgotPassword';
import VerifyOTP from '../pages/forgot/VerifyOTP';
import ResetPassword from '../pages/forgot/ResetPassword';
import Home from '../pages/Dashboard/Dashboard';
import Items from '../pages/Items/Items';
import Adjustments from '../pages/Inventory/InventoryAdjustments';
import Quote from '../pages/sales/Quote/Quotes';
import DeliveryChallans from '../pages/sales/deliveryChallan/DeliveryChallans';
import DeliveryChallanView from '../pages/sales/deliveryChallan/DeliveryChallanView';
import DeliveryChallanCreate from '../pages/sales/deliveryChallan/DeliveryChallanCreate';
import DeliveryChallanEdit from '../pages/sales/deliveryChallan/DeliveryChallanEdit';
import PaymentsReceived from '../pages/sales/PaymentsReceived/PaymentsReceived';
import PaymentReceivedView from '../pages/sales/PaymentsReceived/PaymentReceivedView';
import PaymentReceivedCreate from '../pages/sales/PaymentsReceived/PaymentReceivedCreate';
import CreditNotes from '../pages/sales/CreditNotes/CreditNotes';
import CreditNoteView from '../pages/sales/CreditNotes/CreditNoteView';
import CreditNoteCreate from '../pages/sales/CreditNotes/CreditNoteCreate';
import Vendors from '../pages/purchases/Vendors/Vendors';
import VendorCreate from '../pages/purchases/Vendors/VendorCreate';
import VendorEdit from '../pages/purchases/Vendors/VendorEdit';
import VendorView from '../pages/purchases/Vendors/VendorView';
import Expenses from '../pages/purchases/Expenses/Expenses';
import RecurringExpenses from '../pages/purchases/RecurringExpenses/RecurringExpenses';
import PurchaseOrders from '../pages/purchases/PurchaseOrders/PurchaseOrders';
import Bills from '../pages/purchases/Bills/Bills';
import PaymentsMade from '../pages/purchases/PaymentsMade/PaymentsMade';
import VendorCredits from '../pages/purchases/VendorCredits/VendorCredits';
import Banking from '../pages/Banking/Banks';
import ManualJournals from '../pages/accountant/ManualJournals';
import CurrencyAdjustments from '../pages/accountant/CurrencyAdjustments';
import ChartOfAccounts from '../pages/accountant/ChartOfAccounts';
import Reports from '../pages/reports/Reports';
import Documents from '../pages/documents/Documents';
import ItemCreate from '../pages/Items/itemCreate';
import ItemView from '../pages/Items/ItemView';
import ItemEdit from '../pages/Items/ItemEdit';
import InventoryAdjustmentCreate from '../pages/Inventory/InventoryAdjustmentCreate';
import InventoryAdjustmentView from '../pages/Inventory/InventoryAdjustmentView';

// Customer imports
import Customers from '../pages/sales/customers/Customers';
import { CustomerEdit } from '../pages/sales/customers/CustomerEdit';
import CustomerView from '../pages/sales/customers/CustomerView';
import { CustomerCreate } from '../pages/sales/customers/CustomerCreate';

import QuoteCreate from '../pages/sales/Quote/QuoteCreate';
import QuoteView from '../pages/sales/Quote/QuoteView';
import QuoteEdit from '../pages/sales/Quote/QuoteEdit';
import Invoices from '../pages/sales/invoice/Invoices';
import InvoiceCreate from '../pages/sales/invoice/InvoiceCreate';
import InvoiceEdit from '../pages/sales/invoice/InvoiceEdit';
import InvoiceView from '../pages/sales/invoice/InvoiceView';

// Proforma Invoice Imports
import ProformaInvoiceList from '../pages/sales/proforma/ProformaInvoice';
import ProformaInvoiceCreate from '../pages/sales/proforma/ProformaInvoiceCreate';
import ProformaInvoiceEdit from '../pages/sales/proforma/ProformaInvoiceEdit';
import ProformaInvoiceView from '../pages/sales/proforma/ProformaInvoiceView';
import ExpenseEdit from '../pages/purchases/Expenses/ExpenseEdit';
import ExpenseView from '../pages/purchases/Expenses/ExpenseView';
import ExpenseCreate from '../pages/purchases/Expenses/ExpenseCreate';
import RecurringExpenseEdit from '../pages/purchases/RecurringExpenses/RecurringExpenseEdit';
import RecurringExpenseView from '../pages/purchases/RecurringExpenses/RecurringExpenseView';
import RecurringExpenseCreate from '../pages/purchases/RecurringExpenses/RecurringExpenseCreate';
import PurchaseOrderEdit from '../pages/purchases/PurchaseOrders/PurchaseOrderEdit';
import PurchaseOrderView from '../pages/purchases/PurchaseOrders/PurchaseOrderView';
import PurchaseOrderCreate from '../pages/purchases/PurchaseOrders/PurchaseOrderCreate';
import BillCreate from '../pages/purchases/Bills/BillCreate';
import BillView from '../pages/purchases/Bills/BillView';
import BillEdit from '../pages/purchases/Bills/BillEdit';
import PaymentMadeCreate from '../pages/purchases/PaymentsMade/PaymentMadeCreate';
import PaymentMadeView from '../pages/purchases/PaymentsMade/PaymentMadeView';
import PaymentMadeEdit from '../pages/purchases/PaymentsMade/PaymentMadeEdit';
import VendorCreditsCreate from '../pages/purchases/VendorCredits/VendorCreditsCreate';
import VendorCreditsView from '../pages/purchases/VendorCredits/VendorCreditsView';
import VendorCreditsEdit from '../pages/purchases/VendorCredits/VendorCreditsEdit';
import Banks from '../pages/Banking/Banks';
import BankCreate from '../pages/Banking/BankCreate';
import BankView from '../pages/Banking/BankView';
import BankEdit from '../pages/Banking/BankEdit';

// Create a wrapper component for cleaner code
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <MainLayout>{children}</MainLayout>
);

const AppRoutes: React.FC = () => {
  return (
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

      {/* Sales Routes */}
      {/* Customers */}
      <Route path="/sales/customers" element={<LayoutWrapper><Customers /></LayoutWrapper>} />
      <Route path="/customers/create" element={<LayoutWrapper><CustomerCreate /></LayoutWrapper>} />
      <Route path="/customers/:id" element={<LayoutWrapper><CustomerView /></LayoutWrapper>} />
      <Route path="/customers/edit/:id" element={<LayoutWrapper><CustomerEdit /></LayoutWrapper>} />

      {/* Quotes */}
      <Route path="/sales/quotes" element={<LayoutWrapper><Quote /></LayoutWrapper>} />
      <Route path="/sales/quotes/create" element={<LayoutWrapper><QuoteCreate /></LayoutWrapper>} />
      <Route path="/sales/quotes/:id" element={<LayoutWrapper><QuoteView /></LayoutWrapper>} />
      <Route path="/sales/quotes/edit/:id" element={<LayoutWrapper><QuoteEdit /></LayoutWrapper>} />

      {/* Proforma Invoice Routes */}
      <Route path="/sales/proforma" element={<LayoutWrapper><ProformaInvoiceList /></LayoutWrapper>} />
      <Route path="/sales/proforma/create" element={<LayoutWrapper><ProformaInvoiceCreate /></LayoutWrapper>} />
      <Route path="/sales/proforma/:id/edit" element={<LayoutWrapper><ProformaInvoiceEdit /></LayoutWrapper>} />
      <Route path="/sales/proforma/:id/view" element={<LayoutWrapper><ProformaInvoiceView /></LayoutWrapper>} />
      
      {/* Keep old proforma-invoices route for backward compatibility */}
      <Route path="/sales/proforma-invoices" element={<LayoutWrapper><ProformaInvoiceList /></LayoutWrapper>} />

      {/* Invoice Routes */}
      <Route path="/sales/invoices" element={<LayoutWrapper><Invoices /></LayoutWrapper>} />
      <Route path="/sales/invoices/create" element={<LayoutWrapper><InvoiceCreate /></LayoutWrapper>} />
      <Route path="/sales/invoices/edit/:id" element={<LayoutWrapper><InvoiceEdit /></LayoutWrapper>} />
      <Route path="/sales/invoices/:id" element={<LayoutWrapper><InvoiceView /></LayoutWrapper>} />

      {/* Delivery Challan Routes */}
      <Route path="/sales/delivery-challan" element={<LayoutWrapper><DeliveryChallans /></LayoutWrapper>} />
      <Route path="/sales/delivery-challan/create" element={<LayoutWrapper><DeliveryChallanCreate /></LayoutWrapper>} />
      <Route path="/sales/delivery-challan/:id/view" element={<LayoutWrapper><DeliveryChallanView /></LayoutWrapper>} />
      <Route path="/sales/delivery-challan/:id/edit" element={<LayoutWrapper><DeliveryChallanEdit /></LayoutWrapper>} />
      
      {/* Keep old delivery-challans route for backward compatibility */}
      <Route path="/sales/delivery-challans" element={<LayoutWrapper><DeliveryChallans /></LayoutWrapper>} />

      {/* Payment Received Routes */}
      <Route path="/sales/payments-received" element={<LayoutWrapper><PaymentsReceived /></LayoutWrapper>} />
      <Route path="/sales/payments-received/create" element={<LayoutWrapper><PaymentReceivedCreate /></LayoutWrapper>} />
      <Route path="/sales/payments-received/:id/view" element={<LayoutWrapper><PaymentReceivedView /></LayoutWrapper>} />
      <Route path="/sales/payments-received/:id/edit" element={<LayoutWrapper><PaymentReceivedCreate /></LayoutWrapper>} />

      {/* Credit Notes Routes */}
      <Route path="/sales/credit-notes" element={<LayoutWrapper><CreditNotes /></LayoutWrapper>} />
      <Route path="/sales/credit-notes/create" element={<LayoutWrapper><CreditNoteCreate /></LayoutWrapper>} />
      <Route path="/sales/credit-notes/:id/view" element={<LayoutWrapper><CreditNoteView /></LayoutWrapper>} />
      <Route path="/sales/credit-notes/:id/edit" element={<LayoutWrapper><CreditNoteCreate /></LayoutWrapper>} />

      {/* Purchases Routes */}
      {/* Vendor Routes */}
      <Route path="/purchases/vendors" element={<LayoutWrapper><Vendors /></LayoutWrapper>} />
      <Route path="/purchases/vendors/create" element={<LayoutWrapper><VendorCreate /></LayoutWrapper>} />
      <Route path="/purchases/vendors/:id" element={<LayoutWrapper><VendorView /></LayoutWrapper>} />
      <Route path="/purchases/vendors/:id/edit" element={<LayoutWrapper><VendorEdit /></LayoutWrapper>} />

      {/*expense Routes */} 
      <Route path="/purchases/expenses" element={<LayoutWrapper><Expenses /></LayoutWrapper>} />
      <Route path="/purchases/expenses/create" element={<LayoutWrapper><ExpenseCreate /></LayoutWrapper>} />
      <Route path="/purchases/expenses/:id" element={<LayoutWrapper><ExpenseView /></LayoutWrapper>} />
      <Route path="/purchases/expenses/:id/edit" element={<LayoutWrapper><ExpenseEdit /></LayoutWrapper>} />
      
      {/* recurring expenses Routes */}
      <Route path="/purchases/recurring-expenses" element={<LayoutWrapper><RecurringExpenses /></LayoutWrapper>} />
      <Route path="/purchases/recurring-expenses/create" element={<LayoutWrapper><RecurringExpenseCreate /></LayoutWrapper>} />
      <Route path="/purchases/recurring-expenses/:id" element={<LayoutWrapper><RecurringExpenseView /></LayoutWrapper>} />
      <Route path="/purchases/recurring-expenses/:id/edit" element={<LayoutWrapper><RecurringExpenseEdit /></LayoutWrapper>} />

      {/*purchase order routes*/}
      <Route path="/purchases/orders" element={<LayoutWrapper><PurchaseOrders /></LayoutWrapper>} />
      <Route path="/purchases/orders/create" element={<LayoutWrapper><PurchaseOrderCreate /></LayoutWrapper>} />
      <Route path="/purchases/orders/:id" element={<LayoutWrapper><PurchaseOrderView /></LayoutWrapper>} />
      <Route path="/purchases/orders/:id/edit" element={<LayoutWrapper><PurchaseOrderEdit /></LayoutWrapper>} />

      {/*Bills routes*/}
      <Route path="/purchases/bills" element={<LayoutWrapper><Bills /></LayoutWrapper>} />
      <Route path="/purchases/bills/create" element={<LayoutWrapper><BillCreate /></LayoutWrapper>} />
      <Route path="/purchases/bills/:id" element={<LayoutWrapper><BillView /></LayoutWrapper>} />
      <Route path="/purchases/bills/:id/edit" element={<LayoutWrapper><BillEdit /></LayoutWrapper>} />

      {/*Payment Made rotes*/}
      <Route path="/purchases/payments-made" element={<LayoutWrapper><PaymentsMade /></LayoutWrapper>} />
      <Route path="/purchases/payments-made/create" element={<LayoutWrapper><PaymentMadeCreate /></LayoutWrapper>} />
      <Route path="/purchases/payments-made/:id" element={<LayoutWrapper><PaymentMadeView /></LayoutWrapper>} />
      <Route path="/purchases/payments-made/:id/edit" element={<LayoutWrapper><PaymentMadeEdit /></LayoutWrapper>} />

      {/*Vendor Credits  rotes*/}
      <Route path="/purchases/vendor-credits" element={<LayoutWrapper><VendorCredits /></LayoutWrapper>} />
      <Route path="/purchases/vendor-credits/create" element={<LayoutWrapper><VendorCreditsCreate /></LayoutWrapper>} />
      <Route path="/purchases/vendor-credits/:id" element={<LayoutWrapper><VendorCreditsView /></LayoutWrapper>} />
      <Route path="/purchases/vendor-credits/:id/edit" element={<LayoutWrapper><VendorCreditsEdit /></LayoutWrapper>} />
      
      {/* Banking */}
      <Route path="/banking/banks" element={<LayoutWrapper><Banks /></LayoutWrapper>} />
      <Route path="/banking/banks/create" element={<LayoutWrapper><BankCreate /></LayoutWrapper>} />
      <Route path="/banking/banks/:id" element={<LayoutWrapper><BankView /></LayoutWrapper>} />
      <Route path="/banking/banks/:id/edit" element={<LayoutWrapper><BankEdit /></LayoutWrapper>} />
      
      {/* Accountant Routes */}
      <Route path="/accountant/manual-journals" element={<LayoutWrapper><ManualJournals /></LayoutWrapper>} />
      <Route path="/accountant/currency-adjustments" element={<LayoutWrapper><CurrencyAdjustments /></LayoutWrapper>} />
      <Route path="/accountant/chart-of-accounts" element={<LayoutWrapper><ChartOfAccounts /></LayoutWrapper>} />
      
      {/* Reports & Documents */}
      <Route path="/reports" element={<LayoutWrapper><Reports /></LayoutWrapper>} />
      <Route path="/documents" element={<LayoutWrapper><Documents /></LayoutWrapper>} />
      
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;