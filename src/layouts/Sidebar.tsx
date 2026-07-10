// Sidebar.tsx — themed via CSS variables

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardList, ShoppingCart, ShoppingBag,
  Landmark, Users, FileText, HelpCircle, ChevronDown, ChevronRight,
  Box, Settings2, Users2, Quote, Receipt, Truck, CreditCard, FileMinus,
  Building2, DollarSign, Calendar, ShoppingBasket, FileCheck, HandCoins,
  FilePlus, BookOpen, ChartNoAxesCombined, FileSignature,
} from 'lucide-react';
import type { MenuItem, SidebarProps } from '../types/sidebar/sidebartype';

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });

  const isPathActive = (path: string): boolean => {
    if (!path) return false;
    if (path === '/home') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isAnySubItemActive = (subItems: MenuItem[]): boolean => {
    return subItems.some(sub => {
      if (!sub.path) return false;
      const pathMappings: Record<string, string[]> = {
        '/sales/delivery-challans': ['/sales/delivery-challan', '/sales/delivery-challans'],
        '/sales/proforma-invoices': ['/sales/proforma'],
        '/sales/customers': ['/sales/customers', '/customers'],
        '/purchases/vendors': ['/purchases/vendors'],
        '/purchases/expenses': ['/purchases/expenses'],
        '/purchases/recurring-expenses': ['/purchases/recurring-expenses'],
        '/purchases/orders': ['/purchases/orders'],
        '/purchases/bills': ['/purchases/bills'],
        '/purchases/payments-made': ['/purchases/payments-made'],
        '/purchases/vendor-credits': ['/purchases/vendor-credits'],
      };
      const prefixes = pathMappings[sub.path];
      if (prefixes) return prefixes.some(p => location.pathname.startsWith(p));
      return location.pathname.startsWith(sub.path);
    });
  };

  const shouldShowLightColor = (item: MenuItem): boolean => {
    if (!item.subItems?.length) return false;
    // Always highlight the parent when any sub-item is active (regardless of dropdown open state)
    return isAnySubItemActive(item.subItems);
  };

  // Separate flag just for "is dropdown currently open" (for chevron direction)
  const isDropdownOpen = (item: MenuItem): boolean => openDropdown === item.name;

  const toggleDropdown = (menuName: string) => {
    if (sidebarOpen) {
      setOpenDropdown(prev => (prev === menuName ? null : menuName));
    }
  };

  const handleParentClick = (item: MenuItem, _event: React.MouseEvent) => {
    if (!sidebarOpen) {
      if (item.path) navigate(item.path);
      else if (item.subItems?.length) navigate(item.subItems[0].path);
    } else {
      toggleDropdown(item.name);
    }
  };

  const handleMouseEnter = (item: MenuItem, event: React.MouseEvent) => {
    if (!sidebarOpen && item.subItems?.length) {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoverPosition({ top: rect.top, left: rect.right + 5 });
      setHoveredMenu(item.name);
    }
  };

  const handleMouseLeave = () => setHoveredMenu(null);

  useEffect(() => {
    if (!sidebarOpen) setOpenDropdown(null);
  }, [sidebarOpen]);

  const menuItems: MenuItem[] = [
    { name: 'Home', icon: <LayoutDashboard size={20} />, path: '/home' },
    {
      name: 'Items', icon: <Package size={20} />, path: '/items',
      subItems: [{ name: 'Items', icon: <Box size={18} />, path: '/items' }],
    },
    {
      name: 'Inventory', icon: <ClipboardList size={20} />, path: '/inventory/adjustments',
      subItems: [{ name: 'Inventory Adjustments', icon: <Settings2 size={18} />, path: '/inventory/adjustments' }],
    },
    {
      name: 'Sales', icon: <ShoppingCart size={20} />,
      subItems: [
        { name: 'Customers', icon: <Users2 size={18} />, path: '/sales/customers' },
        { name: 'Quote', icon: <Quote size={18} />, path: '/sales/quotes' },
        { name: 'Invoice', icon: <Receipt size={18} />, path: '/sales/invoices' },
        { name: 'Proforma Invoice', icon: <FileSignature size={18} />, path: '/sales/proforma-invoices' },
        { name: 'Delivery Challans', icon: <Truck size={18} />, path: '/sales/delivery-challans' },
        { name: 'Payments Received', icon: <CreditCard size={18} />, path: '/sales/payments-received' },
        { name: 'Credit Notes', icon: <FileMinus size={18} />, path: '/sales/credit-notes' },
      ],
    },
    {
      name: 'Purchases', icon: <ShoppingBag size={20} />,
      subItems: [
        { name: 'Vendors', icon: <Building2 size={18} />, path: '/purchases/vendors' },
        { name: 'Expenses', icon: <DollarSign size={18} />, path: '/purchases/expenses' },
        { name: 'Recurring Expenses', icon: <Calendar size={18} />, path: '/purchases/recurring-expenses' },
        { name: 'Purchase Orders', icon: <ShoppingBasket size={18} />, path: '/purchases/orders' },
        { name: 'Bills', icon: <FileCheck size={18} />, path: '/purchases/bills' },
        { name: 'Payments Made', icon: <HandCoins size={18} />, path: '/purchases/payments-made' },
        { name: 'Vendor Credits', icon: <FilePlus size={18} />, path: '/purchases/vendor-credits' },
      ],
    },
    { name: 'Banks', icon: <Landmark size={20} />, path: '/banking/banks' },
    {
      name: 'Accountant', icon: <Users size={20} />,
      subItems: [
        { name: 'Manual Journals', icon: <BookOpen size={18} />, path: '/accountant/manual-journals' },
        { name: 'Chart of Accounts', icon: <ChartNoAxesCombined size={18} />, path: '/accountant/chart-of-accounts' },
      ],
    },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
  ];

  /** Resolve the active-check for a nav path, handling special cases */
  const resolveIsActive = (path: string, isNavActive: boolean): boolean => {
    const specialPaths: Record<string, string[]> = {
      '/sales/delivery-challans': ['/sales/delivery-challan', '/sales/delivery-challans'],
      '/sales/proforma-invoices': ['/sales/proforma'],
      '/sales/customers': ['/sales/customers', '/customers'],
    };
    const prefixes = specialPaths[path];
    if (prefixes) return prefixes.some(p => location.pathname.startsWith(p));
    return isNavActive;
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasSubItems = Boolean(item.subItems?.length);
    const isOpen = openDropdown === item.name;
    const isHovered = hoveredMenu === item.name;
    const showLight = shouldShowLightColor(item);
    const paddingClass = depth > 0 ? `pl-${depth * 4}` : '';

    if (hasSubItems) {
      return (
        <li key={item.name} className="w-full relative">
          <button
            onClick={e => handleParentClick(item, e)}
            onMouseEnter={e => handleMouseEnter(item, e)}
            onMouseLeave={handleMouseLeave}
            title={!sidebarOpen ? item.name : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
              !sidebarOpen ? 'justify-center px-2' : ''
            } ${paddingClass}`}
            style={{
              // Always show active bg when any sub-item is active; on hover also show it
              background: showLight ? 'var(--sidebar-hover-bg)' : 'transparent',
            }}
            onMouseEnter={e => {
              handleMouseEnter(item, e);
              // show hover bg only if not already permanently active
              if (!showLight) (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-hover-bg)';
            }}
            onMouseLeave={e => {
              handleMouseLeave();
              // restore to permanent active bg OR transparent
              (e.currentTarget as HTMLButtonElement).style.background = showLight ? 'var(--sidebar-hover-bg)' : 'transparent';
            }}
          >
            {/* Icon — gold when inactive, purple when active/hover */}
            <span
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
              style={{ color: showLight ? 'var(--sidebar-hover-text)' : 'var(--sidebar-icon)' }}
            >
              {item.icon}
            </span>
            {sidebarOpen && (
              <>
                <span
                  className="text-sm font-medium flex-1 text-left"
                  style={{ color: showLight ? 'var(--sidebar-hover-text)' : 'var(--sidebar-text)' }}
                >
                  {item.name}
                </span>
                <span
                  className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
                  style={{ color: showLight ? 'var(--sidebar-hover-text)' : 'var(--sidebar-text)' }}
                >
                  {/* Use isOpen for chevron direction */}
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              </>
            )}
          </button>

          {/* Expanded submenu */}
          {sidebarOpen && isOpen && (
            <ul className="mt-1 space-y-1">
              {item.subItems!.map(subItem => (
                <li key={subItem.name} className="w-full">
                  {subItem.subItems ? (
                    renderMenuItem(subItem, depth + 1)
                  ) : (
                    <NavLink
                      to={subItem.path}
                      className={({ isActive: navActive }) => {
                        const isSubActive = resolveIsActive(subItem.path, navActive);
                        return [
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                          'transition-all duration-200 ml-4 whitespace-nowrap',
                          'sidebar-nav-link',
                          isSubActive ? 'is-active' : '',
                        ].join(' ');
                      }}
                    >
                      {({ isActive: navActive }) => {
                        const isSubActive = resolveIsActive(subItem.path, navActive);
                        return (
                          <>
                            <span className="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center"
                              style={{ color: isSubActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-icon)' }}>
                              {subItem.icon}
                            </span>
                            <span className="text-sm font-medium"
                              style={{ color: isSubActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}>
                              {subItem.name}
                            </span>
                          </>
                        );
                      }}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Hover tooltip for collapsed sidebar */}
          {!sidebarOpen && isHovered && item.subItems && (
            <div
              className="fixed rounded-lg py-2 z-50 min-w-[220px] themed-transition"
              style={{
                top: hoverPosition.top,
                left: hoverPosition.left,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
              onMouseEnter={() => setHoveredMenu(item.name)}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="px-3 py-2 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {item.name}
                </span>
              </div>
              {item.subItems.map(subItem => (
                <NavLink
                  key={subItem.name}
                  to={subItem.path}
                  className="flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap"
                  style={({ isActive }) =>
                    isActive
                      ? { background: 'var(--sidebar-hover-bg)', color: 'var(--sidebar-hover-text)' }
                      : { color: 'var(--text)' }
                  }
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'var(--hover-bg)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--sidebar-hover-text)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
                  }}
                  onClick={() => setHoveredMenu(null)}
                >
                  <span className="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center">
                    {subItem.icon}
                  </span>
                  <span>{subItem.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </li>
      );
    }

    // Simple nav link (no dropdown)
    return (
      <li key={item.name} className="w-full">
        <NavLink
          to={item.path!}
          title={!sidebarOpen ? item.name : ''}
          className={({ isActive: navActive }) => {
            const active = resolveIsActive(item.path!, navActive);
            return [
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'transition-all duration-200 w-full whitespace-nowrap',
              !sidebarOpen ? 'justify-center px-2' : '',
              paddingClass,
              'sidebar-nav-link',
              active ? 'is-active' : '',
            ].join(' ');
          }}
        >
          {({ isActive: navActive }) => {
            const active = resolveIsActive(item.path!, navActive);
            return (
              <>
                <span
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                  style={{ color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-icon)' }}
                >
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span
                    className="text-sm font-medium"
                    style={{ color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}
                  >
                    {item.name}
                  </span>
                )}
              </>
            );
          }}
        </NavLink>
      </li>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] themed-transition z-20 overflow-visible ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
      style={{
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        transition: 'width 300ms, background-color var(--transition), border-color var(--transition)',
      }}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-visible">
          <ul className="space-y-1 px-2">
            {menuItems.map(item => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Help section */}
        {sidebarOpen ? (
          <div
            className="p-4 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div
              className="p-3 rounded-lg"
              style={{ background: 'var(--hover-bg)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={16} style={{ color: 'var(--gold)' }} />
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text)' }}>
                  Need Help?
                </span>
              </div>
              <p className="text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                Contact support
              </p>
            </div>
          </div>
        ) : (
          <div
            className="p-2 pb-6 flex justify-center flex-shrink-0"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <HelpCircle
              size={20}
              className="transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
