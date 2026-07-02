import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Settings, ChevronDown, Search, HelpCircle, Grid, Diamond, Sparkles } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-800 via-amber-600 to-yellow-600 shadow-xl z-[100000] h-16">
      {/* Decorative sparkle overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNCAyNHYyaC04di0yaDh6TTI4IDMwdjJoLTR2LTRoNHYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
      
      <div className="flex items-center justify-between px-4 h-full relative z-10">
        {/* Left Section - Logo & Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-yellow-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2.5 ml-1">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 border border-yellow-200/30">
              <Diamond size={18} className="text-amber-800" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg tracking-wider flex items-center gap-1.5">
                GoldInventory
                <Sparkles size={12} className="text-yellow-300" />
              </h1>
              <p className="text-yellow-200/80 text-[10px] -mt-0.5 tracking-wider">Premium Jewelry Management</p>
            </div>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-300/60" />
            <input
              type="text"
              placeholder="Search diamonds, gold, inventory..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-yellow-200/60 border border-yellow-300/20 focus:outline-none focus:ring-2 focus:ring-yellow-300/40 focus:bg-white/20 transition-all backdrop-blur"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-yellow-200/50 bg-white/10 px-1.5 py-0.5 rounded border border-yellow-300/10 hidden sm:block">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-0.5">
          {/* Quick Action - Sparkles */}
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-yellow-200/80 hidden sm:block">
            <Sparkles size={18} />
          </button>

          {/* Help */}
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-yellow-200/80 hidden sm:block">
            <HelpCircle size={18} />
          </button>

          {/* Apps */}
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-yellow-200/80 hidden sm:block">
            <Grid size={18} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-yellow-200/80 relative"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></span>
            </button>
            
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 border border-amber-100">
                  <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-xl">
                    <h3 className="text-sm font-semibold text-amber-800">Notifications</h3>
                    <button className="text-xs text-amber-600 hover:text-amber-700 font-medium">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-amber-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="text-sm text-gray-700">Gold price updated to ₹72,500</p>
                          <p className="text-xs text-gray-400 mt-0.5">2 min ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-amber-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="text-sm text-gray-700">New diamond "Princess Cut" added</p>
                          <p className="text-xs text-gray-400 mt-0.5">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-amber-50 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 bg-amber-600 rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="text-sm text-gray-700">Gold inventory adjustment completed</p>
                          <p className="text-xs text-gray-400 mt-0.5">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 border-t border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-b-xl">
                    <button className="w-full text-center text-xs text-amber-600 hover:text-amber-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 border border-yellow-200/30">
                <span className="text-amber-800 font-bold text-sm">JD</span>
              </div>
              <span className="hidden md:inline text-sm text-white/90 font-medium">John</span>
              <ChevronDown size={16} className="text-yellow-300/60" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 border border-amber-100">
                  <div className="px-4 py-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-xl">
                    <p className="text-sm font-semibold text-amber-800">John Doe</p>
                    <p className="text-xs text-gray-500">john.doe@company.com</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-medium">Admin</span>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full font-medium flex items-center gap-0.5">
                        <Diamond size={8} />
                        Premium
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                    >
                      <User size={15} className="text-amber-600" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                    >
                      <Settings size={15} className="text-amber-600" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-amber-50" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
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