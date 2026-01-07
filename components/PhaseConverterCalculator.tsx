import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { ResultDisplay } from './ResultDisplay';
import { CalculationResult } from '../types';

export const PhaseConverterCalculator: React.FC = () => {
  const [powerKw, setPowerKw] = useState<string>('');
  const [converterSpec, setConverterSpec] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [targetLabel, setTargetLabel] = useState<string>('');

  useEffect(() => {
    const kw = parseFloat(powerKw);
    const spec = parseFloat(converterSpec);
    
    const hasKw = !isNaN(kw);
    const hasSpec = !isNaN(spec);

    // Formula: Spec = KW * 7.457 * 3
    const FACTOR = 7.457 * 3; // 22.371

    if (hasKw && !hasSpec) {
      // Calculate Spec
      const val = kw * FACTOR;
      setResult({
        value: val,
        formula: '主機瓦數(kW) × 7.457 × 3',
        steps: `${kw} × 22.371`
      });
      setTargetLabel('計算變相器規格');
    } else if (!hasKw && hasSpec) {
      // Calculate KW
      const val = spec / FACTOR;
      setResult({
        value: val,
        formula: '變相器規格 / (7.457 × 3)',
        steps: `${spec} / 22.371`
      });
      setTargetLabel('計算主機瓦數(kW)');
    } else {
      setResult(null);
      setTargetLabel('');
    }
  }, [powerKw, converterSpec]);

  const handleReset = () => {
    setPowerKw('');
    setConverterSpec('');
    setResult(null);
  };

  const getFieldStatus = (val: string, otherVal: string) => {
    if (!val && otherVal) return 'bg-blue-50 border-blue-200 placeholder-blue-400';
    if (!val) return 'bg-slate-50 border-slate-300';
    return 'bg-white border-slate-300';
  };

  return (
    <Card 
      title="變相器規格計算" 
      icon={<Zap className="w-6 h-6" />}
      description="主機瓦數與變相器規格自動換算"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">主機瓦數 (kW)</label>
            <input
              type="number"
              value={powerKw}
              onChange={(e) => setPowerKw(e.target.value)}
              placeholder={converterSpec ? "自動計算" : "輸入..."}
              className={`block w-full rounded-md shadow-sm text-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldStatus(powerKw, converterSpec)}`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">變相器規格</label>
            <input
              type="number"
              value={converterSpec}
              onChange={(e) => setConverterSpec(e.target.value)}
              placeholder={powerKw ? "自動計算" : "輸入..."}
              className={`block w-full rounded-md shadow-sm text-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldStatus(converterSpec, powerKw)}`}
            />
          </div>
        </div>

        <ResultDisplay result={result} label={targetLabel} />
        
        {(powerKw || converterSpec) && (
          <button 
            onClick={handleReset}
            className="flex items-center justify-center w-full mt-4 text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> 重置
          </button>
        )}
      </div>
    </Card>
  );
};