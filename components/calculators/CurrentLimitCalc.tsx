import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { ResultDisplay } from '../ResultDisplay';
import { CalculatorProps } from '../../types';
import { Zap } from 'lucide-react';

type Mode = 'LIMIT' | 'MOTOR' | 'INVERTER';

// Component defined OUTSIDE the main component to preserve focus
const InputField = ({ label, value, onChange, isTarget, unit }: any) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isTarget) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => !isTarget && onChange(e.target.value)}
          onFocus={handleFocus}
          readOnly={isTarget}
          className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors font-mono ${
            isTarget 
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold cursor-not-allowed' 
              : 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500'
          }`}
          placeholder=""
        />
        <span className="absolute right-3 top-2 text-slate-400 text-sm">{unit}</span>
      </div>
    </div>
  );
};

export const CurrentLimitCalc: React.FC<CalculatorProps> = (props) => {
  const [mode, setMode] = useState<Mode>('LIMIT');
  const [motorAmp, setMotorAmp] = useState<string>('');
  const [invAmp, setInvAmp] = useState<string>('');
  const [limitPct, setLimitPct] = useState<string>('');
  
  const [calcResult, setCalcResult] = useState<{ val: string, steps: string[] }>({ val: '', steps: [] });

  useEffect(() => {
    const mA = parseFloat(motorAmp);
    const iA = parseFloat(invAmp);
    const lP = parseFloat(limitPct);

    let val = '';
    let steps: string[] = [];

    if (mode === 'LIMIT') {
      if (!isNaN(mA) && !isNaN(iA) && iA !== 0) {
        const res = (mA / iA) * 200;
        val = Math.round(res).toString();
        steps = [`(${mA} A ÷ ${iA} A) × 200 = ${res.toFixed(2)}`, `四捨五入: ${val}`];
      }
    } else if (mode === 'MOTOR') {
      if (!isNaN(lP) && !isNaN(iA)) {
        const res = (lP / 200) * iA;
        val = res.toFixed(1);
        steps = [`(${lP} % ÷ 200) × ${iA} A = ${res.toFixed(2)}`];
      }
    } else if (mode === 'INVERTER') {
      if (!isNaN(mA) && !isNaN(lP) && lP !== 0) {
        const res = (mA * 200) / lP;
        val = res.toFixed(1);
        steps = [`(${mA} A × 200) ÷ ${lP} % = ${res.toFixed(2)}`];
      }
    }

    setCalcResult({ val, steps });
  }, [mode, motorAmp, invAmp, limitPct]);

  return (
    <Card 
      title="電流限制 (06-11)" 
      icon={<Zap />} 
      categoryTag="變頻驅動"
      {...props}
    >
      <div className="space-y-4">
        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-sm">
          <button onClick={() => setMode('MOTOR')} className={`flex-1 py-1.5 rounded-md ${mode === 'MOTOR' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-slate-500'}`}>算馬達 A</button>
          <button onClick={() => setMode('INVERTER')} className={`flex-1 py-1.5 rounded-md ${mode === 'INVERTER' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-slate-500'}`}>算變頻器 A</button>
          <button onClick={() => setMode('LIMIT')} className={`flex-1 py-1.5 rounded-md ${mode === 'LIMIT' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-slate-500'}`}>算限制 %</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField 
            label="馬達額定電流" 
            value={mode === 'MOTOR' ? calcResult.val : motorAmp} 
            onChange={setMotorAmp} 
            isTarget={mode === 'MOTOR'} 
            unit="A" 
          />
          <InputField 
            label="變頻器額定電流" 
            value={mode === 'INVERTER' ? calcResult.val : invAmp} 
            onChange={setInvAmp} 
            isTarget={mode === 'INVERTER'} 
            unit="A" 
          />
          <InputField 
            label="電流限制" 
            value={mode === 'LIMIT' ? calcResult.val : limitPct} 
            onChange={setLimitPct} 
            isTarget={mode === 'LIMIT'} 
            unit="%" 
          />
        </div>

        {calcResult.val && (
          <ResultDisplay 
            label="計算結果" 
            result={calcResult.val} 
            unit={mode === 'LIMIT' ? '%' : 'A'}
            steps={calcResult.steps} 
          />
        )}
      </div>
    </Card>
  );
};