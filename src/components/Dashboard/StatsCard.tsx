import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'orange' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}) => {
  const colorClasses = {
    green: 'from-green-500 to-green-600 border-green-200',
    blue: 'from-blue-500 to-blue-600 border-blue-200',
    orange: 'from-orange-500 to-orange-600 border-orange-200',
    purple: 'from-purple-500 to-purple-600 border-purple-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 text-sm">{subtitle}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-gray-500 text-xs ml-1">vs édition précédente</span>
          </div>
        )}
      </div>
    </div>
  );
};