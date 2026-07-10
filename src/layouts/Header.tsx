import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Bell, User, LogOut, Settings,
  ChevronDown, Search, HelpCircle, Diamond,
} from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100000] h-16 themed-transition"
      style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)',
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-full">

        {/* ── Left: hamburger + logo ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--header-icon)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--header-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 ml-1">
            {/* Logo icon — gold ring always */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8960C 100%)' }}
            >
              <Diamond size={17} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1
                className="font-bold text-base tracking-wide leading-tight"
                style={{ color: 'var(--header-text)' }}
              >
                GoldInventory
              </h1>
              <p
                className="text-[10px] -mt-0.5 tracking-wider"
                style={{ color: 'var(--header-text-secondary)' }}
              >
                Premium Jewelry Management
              </p>
            </div>
          </Link>
        </div>

        {/* ── Center: search ── */}
        <div className="hidden md:flex flex-1 max-w-xs mx-6">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: 'var(--header-icon)' }}
            />
            <input
              type="text"
              placeholder="Search (Ctrl + /)"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg transition-all focus:outline-none"
              style={{
                background: 'var(--hover-bg)',
                border: '1px solid var(--border)',
                color: 'var(--header-text)',
              }}
            />
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-0.5">

          {/* Help */}
          <button
            className="p-2 rounded-lg transition-colors hidden sm:flex items-center justify-center"
            style={{ color: 'var(--header-icon)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--header-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
            title="Help"
          >
            <HelpCircle size={18} />
          </button>

          {/* Theme toggle */}
          <ThemeToggle variant="header" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(v => !v); setShowUserMenu(false); }}
              className="p-2 rounded-lg transition-colors relative"
              style={{ color: 'var(--header-icon)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--header-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--primary)' }}
              />
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div
                  className="absolute right-0 mt-2 w-80 rounded-xl z-50 overflow-hidden themed-transition"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      Notifications
                    </span>
                    <button className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {[
                      { text: 'Gold price updated to ₹72,500', time: '2 min ago' },
                      { text: 'New diamond "Princess Cut" added', time: '1 hour ago' },
                      { text: 'Gold inventory adjustment completed', time: '3 hours ago' },
                    ].map((n, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: 'var(--gold)' }}
                          />
                          <div>
                            <p className="text-sm" style={{ color: 'var(--text)' }}>{n.text}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="px-4 py-2.5 text-center"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <button className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative ml-1">
            <button
              onClick={() => { setShowUserMenu(v => !v); setShowNotifications(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--header-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
              aria-label="User menu"
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #5B21B6 100%)' }}
              >
                JD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--header-text)' }}>
                  John
                </p>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--header-text-secondary)' }}>
                  Administrator
                </p>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--header-icon)' }} className="hidden md:block" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl z-50 overflow-hidden themed-transition"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {/* Profile header */}
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>John Doe</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      john.doe@company.com
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                      >
                        Admin
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5"
                        style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}
                      >
                        <Diamond size={8} /> Premium
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--text)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                    >
                      <User size={15} style={{ color: 'var(--primary)' }} />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--text)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                    >
                      <Settings size={15} style={{ color: 'var(--primary)' }} />
                      Settings
                    </Link>

                    {/* Theme toggle row */}
                    <div
                      className="flex items-center justify-between px-4 py-2"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Theme</span>
                      <ThemeToggle variant="pill" />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)' }} className="my-1" />
                    <button
                      className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors"
                      style={{ color: 'var(--danger)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
