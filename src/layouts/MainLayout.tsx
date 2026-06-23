import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        <main className={`flex-1 transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}>
          <div className="p-6 mt-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;