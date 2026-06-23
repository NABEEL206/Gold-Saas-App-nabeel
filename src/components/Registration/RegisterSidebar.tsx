import React from 'react';
import { Package, Calculator, Wallet, BarChart3, Truck } from 'lucide-react';
import logo from '../../assets/logo/gold-app-icon.png';

const registrationFeatures = [
  { icon: Package, title: 'Real-time Gold Inventory Tracking', description: 'Track 22K, 24K, coins, bars, and jewelry items' },
  { icon: Calculator, title: 'Automated Accounting', description: 'GST calculations, P&L statements, balance sheets' },
  { icon: Wallet, title: 'Daily Gold Rate Integration', description: 'Live market rates for accurate valuation' },
  { icon: BarChart3, title: 'Advanced Analytics & Reports', description: 'Sales trends, profit margins, inventory turnover' },
  { icon: Truck, title: 'Purchase & Sales Management', description: 'Bills, invoices, customer/vendor management' },
];

export const RegisterSidebar: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-600 to-amber-800 text-white p-12 flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-12">
        <div className="w-16 h-16  rounded-2xl overflow-hidden ">
          <img
            src={logo}
            alt="Gold App Logo"
            className="w-full h-full object-cover"
          />
        </div>
          <div>
            <span className="text-xl font-bold tracking-tight">Geumia</span>
            <p className="text-xs text-amber-200">Accounting & Inventory Management</p>
          </div>
        </div>
        
        {/* Main Heading */}
        <h2 className="text-4xl font-bold leading-tight mb-8">
          Complete Accounting & Inventory Solution for Gold Businesses
        </h2>
        
        {/* Features List */}
        <div className="space-y-6">
          {registrationFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-lg">{feature.title}</p>
                <p className="text-amber-200 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Trust Badge */}
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mt-8">
        <p className="text-sm font-semibold">⭐ Trusted by 10,000+ jewelry businesses across India</p>
        <div className="flex gap-4 mt-2 text-xs text-amber-200">
          <span>✓ 30-50% manual tasks automated</span>
          <span>✓ 20-30% inventory cost reduction</span>
        </div>
      </div>
    </div>
  );
};