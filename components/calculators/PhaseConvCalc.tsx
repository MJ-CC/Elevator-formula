import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { ResultDisplay } from '../ResultDisplay';
import { CalculatorProps } from '../../types';
import { ZapOff } from 'lucide-react';

export const PhaseConvCalc: React.FC<CalculatorProps> = (props) => {
  const [kw, setKw] = useState('');
  const [spec, setSpec] = useState('');
  const [target, setTarget] = useState<'SPEC' | 'KW'>('SPEC');
  
  const [result, setResult] = useState<{ val: string, steps: string[] }>({ val: '', steps: [] });
  const FACTOR = 22.371;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  useEffect(() => {
    let val = '';
    let steps: string[] = [];

    if (target === 'SPEC') {
        const vKw = parseFloat(kw);
        if (!isNaN(vKw)) {
            const res = vKw * FACTOR;
            val = res.toFixed(2);
            steps = [`${vKw} kW × ${FACTOR} = ${val}`];
        }
    } else {
        const vSpec = parseFloat(spec);
        if (!isNaN(vSpec)) {
            const res = vSpec / FACTOR;
            val = res.toFixed(3);
            steps = [`${vSpec} ÷ ${FACTOR} = ${val} kW`];
        }
    }
    setResult({ val, steps });
  }, [target, kw, spec]);

  return (
    <Card 
      title="變相器規格" 
      icon={<ZapOff />} 
      categoryTag="變頻驅動"
      {...props}
    >
      <div className="space-y-4">
        <div className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">主機瓦數 (kW)</label>
                <input 
                    type="number" 
                    value={target === 'KW' ? result.val : kw}
                    onChange={e => { setTarget('SPEC'); setKw(e.target.value); }}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg ${target === 'KW' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-white'}`}
                    placeholder=""
                />
            </div>
            <div className="pb-3 text-slate-400">⇄</div>
            <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">變相器規格</label>
                <input 
                    type="number" 
                    value={target === 'SPEC' ? result.val : spec}
                    onChange={e => { setTarget('KW'); setSpec(e.target.value); }}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg ${target === 'SPEC' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-white'}`}
                    placeholder=""
                />
            </div>
        </div>
        
        {result.val && (
            <ResultDisplay label={target === 'SPEC' ? '建議規格' : '反推 kW'} result={result.val} steps={result.steps} />
        )}
      </div>
    </Card>
  );
};