import React from 'react';
import { CalculationResult } from '../types';
import { Calculator, ArrowRight } from 'lucide-react';

interface ResultDisplayProps {
  result: CalculationResult | null;
  label: string;
  unit?: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, label, unit }) => {
  if (!result) return null;

  const displayValue = typeof result.value === 'number' 
    ? (Number.isInteger(result.value) ? result.value.toString() : result.value.toFixed(2))
    : result.value;

  return (
    <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100 animate-fade-in shadow-inner">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-800">計算結果</span>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-slate-600">{label}:</span>
          <span className="text-2xl font-bold text-blue-700 font-mono">
            {displayValue}
            {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
          </span>
        </div>

        <div className="border-t border-blue-200 pt-3">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">使用公式</p>
          <code className="block bg-white px-2 py-1.5 rounded text-xs text-slate-700 font-mono border border-blue-100 shadow-sm overflow-x-auto">
            {result.formula}
          </code>
        </div>
        
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">驗算過程</p>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono flex-wrap">
            {result.steps} <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" /> <span className="font-bold text-blue-800">{displayValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};