import React, { useState, useEffect } from 'react';
import { Compass, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { ResultDisplay } from './ResultDisplay';
import { CalculationResult } from '../types';

export const MagneticPoleCalculator: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    // Parse input as Decimal (Degrees)
    const val = parseFloat(inputValue);
    
    if (isNaN(val)) {
      setResult(null);
      return;
    }

    let calculatedValue = 0;
    let formulaStr = '';
    let stepsStr = '';

    // Logic: 
    // If val > 90: val - 90
    // If val <= 90: 360 - (90 - val)
    if (val > 90) {
      calculatedValue = val - 90;
      formulaStr = '輸入角度 - 90 = 需調整的角度';
      stepsStr = `${val} - 90`;
    } else {
      calculatedValue = 360 - (90 - val);
      formulaStr = '360 - (90 - 輸入角度) = 需調整的角度';
      stepsStr = `360 - (90 - ${val})`;
    }

    // Normalize angle to 0-359 range
    let normalizedAngle = Math.round(calculatedValue);
    while (normalizedAngle < 0) normalizedAngle += 360;
    while (normalizedAngle >= 360) normalizedAngle -= 360;

    setResult({
      value: normalizedAngle, // Return Decimal value
      formula: formulaStr,
      steps: `${stepsStr} = ${calculatedValue}`
    });

  }, [inputValue]);

  return (
    <Card 
      title="磁極角調整 (08-09)" 
      icon={<Compass className="w-6 h-6" />}
      description="用於計算磁極角度的補償值"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="angleInput" className="block text-sm font-medium text-slate-700 mb-1">
            輸入角度值 (08-09)
          </label>
          <div className="relative">
            <input
              type="number"
              id="angleInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder=""
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-slate-50 font-mono"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-blue-600">規則：</span>大於 90° 則 (輸入值 - 90)；小於 90° 則 360 - (90 - 輸入值)。
          </p>
        </div>

        <ResultDisplay result={result} label="輸出結果" />
        
        {inputValue && (
          <button 
            onClick={() => setInputValue('')}
            className="flex items-center justify-center w-full mt-4 text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> 清除輸入
          </button>
        )}
      </div>
    </Card>
  );
};