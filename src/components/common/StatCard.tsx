import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'indigo'
}: StatCardProps) {
  const iconBg = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }[accentColor];

  return (
    <Card className="flex flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${iconBg} shrink-0`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={`font-semibold ml-auto ${trend.positive ? 'text-emerald-600' : 'text-slate-500'}`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
