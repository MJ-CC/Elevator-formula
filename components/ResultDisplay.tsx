import React from 'react';

interface ResultDisplayProps {
  label: string;
  result: string | number;
  unit?: string;
  steps?: string[];
  subResult?: React.ReactNode;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, result, unit, steps, subResult }) => {
  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{result}</span>
          {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
        </div>
      </div>
      
      {subResult && (
        <div className="mb-3 text-right">
          {subResult}
        </div>
      )}

      {steps && steps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-400 mb-1">驗算過程：</p>
          <ul className="space-y-1">
            {steps.map((step, idx) => (
              <li key={idx} className="text-sm text-slate-600 font-mono bg-white px-2 py-1 rounded border border-slate-100">
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};