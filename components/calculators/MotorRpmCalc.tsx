import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { ResultDisplay } from '../ResultDisplay';
import { CalculatorProps } from '../../types';
import { Activity } from 'lucide-react';

type Mode = 'RPM' | 'HZ' | 'POLES';

// Component defined OUTSIDE to preserve focus and style consistency
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
          className={`w-full px-3 py-2 border rounded-lg outline-none font-mono ${
            isTarget 
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold cursor-not-allowed' 
              : 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500'
          }`}
          placeholder=""
        />
        {unit && <span className="absolute right-3 top-2 text-slate-400 text-xs">{unit}</span>}
      </div>
    </div>
  );
};

export const MotorRpmCalc: React.FC<CalculatorProps> = (props) => {
  const [mode, setMode] = useState<Mode>('RPM');
  const [rpm, setRpm] = useState('');
  const [hz, setHz] = useState('');
  const [poles, setPoles] = useState('');

  const [result, setResult] = useState<{ val: string, steps: string[] }>({ val: '', steps: [] });

  useEffect(() => {
    const vRpm = parseFloat(rpm);
    const vHz = parseFloat(hz);
    const vPoles = parseFloat(poles);

    let val = '';
    let steps: string[] = [];

    if (mode === 'RPM') {
      if (vHz && vPoles) {
        const res = (120 * vHz) / vPoles;
        val = res.toFixed(0);
        steps = [`120 × ${vHz}Hz ÷ ${vPoles}P = ${val}`];
      }
    } else if (mode === 'HZ') {
      if (vRpm && vPoles) {
        const res = (vRpm * vPoles) / 120;
        val = res.toFixed(2);
        steps = [`(${vRpm} × ${vPoles}) ÷ 120 = ${val}`];
      }
    } else if (mode === 'POLES') {
      if (vRpm && vHz) {
        const res = (120 * vHz) / vRpm;
        val = res.toFixed(1); // Poles should be integer usually, but calc can be float
        steps = [`(120 × ${vHz}) ÷ ${vRpm} = ${val}`];
      }
    }

    setResult({ val, steps });
  }, [mode, rpm, hz, poles]);

  return (
    <Card 
      title="馬達轉速 (RPM)" 
      icon={<Activity />} 
      categoryTag="馬達"
      {...props}
    >
      <div className="space-y-4">
        {/* Simple Mode Switch */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-sm mb-2">
            <button onClick={() => setMode('RPM')} className={`flex-1 py-1 rounded ${mode === 'RPM' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>算 RPM</button>
            <button onClick={() => setMode('HZ')} className={`flex-1 py-1 rounded ${mode === 'HZ' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>算 Hz</button>
            <button onClick={() => setMode('POLES')} className={`flex-1 py-1 rounded ${mode === 'POLES' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>算極數</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <InputField 
            label="馬達轉速" 
            value={mode === 'RPM' ? result.val : rpm} 
            onChange={setRpm} 
            isTarget={mode === 'RPM'} 
            unit="RPM" 
          />
          <InputField 
            label="頻率" 
            value={mode === 'HZ' ? result.val : hz} 
            onChange={setHz} 
            isTarget={mode === 'HZ'} 
            unit="Hz" 
          />
          <InputField 
            label="極數" 
            value={mode === 'POLES' ? result.val : poles} 
            onChange={setPoles} 
            isTarget={mode === 'POLES'} 
            unit="P" 
          />
        </div>
        
        {result.val && (
           <ResultDisplay label="結果" result={result.val} steps={result.steps} />
        )}
      </div>
    </Card>
  );
};