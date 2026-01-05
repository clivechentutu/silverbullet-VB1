import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
}

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  iconColor = 'text-brand-500'
}: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center h-full animate-fade-in-up">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 mx-auto">
          <Icon size={32} className={iconColor} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="bg-brand-600 hover:bg-brand-500 text-white"
            data-testid="button-empty-state-action"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
