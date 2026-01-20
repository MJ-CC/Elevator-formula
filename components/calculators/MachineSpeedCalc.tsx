import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { ResultDisplay } from '../ResultDisplay';
import { CalculatorProps, PI } from '../../types';
import { Settings } from 'lucide-react';

type Mode = 'SPEED' | 'RPM' | 'DIA' | 'RATIO' | 'ROPING';

// Component defined OUTSIDE to preserve focus
const InputField = ({ label, value, onChange, isTarget, unit, placeholder }: any) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isTarget) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => !isTarget && onChange(e.target.value)}
          onFocus={handleFocus}
          readOnly={isTarget}
          className={`w-full px-3 py-2 border rounded-lg outline-none font-mono text-sm ${
            isTarget 
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold cursor-not-allowed' 
              : 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500'
          }`}
          placeholder={isTarget ? "計算..." : placeholder}
        />
        {unit && <span className="absolute right-3 top-2 text-slate-400 text-xs">{unit}</span>}
      </div>
    </div>
  );
};

export const MachineSpeedCalc: React.FC<CalculatorProps> = (props) => {
  const [mode, setMode] = useState<Mode>('SPEED');
  const [speed, setSpeed] = useState('');
  const [rpm, setRpm] = useState('');
  const [diameter, setDiameter] = useState('');
  const [ratio, setRatio] = useState('');
  const [roping, setRoping] = useState('2:1');

  const [calcResult, setCalcResult] = useState<{ val: string, steps: string[] }>({ val: '', steps: [] });

  // Helper to parse ratio like "43:2" or "43：2" -> 21.5
  const parseRatio = (str: string): number => {
    // Normalize Chinese colon to standard colon
    const normalized = str.replace(/：/g, ':');
    
    if (normalized.includes(':')) {
      const [n, d] = normalized.split(':').map(Number);
      return d !== 0 ? n / d : 0;
    }
    return parseFloat(normalized) || 0;
  };

  useEffect(() => {
    const vSpeed = parseFloat(speed);
    const vRpm = parseFloat(rpm);
    const vDia = parseFloat(diameter);
    const vRatio = parseRatio(ratio);
    const vRoping = parseRatio(roping); // "2:1" -> 2

    let val = '';
    let steps: string[] = [];

    // Correct Formula: Speed = (RPM * PI * Dia/1000) / (Ratio * Roping)
    try {
      if (mode === 'SPEED') {
        if (vRpm && vDia && vRatio && vRoping) {
          const res = (vRpm * PI * (vDia / 1000)) / (vRatio * vRoping);
          val = res.toFixed(2);
          steps = [`(${vRpm} × 3.14 × (${vDia}÷1000)) ÷ (${vRatio.toFixed(2)} × ${vRoping}) = ${val}`];
        }
      } else if (mode === 'RPM') {
        if (vSpeed && vDia && vRatio && vRoping) {
          // RPM = (Speed * Ratio * Roping) / (PI * Dia/1000)
          const res = (vSpeed * vRatio * vRoping) / (PI * (vDia / 1000));
          val = res.toFixed(1);
          steps = [`(${vSpeed} × ${vRatio.toFixed(2)} × ${vRoping}) ÷ (3.14 × (${vDia}÷1000)) = ${val}`];
        }
      } else if (mode === 'DIA') {
        if (vSpeed && vRpm && vRatio && vRoping) {
          // Dia = (Speed * Ratio * Roping * 1000) / (RPM * PI)
          const res = (vSpeed * vRatio * vRoping * 1000) / (vRpm * PI);
          val = res.toFixed(1);
          steps = [`(${vSpeed} × ${vRatio.toFixed(2)} × ${vRoping} × 1000) ÷ (${vRpm} × 3.14) = ${val}`];
        }
      } else if (mode === 'RATIO') {
        if (vSpeed && vRpm && vDia && vRoping) {
          // Ratio = (RPM * PI * Dia/1000) / (Speed * Roping)
          const res = (vRpm * PI * (vDia / 1000)) / (vSpeed * vRoping);
          val = res.toFixed(2);
          steps = [`(${vRpm} × 3.14 × (${vDia}÷1000)) ÷ (${vSpeed} × ${vRoping}) = ${val}`];
        }
      } else if (mode === 'ROPING') {
         // Roping = (RPM * PI * Dia/1000) / (Speed * Ratio)
         if (vSpeed && vRpm && vDia && vRatio) {
            const res = (vRpm * PI * (vDia / 1000)) / (vSpeed * vRatio);
            val = res.toFixed(2);
            steps = [`(${vRpm} × 3.14 × (${vDia}÷1000)) ÷ (${vSpeed} × ${vRatio.toFixed(2)}) = ${val}`];
         }
      }
    } catch (e) {
      val = 'Error';
    }

    setCalcResult({ val, steps });
  }, [mode, speed, rpm, diameter, ratio, roping]);

  return (
    <Card 
      title="主機速度計算" 
      icon={<Settings />} 
      categoryTag="馬達"
      {...props}
    >
      <div className="space-y-4">
        {/* Target Selector */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <label className="text-sm font-medium text-slate-700 block mb-2">選擇計算目標：</label>
           <div className="flex flex-wrap gap-2">
             {[
               {id: 'SPEED', label: '速度'},
               {id: 'RPM', label: '轉速'},
               {id: 'DIA', label: '輪徑'},
               {id: 'RATIO', label: '減速比'},
               {id: 'ROPING', label: '吊掛比'}
             ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id as Mode)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    mode === opt.id 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {opt.label}
                </button>
             ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="額定速度" 
            value={mode === 'SPEED' ? calcResult.val : speed} 
            onChange={setSpeed} 
            isTarget={mode === 'SPEED'} 
            unit="m/min"
            placeholder=""
          />
          <InputField 
            label="馬達轉速" 
            value={mode === 'RPM' ? calcResult.val : rpm} 
            onChange={setRpm} 
            isTarget={mode === 'RPM'} 
            unit="RPM"
            placeholder=""
          />
          <InputField 
            label="主機輪徑" 
            value={mode === 'DIA' ? calcResult.val : diameter} 
            onChange={setDiameter} 
            isTarget={mode === 'DIA'} 
            unit="mm"
            placeholder=""
          />
          <InputField 
            label="減速比" 
            value={mode === 'RATIO' ? calcResult.val : ratio} 
            onChange={setRatio} 
            isTarget={mode === 'RATIO'} 
            placeholder="例如：43:2" 
          />
          <div className="col-span-2 sm:col-span-1">
             {mode === 'ROPING' ? (
                <InputField 
                  label="吊掛比" 
                  value={calcResult.val} 
                  onChange={setRoping} 
                  isTarget={true} 
                />
             ) : (
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-500 mb-1">吊掛比</label>
                  <select 
                    value={roping} 
                    onChange={(e) => setRoping(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="1:1">1:1 (1)</option>
                    <option value="2:1">2:1 (2)</option>
                    <option value="4:1">4:1 (4)</option>
                  </select>
                </div>
             )}
          </div>
        </div>

        {calcResult.val && calcResult.val !== 'Error' && (
          <ResultDisplay 
            label="計算結果" 
            result={calcResult.val}
            steps={calcResult.steps} 
          />
        )}
      </div>
    </Card>
  );
};