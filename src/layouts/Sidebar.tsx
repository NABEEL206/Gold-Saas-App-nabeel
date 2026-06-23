// Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  ShoppingBag,
  Landmark,
  Users,
  FileText,
  FileSpreadsheet,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Box,
  Settings2,
  Users2,
  Quote,
  FileBox,
  Receipt,
  Truck,
  CreditCard,
  FileMinus,
  Building2,
  DollarSign,
  Calendar,
  ShoppingBasket,
  FileCheck,
  HandCoins,
  FilePlus,
  BookOpen,
  RefreshCw,
  ChartNoAxesCombined,
  FileSignature,
  FileSpreadsheet as FileSpreadsheetIcon,
  FileSearch,
  FileEdit,
  File,
  FileBadge,
} from 'lucide-react';
import type { MenuItem, SidebarProps } from '../types/sidebar/sidebartype';

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({
    Items: false,
    Inventory: false,
    Sales: false,
    Purchases: false,
    Accountant: false,
    Quote: false,
    Invoice: false,
  });

  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });

  const toggleDropdown = (menuName: string) => {
    if (sidebarOpen) {
      setOpenDropdowns(prev => ({
        ...prev,
        [menuName]: !prev[menuName]
      }));
    }
  };

  // Handle click on parent menu item when sidebar is collapsed
  const handleParentClick = (item: MenuItem, event: React.MouseEvent) => {
    if (!sidebarOpen) {
      if (item.path) {
        navigate(item.path);
      } else if (item.subItems && item.subItems.length > 0) {
        navigate(item.subItems[0].path);
      }
    } else {
      toggleDropdown(item.name);
    }
  };

  // Handle mouse enter for hover tooltip when sidebar is collapsed
  const handleMouseEnter = (item: MenuItem, event: React.MouseEvent) => {
    if (!sidebarOpen && item.subItems && item.subItems.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoverPosition({
        top: rect.top,
        left: rect.right + 5,
      });
      setHoveredMenu(item.name);
    }
  };

  const handleMouseLeave = () => {
    setHoveredMenu(null);
  };

  // Reset all dropdowns when sidebar collapses
  useEffect(() => {
    if (!sidebarOpen) {
      setOpenDropdowns({
        Items: false,
        Inventory: false,
        Sales: false,
        Purchases: false,
        Accountant: false,
        Quote: false,
        Invoice: false,
      });
    }
  }, [sidebarOpen]);

  // Complete menu structure
  const menuItems: MenuItem[] = [
    { name: 'Home', icon: <LayoutDashboard size={20} />, path: '/home' },
    { 
      name: 'Items', 
      icon: <Package size={20} />,
      path: '/items',
      subItems: [
        { name: 'Items', icon: <Box size={18} />, path: '/items' },
      ]
    },
    { 
      name: 'Inventory', 
      icon: <ClipboardList size={20} />,
      path: '/inventory/adjustments',
      subItems: [
        { name: 'Inventory Adjustments', icon: <Settings2 size={18} />, path: '/inventory/adjustments' },
      ]
    },
    { 
      name: 'Sales', 
      icon: <ShoppingCart size={20} />,
      subItems: [
        // Customers
        { name: 'Customers', icon: <Users2 size={18} />, path: '/sales/customers' },
        
        // Quote section
        { 
          name: 'Quote', 
          icon: <Quote size={18} />,
          path: '/sales/quotes',
          subItems: [
            { name: 'Quote', icon: <FileText size={16} />, path: '/sales/quotes' },
            { name: 'Quote Rough', icon: <FileEdit size={16} />, path: '/sales/rough-quotes' },
          ]
        },
        
        // Invoice section
        { 
          name: 'Invoice', 
          icon: <Receipt size={18} />,
          path: '/sales/invoices',
          subItems: [
            { name: 'Invoice', icon: <FileText size={16} />, path: '/sales/invoices' },
            { name: 'proforma Invoice', icon: <FileSignature size={16} />, path: '/sales/proforma-invoices' },
          ]
        },
        
        // Other sales items
        { name: 'Delivery Challans', icon: <Truck size={18} />, path: '/sales/delivery-challans' },
        { name: 'Payments Received', icon: <CreditCard size={18} />, path: '/sales/payments-received' },
        { name: 'Credit Notes', icon: <FileMinus size={18} />, path: '/sales/credit-notes' },
      ]
    },
    { 
      name: 'Purchases', 
      icon: <ShoppingBag size={20} />,
      subItems: [
        { name: 'Vendors', icon: <Building2 size={18} />, path: '/purchases/vendors' },
        { name: 'Expenses', icon: <DollarSign size={18} />, path: '/purchases/expenses' },
        { name: 'Recurring Expenses', icon: <Calendar size={18} />, path: '/purchases/recurring-expenses' },
        { name: 'Purchase Orders', icon: <ShoppingBasket size={18} />, path: '/purchases/orders' },
        { name: 'Bills', icon: <FileCheck size={18} />, path: '/purchases/bills' },
        { name: 'Payments Made', icon: <HandCoins size={18} />, path: '/purchases/payments-made' },
        { name: 'Vendor Credits', icon: <FilePlus size={18} />, path: '/purchases/vendor-credits' },
      ]
    },
    { name: 'Banking', icon: <Landmark size={20} />, path: '/banking' },
    { 
      name: 'Accountant', 
      icon: <Users size={20} />,
      subItems: [
        { name: 'Manual Journals', icon: <BookOpen size={18} />, path: '/accountant/manual-journals' },
        { name: 'Chart of Accounts', icon: <ChartNoAxesCombined size={18} />, path: '/accountant/chart-of-accounts' },
      ]
    },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    { name: 'Documents', icon: <FileSpreadsheet size={18} />, path: '/documents' },
  ];

  // Update the renderMenuItem function to handle nested sub-items
  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openDropdowns[item.name];
    const isHovered = hoveredMenu === item.name;
    const paddingLeft = depth > 0 ? `pl-${depth * 4}` : '';

    if (hasSubItems) {
      return (
        <li key={item.name} className="w-full relative">
          {/* Parent menu item */}
          <button
            onClick={(e) => handleParentClick(item, e)}
            onMouseEnter={(e) => handleMouseEnter(item, e)}
            onMouseLeave={handleMouseLeave}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-amber-50 hover:text-amber-600 ${
              !sidebarOpen ? 'justify-center' : ''
            } ${paddingLeft}`}
            title={!sidebarOpen ? item.name : ''}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {sidebarOpen && (
              <>
                <span className="text-sm font-medium flex-1 text-left">{item.name}</span>
                <span className="flex-shrink-0">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              </>
            )}
          </button>

          {/* Submenu for expanded sidebar */}
          {sidebarOpen && isOpen && (
            <ul className="mt-1 space-y-1">
              {item.subItems!.map((subItem) => (
                <li key={subItem.name} className="w-full">
                  {subItem.subItems ? (
                    // If subItem has its own sub-items (nested)
                    renderMenuItem(subItem, depth + 1)
                  ) : (
                    <NavLink
                      to={subItem.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ml-6 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                        }`
                      }
                    >
                      <span className="flex-shrink-0">{subItem.icon}</span>
                      <span className="text-sm font-medium">{subItem.name}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Hover tooltip/popup for collapsed sidebar */}
          {!sidebarOpen && isHovered && item.subItems && (
            <div 
              className="fixed bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50 min-w-[220px]"
              style={{
                top: hoverPosition.top,
                left: hoverPosition.left,
              }}
              onMouseEnter={() => setHoveredMenu(item.name)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500">{item.name}</span>
              </div>
              {item.subItems.map((subItem) => (
                <NavLink
                  key={subItem.name}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-amber-50 text-amber-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
                    }`
                  }
                  onClick={() => setHoveredMenu(null)}
                >
                  <span className="flex-shrink-0">{subItem.icon}</span>
                  <span>{subItem.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </li>
      );
    }

    // Regular menu item without dropdown
    return (
      <li key={item.name} className="w-full">
        <NavLink
          to={item.path!}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-amber-50 hover:text-amber-600'
            } ${!sidebarOpen ? 'justify-center' : ''} ${paddingLeft}`
          }
          title={!sidebarOpen ? item.name : ''}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
        </NavLink>
      </li>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-20 overflow-visible ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-visible">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Help Section - fixed at bottom */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={16} className="text-amber-600" />
                <span className="text-xs font-medium text-gray-700">Need Help?</span>
              </div>
              <p className="text-xs text-gray-500">Contact support</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="p-2 pb-6 flex justify-center border-t border-gray-100 flex-shrink-0">
            <HelpCircle size={20} className="text-gray-400 hover:text-amber-500 transition-colors cursor-pointer" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;