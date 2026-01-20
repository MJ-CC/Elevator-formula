import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { ResultDisplay } from '../ResultDisplay';
import { CalculatorProps } from '../../types';
import { Binary } from 'lucide-react';

type Mode = 'HEX' | 'SPEED' | 'RPM' | 'PPR';

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
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => !isTarget && onChange(e.target.value)}
          onFocus={handleFocus}
          readOnly={isTarget}
          className={`w-full px-3 py-2 border rounded-lg outline-none font-mono ${
            isTarget 
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold cursor-not-allowed' 
              : 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500'
          }`}
          placeholder={isTarget ? "計算中..." : placeholder}
        />
        {unit && <span className="absolute right-3 top-2 text-slate-400 text-xs">{unit}</span>}
      </div>
    </div>
  );
};

export const FreqDivCalc: React.FC<CalculatorProps> = (props) => {
  const [mode, setMode] = useState<Mode>('HEX');
  const [hexVal, setHexVal] = useState('');
  const [speed, setSpeed] = useState('');
  const [rpm, setRpm] = useState('');
  const [ppr, setPpr] = useState('');
  const [isDeltaVL, setIsDeltaVL] = useState(false);

  const [result, setResult] = useState<{ val: string, sub?: React.ReactNode, steps: string[] }>({ val: '', steps: [] });

  useEffect(() => {
    // Inputs
    const vSpeedRaw = parseFloat(speed);
    const vSpeed = vSpeedRaw < 60 ? 60 : vSpeedRaw; // Min 60 logic
    const vRpm = parseFloat(rpm);
    const vPpr = parseFloat(ppr);
    
    // Hex Input parsing
    const vHexDec = parseInt(hexVal, 16);

    let val = '';
    let sub: React.ReactNode = null;
    let steps: string[] = [];

    const factor = isDeltaVL ? 10 : 1;

    // Base formula for Hex(Dec): (4096 * Speed * 1000) / (RPM * PPR * 0.75)
    // Formula requested: 64*64 / (0.75 / (Speed / (RPM/1000) / PPR))
    // Simplified: (4096 * Speed * 1000) / (RPM * PPR * 0.75)

    if (mode === 'HEX') {
      if (vSpeed && vRpm && vPpr) {
        const num = 4096 * vSpeed * 1000; 
        const den = vRpm * vPpr * 0.75 * factor;
        const res = Math.round(num / den);
        
        // Pad with 0 to ensure 4 digits
        val = res.toString(16).toUpperCase().padStart(4, '0');
        
        // High/Low Bytes
        const high = (res >> 8).toString(16).toUpperCase().padStart(2, '0');
        const low = (res & 0xFF).toString(16).toUpperCase().padStart(2, '0');
        
        sub = (
            <div className="flex gap-4 justify-end text-sm font-mono">
              <span className="text-slate-600">E57F: <span className="font-bold text-slate-800">{high}</span></span>
              <span className="text-slate-600">E57E: <span className="font-bold text-slate-800">{low}</span></span>
            </div>
        );

        const formulaBase = `64×64 ÷ (0.75 ÷ (${vSpeed} ÷ (${vRpm}/1000) ÷ ${vPpr}))`;
        steps = [
          `若速度 < 60，以 60 計算 (當前: ${vSpeed})`,
          `公式: ${formulaBase}${isDeltaVL ? ' ÷ 10' : ''}`,
          `結果(Dec) = ${res}`,
          `結果(Hex) = ${val}`
        ];
      }
    } else if (mode === 'SPEED') {
      if (vHexDec && vRpm && vPpr) {
         // Speed = (Dec * RPM * PPR * 0.75 * factor) / (4096 * 1000)
         const num = vHexDec * vRpm * vPpr * 0.75 * factor;
         const den = 4096 * 1000;
         const res = num / den;
         val = res.toFixed(2);
         steps = [`反推速度: (${vHexDec}(Dec) × ${vRpm} × ${vPpr} × 0.75${isDeltaVL ? ' × 10' : ''}) ÷ (4096 × 1000) = ${val}`];
      }
    } else if (mode === 'RPM') {
      if (vHexDec && vSpeed && vPpr) {
         // RPM = (4096 * Speed * 1000) / (Dec * PPR * 0.75 * factor)
         const num = 4096 * vSpeed * 1000;
         const den = vHexDec * vPpr * 0.75 * factor;
         const res = num / den;
         val = res.toFixed(1);
         steps = [`反推 RPM: (4096 × ${vSpeed} × 1000) ÷ (${vHexDec}(Dec) × ${vPpr} × 0.75${isDeltaVL ? ' × 10' : ''}) = ${val}`];
      }
    } else if (mode === 'PPR') {
      if (vHexDec && vSpeed && vRpm) {
         // PPR = (4096 * Speed * 1000) / (Dec * RPM * 0.75 * factor)
         const num = 4096 * vSpeed * 1000;
         const den = vHexDec * vRpm * 0.75 * factor;
         const res = num / den;
         val = res.toFixed(0);
         steps = [`反推 PPR: (4096 × ${vSpeed} × 1000) ÷ (${vHexDec}(Dec) × ${vRpm} × 0.75${isDeltaVL ? ' × 10' : ''}) = ${val}`];
      }
    }

    setResult({ val, sub, steps });
  }, [mode, hexVal, speed, rpm, ppr, isDeltaVL]);

  return (
    <Card 
      title="除頻數 (E57E、E57F)" 
      icon={<Binary />} 
      categoryTag="變頻驅動"
      {...props}
    >
      <div className="space-y-4">
        {/* Top Controls */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
           <div className="flex flex-wrap gap-2 mb-2">
             <button onClick={() => setMode('HEX')} className={`px-2 py-1 text-xs rounded-full border ${mode === 'HEX' ? 'bg-blue-600 text-white' : 'bg-white'}`}>算除頻數</button>
             <button onClick={() => setMode('SPEED')} className={`px-2 py-1 text-xs rounded-full border ${mode === 'SPEED' ? 'bg-blue-600 text-white' : 'bg-white'}`}>算速度</button>
             <button onClick={() => setMode('RPM')} className={`px-2 py-1 text-xs rounded-full border ${mode === 'RPM' ? 'bg-blue-600 text-white' : 'bg-white'}`}>算RPM</button>
             <button onClick={() => setMode('PPR')} className={`px-2 py-1 text-xs rounded-full border ${mode === 'PPR' ? 'bg-blue-600 text-white' : 'bg-white'}`}>算編碼器</button>
           </div>
           <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-slate-200">
            <input 
              type="checkbox" 
              checked={isDeltaVL} 
              onChange={e => setIsDeltaVL(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-slate-700">台達 VL 變頻器 (÷10)</span>
           </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="除頻數 (Hex)" 
            value={mode === 'HEX' ? result.val : hexVal} 
            onChange={setHexVal} 
            isTarget={mode === 'HEX'} 
            placeholder="" 
          />
          <InputField 
            label="額定速度" 
            value={mode === 'SPEED' ? result.val : speed} 
            onChange={setSpeed} 
            isTarget={mode === 'SPEED'} 
            unit="m/min" 
            placeholder="" 
          />
          <InputField 
            label="馬達轉速" 
            value={mode === 'RPM' ? result.val : rpm} 
            onChange={setRpm} 
            isTarget={mode === 'RPM'} 
            unit="RPM" 
          />
          <InputField 
            label="編碼器" 
            value={mode === 'PPR' ? result.val : ppr} 
            onChange={setPpr} 
            isTarget={mode === 'PPR'} 
            unit="PPR" 
            placeholder="例如：1024" 
          />
        </div>

        {result.val && (
          <ResultDisplay 
            label="計算結果" 
            result={result.val} 
            subResult={result.sub}
            steps={result.steps} 
          />
        )}
      </div>
    </Card>
  );
};