import React, { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CardProps {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  categoryTag?: string;
  highlight?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  icon, 
  isOpen, 
  onToggle, 
  children,
  categoryTag,
  highlight 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg transition-all duration-300 border ${highlight ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-100'}`}>
      <button 
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-600 p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
            {categoryTag && (
              <span className="text-xs font-medium text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                {categoryTag}
              </span>
            )}
          </div>
        </div>
        <div className="text-slate-400 hover:text-blue-600 transition-colors">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="h-px bg-slate-100 mb-4 w-full" />
          {children}
        </div>
      )}
    </div>
  );
};