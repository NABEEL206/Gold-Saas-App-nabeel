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
import  Quote  from '../pages/sales/Quote/Quotes';
import DeliveryChallans from '../pages/sales/deliveryChallans/DeliveryChallans';
import PaymentsReceived from '../pages/sales/PaymentsReceived/PaymentsReceived';
import CreditNotes from '../pages/sales/CreditNotes/CreditNotes';
import Vendors from '../pages/purchases/Vendors';
import Expenses from '../pages/purchases/Expenses';
import RecurringExpenses from '../pages/purchases/RecurringExpenses';
import PurchaseOrders from '../pages/purchases/PurchaseOrders';
import Bills from '../pages/purchases/Bills';
import PaymentsMade from '../pages/purchases/PaymentsMade';
import VendorCredits from '../pages/purchases/VendorCredits';
import Banking from '../pages/Banking/Banking';
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

// Customer imports - CHANGE THESE to default imports
import Customers from '../pages/sales/customers/Customers';
import { CustomerEdit } from '../pages/sales/customers/CustomerEdit';
import CustomerView from '../pages/sales/customers/CustomerView';
import { CustomerCreate } from '../pages/sales/customers/CustomerCreate';

import  QuoteCreate  from '../pages/sales/Quote/QuoteCreate';
import QuoteView  from '../pages/sales/Quote/QuoteView';
import  QuoteEdit  from '../pages/sales/Quote/QuoteEdit';
import Invoices from '../pages/sales/invoice/Invoices';
import InvoiceCreate from '../pages/sales/invoice/InvoiceCreate';
import InvoiceEdit from '../pages/sales/invoice/InvoiceEdit';
import InvoiceView from '../pages/sales/invoice/InvoiceView';
// Proforma Invoice Imports
import ProformaInvoiceList from '../pages/sales/proforma/ProformaInvoice';
import ProformaInvoiceCreate from '../pages/sales/proforma/ProformaInvoiceCreate';
import ProformaInvoiceEdit from '../pages/sales/proforma/ProformaInvoiceEdit';
import ProformaInvoiceView from '../pages/sales/proforma/ProformaInvoiceView';

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
        {/* Other Sales Routes */}
      <Route path="/sales/quotes" element={<LayoutWrapper><Quote /></LayoutWrapper>} />
      <Route path="/sales/quotes/create" element={<LayoutWrapper><QuoteCreate /></LayoutWrapper>} />
      <Route path="/sales/quotes/:id" element={<LayoutWrapper><QuoteView /></LayoutWrapper>} />
      <Route path="/sales/quotes/edit/:id" element={<LayoutWrapper><QuoteEdit /></LayoutWrapper>} />

      
      {/* Proforma Invoice Routes - NEW */}
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

      <Route path="/sales/delivery-challans" element={<LayoutWrapper><DeliveryChallans /></LayoutWrapper>} />
      <Route path="/sales/payments-received" element={<LayoutWrapper><PaymentsReceived /></LayoutWrapper>} />
      <Route path="/sales/credit-notes" element={<LayoutWrapper><CreditNotes /></LayoutWrapper>} />

      
      {/* Purchases Routes */}
      <Route path="/purchases/vendors" element={<LayoutWrapper><Vendors /></LayoutWrapper>} />
      <Route path="/purchases/expenses" element={<LayoutWrapper><Expenses /></LayoutWrapper>} />
      <Route path="/purchases/recurring-expenses" element={<LayoutWrapper><RecurringExpenses /></LayoutWrapper>} />
      <Route path="/purchases/orders" element={<LayoutWrapper><PurchaseOrders /></LayoutWrapper>} />
      <Route path="/purchases/bills" element={<LayoutWrapper><Bills /></LayoutWrapper>} />
      <Route path="/purchases/payments-made" element={<LayoutWrapper><PaymentsMade /></LayoutWrapper>} />
      <Route path="/purchases/vendor-credits" element={<LayoutWrapper><VendorCredits /></LayoutWrapper>} />
      
      {/* Banking */}
      <Route path="/banking" element={<LayoutWrapper><Banking /></LayoutWrapper>} />
      
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