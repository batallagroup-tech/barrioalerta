import React from 'react';
import { Category } from '../../types';
import { CATEGORY_CONFIG } from '../../constants/categories';
import { CheckCircle2 } from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  isVerified?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  isVerified, 
  className = "" 
}) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-xl ${className}`}>
      <Icon size={14} className={config.color} />
      <span className="text-[10px] font-black text-white uppercase tracking-widest">{config.label}</span>
      {isVerified && (
        <CheckCircle2 size={12} className="text-green-400 ml-1" />
      )}
    </div>
  );
};
