import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useExpandContext } from './ExpandContext';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  description?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, description }) => {
  const { trigger, shouldExpand } = useExpandContext();
  const [isOpen, setIsOpen] = useState(true);

  // Sync with global expand/collapse trigger
  useEffect(() => {
    if (trigger > 0) {
      setIsOpen(shouldExpand);
    }
  }, [trigger, shouldExpand]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div 
        className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-600">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        <button 
          className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
          aria-label={isOpen ? "摺疊" : "展開"}
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      
      {isOpen && (
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};