// Sidebar.tsx - Parent menus always light when expanded

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });

  // Custom function to check if a path is active
  const isPathActive = (path: string): boolean => {
    if (!path) return false;
    if (path === '/home') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Check if any sub-item is active
  const isAnySubItemActive = (subItems: MenuItem[]): boolean => {
    return subItems.some(sub => {
      if (sub.path) {
        // Sales sub-items
        if (sub.path === '/sales/payments-received') {
          return location.pathname.startsWith('/sales/payments-received');
        }
        if (sub.path === '/sales/delivery-challans') {
          return location.pathname.startsWith('/sales/delivery-challan') || 
                 location.pathname.startsWith('/sales/delivery-challans');
        }
        if (sub.path === '/sales/proforma-invoices') {
          return location.pathname.startsWith('/sales/proforma');
        }
        if (sub.path === '/sales/quotes') {
          return location.pathname.startsWith('/sales/quotes');
        }
        if (sub.path === '/sales/invoices') {
          return location.pathname.startsWith('/sales/invoices');
        }
        if (sub.path === '/sales/credit-notes') {
          return location.pathname.startsWith('/sales/credit-notes');
        }
        if (sub.path === '/sales/customers') {
          return location.pathname.startsWith('/sales/customers') || 
                 location.pathname.startsWith('/customers');
        }
        
        // Purchases sub-items
        if (sub.path === '/purchases/vendors') {
          return location.pathname.startsWith('/purchases/vendors');
        }
        if (sub.path === '/purchases/expenses') {
          return location.pathname.startsWith('/purchases/expenses');
        }
        if (sub.path === '/purchases/recurring-expenses') {
          return location.pathname.startsWith('/purchases/recurring-expenses');
        }
        if (sub.path === '/purchases/orders') {
          return location.pathname.startsWith('/purchases/orders');
        }
        if (sub.path === '/purchases/bills') {
          return location.pathname.startsWith('/purchases/bills');
        }
        if (sub.path === '/purchases/payments-made') {
          return location.pathname.startsWith('/purchases/payments-made');
        }
        if (sub.path === '/purchases/vendor-credits') {
          return location.pathname.startsWith('/purchases/vendor-credits');
        }
        
        // Items sub-items
        if (sub.path === '/items') {
          return location.pathname.startsWith('/items');
        }
        
        // Inventory sub-items
        if (sub.path === '/inventory/adjustments') {
          return location.pathname.startsWith('/inventory/adjustments');
        }
        
        // Accountant sub-items
        if (sub.path === '/accountant/manual-journals') {
          return location.pathname.startsWith('/accountant/manual-journals');
        }
        if (sub.path === '/accountant/chart-of-accounts') {
          return location.pathname.startsWith('/accountant/chart-of-accounts');
        }
        
        // Banking sub-items
        if (sub.path === '/banking/banks') {
          return location.pathname.startsWith('/banking/banks');
        }
        
        return location.pathname.startsWith(sub.path);
      }
      return false;
    });
  };

  // Check if parent should show light color
  const shouldShowLightColor = (item: MenuItem): boolean => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    if (!hasSubItems) return false;
    
    const isOpen = openDropdown === item.name;
    const hasActiveSubItem = isAnySubItemActive(item.subItems!);
    
    // Show light color if dropdown is open OR any sub-item is active
    return isOpen || hasActiveSubItem;
  };

  const toggleDropdown = (menuName: string) => {
    if (sidebarOpen) {
      setOpenDropdown(prev => prev === menuName ? null : menuName);
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

  // Reset dropdown when sidebar collapses
  useEffect(() => {
    if (!sidebarOpen) {
      setOpenDropdown(null);
    }
  }, [sidebarOpen]);

  // Complete menu structure with consistent icon sizes
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
        { name: 'Customers', icon: <Users2 size={18} />, path: '/sales/customers' },
        { name: 'Quote', icon: <Quote size={18} />, path: '/sales/quotes' },
        { name: 'Invoice', icon: <Receipt size={18} />, path: '/sales/invoices' },
        { name: 'Proforma Invoice', icon: <FileSignature size={18} />, path: '/sales/proforma-invoices' },
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
    { name: 'Banks', icon: <Landmark size={20} />, path: '/banking/banks' },
    { 
      name: 'Accountant', 
      icon: <Users size={20} />,
      subItems: [
        { name: 'Manual Journals', icon: <BookOpen size={18} />, path: '/accountant/manual-journals' },
        { name: 'Chart of Accounts', icon: <ChartNoAxesCombined size={18} />, path: '/accountant/chart-of-accounts' },
      ]
    },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    // { name: 'Documents', icon: <FileSpreadsheet size={20} />, path: '/documents' },
  ];

  // Update the renderMenuItem function with consistent active background
  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openDropdown === item.name;
    const isHovered = hoveredMenu === item.name;
    const paddingLeft = depth > 0 ? `pl-${depth * 4}` : '';
    const showLight = shouldShowLightColor(item);

    if (hasSubItems) {
      return (
        <li key={item.name} className="w-full relative">
          {/* Parent menu item */}
          <button
            onClick={(e) => handleParentClick(item, e)}
            onMouseEnter={(e) => handleMouseEnter(item, e)}
            onMouseLeave={handleMouseLeave}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
              showLight
                ? 'bg-amber-50 text-amber-600'
                : 'text-gray-700 hover:bg-amber-50 hover:text-amber-600'
            } ${!sidebarOpen ? 'justify-center px-2' : ''} ${paddingLeft}`}
            title={!sidebarOpen ? item.name : ''}
          >
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
            {sidebarOpen && (
              <>
                <span className="text-sm font-medium flex-1 text-left">{item.name}</span>
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
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
                    renderMenuItem(subItem, depth + 1)
                  ) : (
                    <NavLink
                      to={subItem.path}
                      className={({ isActive: isNavActive }) => {
                        let isSubActive = isNavActive;
                        if (subItem.path === '/sales/delivery-challans') {
                          isSubActive = location.pathname.startsWith('/sales/delivery-challan') || 
                                       location.pathname.startsWith('/sales/delivery-challans');
                        }
                        if (subItem.path === '/sales/payments-received') {
                          isSubActive = location.pathname.startsWith('/sales/payments-received');
                        }
                        if (subItem.path === '/sales/proforma-invoices') {
                          isSubActive = location.pathname.startsWith('/sales/proforma');
                        }
                        if (subItem.path === '/sales/quotes') {
                          isSubActive = location.pathname.startsWith('/sales/quotes');
                        }
                        if (subItem.path === '/sales/invoices') {
                          isSubActive = location.pathname.startsWith('/sales/invoices');
                        }
                        if (subItem.path === '/sales/customers') {
                          isSubActive = location.pathname.startsWith('/sales/customers') || 
                                       location.pathname.startsWith('/customers');
                        }
                        if (subItem.path === '/purchases/vendors') {
                          isSubActive = location.pathname.startsWith('/purchases/vendors');
                        }
                        if (subItem.path === '/purchases/expenses') {
                          isSubActive = location.pathname.startsWith('/purchases/expenses');
                        }
                        if (subItem.path === '/purchases/recurring-expenses') {
                          isSubActive = location.pathname.startsWith('/purchases/recurring-expenses');
                        }
                        if (subItem.path === '/purchases/orders') {
                          isSubActive = location.pathname.startsWith('/purchases/orders');
                        }
                        if (subItem.path === '/purchases/bills') {
                          isSubActive = location.pathname.startsWith('/purchases/bills');
                        }
                        if (subItem.path === '/purchases/payments-made') {
                          isSubActive = location.pathname.startsWith('/purchases/payments-made');
                        }
                        if (subItem.path === '/purchases/vendor-credits') {
                          isSubActive = location.pathname.startsWith('/purchases/vendor-credits');
                        }
                        return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ml-4 whitespace-nowrap ${
                          isSubActive
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                        }`;
                      }}
                    >
                      <span className="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center">{subItem.icon}</span>
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
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{item.name}</span>
              </div>
              {item.subItems.map((subItem) => (
                <NavLink
                  key={subItem.name}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-50 text-amber-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
                    }`
                  }
                  onClick={() => setHoveredMenu(null)}
                >
                  <span className="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center">{subItem.icon}</span>
                  <span>{subItem.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </li>
      );
    }

    // Regular menu item without dropdown - same styling as parent items
    return (
      <li key={item.name} className="w-full">
        <NavLink
          to={item.path!}
          className={({ isActive }) => {
            let isLinkActive = isActive;
            if (item.path === '/sales/delivery-challans') {
              isLinkActive = location.pathname.startsWith('/sales/delivery-challan') || 
                            location.pathname.startsWith('/sales/delivery-challans');
            }
            if (item.path === '/sales/payments-received') {
              isLinkActive = location.pathname.startsWith('/sales/payments-received');
            }
            if (item.path === '/sales/proforma-invoices') {
              isLinkActive = location.pathname.startsWith('/sales/proforma');
            }
            if (item.path === '/sales/quotes') {
              isLinkActive = location.pathname.startsWith('/sales/quotes');
            }
            if (item.path === '/sales/invoices') {
              isLinkActive = location.pathname.startsWith('/sales/invoices');
            }
            if (item.path === '/sales/customers') {
              isLinkActive = location.pathname.startsWith('/sales/customers') || 
                            location.pathname.startsWith('/customers');
            }
            if (item.path === '/sales/credit-notes') {
              isLinkActive = location.pathname.startsWith('/sales/credit-notes');
            }
            if (item.path === '/purchases/vendors') {
              isLinkActive = location.pathname.startsWith('/purchases/vendors');
            }
            if (item.path === '/purchases/expenses') {
              isLinkActive = location.pathname.startsWith('/purchases/expenses');
            }
            if (item.path === '/purchases/recurring-expenses') {
              isLinkActive = location.pathname.startsWith('/purchases/recurring-expenses');
            }
            if (item.path === '/purchases/orders') {
              isLinkActive = location.pathname.startsWith('/purchases/orders');
            }
            if (item.path === '/purchases/bills') {
              isLinkActive = location.pathname.startsWith('/purchases/bills');
            }
            if (item.path === '/purchases/payments-made') {
              isLinkActive = location.pathname.startsWith('/purchases/payments-made');
            }
            if (item.path === '/purchases/vendor-credits') {
              isLinkActive = location.pathname.startsWith('/purchases/vendor-credits');
            }
            return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full whitespace-nowrap ${
              isLinkActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-amber-50 hover:text-amber-600'
            } ${!sidebarOpen ? 'justify-center px-2' : ''} ${paddingLeft}`;
          }}
          title={!sidebarOpen ? item.name : ''}
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
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
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Need Help?</span>
              </div>
              <p className="text-xs text-gray-500 whitespace-nowrap">Contact support</p>
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