// src/components/Reports/ReportStats.tsx

import React from 'react';
import { FileText, Users, TrendingUp, Calendar } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

const ReportStats: React.FC = () => {
  const stats: StatItem[] = [
    {
      label: 'Total Reports',
      value: '94',
      change: '+12 this month',
      icon: <FileText className="h-5 w-5" />,
      color: 'blue',
    },
    {
      label: 'Shared Reports',
      value: '23',
      change: '+5 shared',
      icon: <Users className="h-5 w-5" />,
      color: 'green',
    },
    {
      label: 'Generated Today',
      value: '8',
      change: '+3 new',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'purple',
    },
    {
      label: 'Scheduled',
      value: '12',
      change: 'Next: Tomorrow',
      icon: <Calendar className="h-5 w-5" />,
      color: 'orange',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
            <div className={`p-2 rounded-lg ${colorMap[stat.color as keyof typeof colorMap]}`}>
              {stat.icon}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            {stat.change && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportStats;