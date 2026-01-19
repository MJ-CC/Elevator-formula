import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { ResultDisplay } from './ResultDisplay';
import { CalculationResult } from '../types';

export const CurrentLimitCalculator: React.FC = () => {
  const [motorCurrent, setMotorCurrent] = useState<string>('');
  const [inverterCurrent, setInverterCurrent] = useState<string>('');
  const [currentLimit, setCurrentLimit] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [targetLabel, setTargetLabel] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('');

  useEffect(() => {
    const m = parseFloat(motorCurrent);
    const i = parseFloat(inverterCurrent);
    const l = parseFloat(currentLimit);

    const hasM = !isNaN(m);
    const hasI = !isNaN(i);
    const hasL = !isNaN(l);

    // Only calculate if exactly 2 fields are filled
    const filledCount = [hasM, hasI, hasL].filter(Boolean).length;
    
    if (filledCount !== 2) {
      setResult(null);
      setTargetLabel('');
      return;
    }

    // Case 1: Calculate Current Limit (06-11)
    if (hasM && hasI) {
      if (i === 0) { setResult(null); return; }
      const val = (m / i) * 200;
      setResult({
        value: val,
        formula: '馬達額定電流 / 變頻器額定電流 × 200',
        steps: `(${m} / ${i}) × 200`
      });
      setTargetLabel('參數設定值 (06-11)');
      setTargetUnit('%');
    }
    // Case 2: Calculate Motor Current
    else if (hasI && hasL) {
      // Limit = (Motor / Inverter) * 200 => Motor = (Limit / 200) * Inverter
      const val = (l / 200) * i;
      setResult({
        value: val,
        formula: '(電流限制 / 200) × 變頻器額定電流',
        steps: `(${l} / 200) × ${i}`
      });
      setTargetLabel('馬達額定電流');
      setTargetUnit('A');
    }
    // Case 3: Calculate Inverter Current
    else if (hasM && hasL) {
      // Limit = (Motor / Inverter) * 200 => Inverter = (Motor * 200) / Limit
      if (l === 0) { setResult(null); return; }
      const val = (m * 200) / l;
      setResult({
        value: val,
        formula: '馬達額定電流 × 200 / 電流限制',
        steps: `(${m} × 200) / ${l}`
      });
      setTargetLabel('變頻器額定電流');
      setTargetUnit('A');
    }

  }, [motorCurrent, inverterCurrent, currentLimit]);

  const handleReset = () => {
    setMotorCurrent('');
    setInverterCurrent('');
    setCurrentLimit('');
    setResult(null);
  };

  const getFieldStatus = (val: string) => {
    const filledCount = [motorCurrent, inverterCurrent, currentLimit].filter(v => v !== '').length;
    if (!val && filledCount === 2) return 'bg-blue-50 border-blue-200 placeholder-blue-300';
    return 'bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <Card 
      title="電流限制 (06-11)" 
      icon={<Zap className="w-6 h-6" />}
      description="輸入任2項數值即可計算"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="motorCurrent" className="block text-sm font-medium text-slate-700 mb-1">
              馬達額定電流 (A)
            </label>
            <input
              type="number"
              id="motorCurrent"
              value={motorCurrent}
              onChange={(e) => setMotorCurrent(e.target.value)}
              placeholder=""
              className={`block w-full rounded-md shadow-sm sm:text-sm p-3 border ${getFieldStatus(motorCurrent)}`}
            />
          </div>
          
          <div>
            <label htmlFor="inverterCurrent" className="block text-sm font-medium text-slate-700 mb-1">
              變頻器額定電流 (A)
            </label>
            <input
              type="number"
              id="inverterCurrent"
              value={inverterCurrent}
              onChange={(e) => setInverterCurrent(e.target.value)}
              placeholder=""
              className={`block w-full rounded-md shadow-sm sm:text-sm p-3 border ${getFieldStatus(inverterCurrent)}`}
            />
          </div>

          <div>
            <label htmlFor="currentLimit" className="block text-sm font-medium text-slate-700 mb-1">
              電流限制 (%)
            </label>
            <input
              type="number"
              id="currentLimit"
              value={currentLimit}
              onChange={(e) => setCurrentLimit(e.target.value)}
              placeholder=""
              className={`block w-full rounded-md shadow-sm sm:text-sm p-3 border ${getFieldStatus(currentLimit)}`}
            />
          </div>
        </div>

        <ResultDisplay result={result} label={targetLabel} unit={targetUnit} />

        {(motorCurrent || inverterCurrent || currentLimit) && (
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