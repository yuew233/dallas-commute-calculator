import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, subValue, icon: Icon, colorClass, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start space-x-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        {subValue && (
          <p className={`text-sm mt-1 ${trend === 'down' ? 'text-emerald-600' : trend === 'up' ? 'text-rose-600' : 'text-slate-500'}`}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};