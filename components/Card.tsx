import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  description?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="text-blue-600">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};