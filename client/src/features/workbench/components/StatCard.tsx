import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  value: number | string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export const StatCard = ({ value, label, icon: Icon, iconColor, iconBgColor }: StatCardProps) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 truncate">{label}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center shrink-0`}>
        <Icon className={iconColor} size={20} />
      </div>
    </div>
  );
};
