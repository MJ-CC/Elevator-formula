import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { CalculatorProps } from '../../types';
import { Zap, RotateCcw } from 'lucide-react';

type Field = 'v' | 'a' | 'r' | 'w';

interface InputState {
  value: string;
  isUser: boolean; // true if entered by user
}

const InputField = ({ label, value, onChange, status, unit, onClear }: any) => {
  // status: 'default' | 'user' | 'calculated' | 'locked'
  const isCalculated = status === 'calculated';
  const isUser = status === 'user';
  
  // Auto-scroll logic could be added here similar to other calculators if needed, 
  // but with 4 fields tightly packed it might be annoying if it jumps around. 
  // We'll keep it simple.

  return (
    <div>
      <div className="flex justify-between items-center mb-1 h-4">
        <label className={`text-xs font-medium ${status === 'locked' ? 'text-slate-300' : 'text-slate-500'}`}>
          {label}
        </label>
        {isUser && (
          <button 
            onClick={onClear} 
            className="text-[10px] text-slate-400 hover:text-red-500 hover:bg-red-50 px-1 rounded transition-colors"
            tabIndex={-1}
          >
            清除
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => status !== 'calculated' && status !== 'locked' && onChange(e.target.value)}
          readOnly={isCalculated || status === 'locked'}
          className={`w-full px-3 py-2 border rounded-lg outline-none font-mono transition-all duration-300 ${
            isCalculated
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-sm'
              : isUser
                ? 'bg-white border-blue-500 ring-1 ring-blue-200 text-slate-900'
                : status === 'locked'
                  ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-900'
          }`}
          placeholder={isCalculated ? "自動計算" : status === 'locked' ? "-" : ""}
        />
        <span className={`absolute right-3 top-2 text-xs ${status === 'locked' ? 'text-slate-300' : 'text-slate-400'}`}>
          {unit}
        </span>
      </div>
    </div>
  );
};

export const OhmsLawCalc: React.FC<CalculatorProps> = (props) => {
  const [inputs, setInputs] = useState<Record<Field, string>>({
    v: '',
    a: '',
    r: '',
    w: ''
  });

  const [results, setResults] = useState<{
    vals: Record<Field, string>;
    steps: string[];
  }>({
    vals: { v: '', a: '', r: '', w: '' },
    steps: []
  });

  // Determine active inputs
  const filledKeys = (Object.keys(inputs) as Field[]).filter(k => inputs[k] !== '');
  const isComplete = filledKeys.length >= 2;

  const handleInput = (field: Field, val: string) => {
    // Prevent entering more than 2 values (unless editing existing one)
    if (!inputs[field] && filledKeys.length >= 2) return;
    
    setInputs(prev => ({ ...prev, [field]: val }));
  };

  const clearField = (field: Field) => {
    setInputs(prev => ({ ...prev, [field]: '' }));
  };

  const resetAll = () => {
    setInputs({ v: '', a: '', r: '', w: '' });
  };

  useEffect(() => {
    // Only calculate if exactly 2 inputs are present
    const keys = (Object.keys(inputs) as Field[]).filter(k => inputs[k] !== '');
    
    if (keys.length < 2) {
      setResults({ vals: { v: '', a: '', r: '', w: '' }, steps: [] });
      return;
    }

    // Parsing
    const v = parseFloat(inputs.v);
    const a = parseFloat(inputs.a);
    const r = parseFloat(inputs.r);
    const w = parseFloat(inputs.w);

    let calculated = { ...inputs };
    let steps: string[] = [];

    const format = (n: number) => {
      // Avoid tiny floating point errors like 0.00000004
      if (Math.abs(n) < 0.000001) return "0";
      // If integer, return integer string, else 2 decimals
      return Number.isInteger(n) ? n.toString() : n.toFixed(2);
    };

    try {
      // 1. V & A -> R, W
      if (inputs.v && inputs.a) {
        const R = v / a;
        const W = v * a;
        calculated.r = format(R);
        calculated.w = format(W);
        steps = [
          `電阻 R = V ÷ A = ${inputs.v} ÷ ${inputs.a} = ${calculated.r} Ω`,
          `瓦數 W = V × A = ${inputs.v} × ${inputs.a} = ${calculated.w} W`
        ];
      }
      // 2. V & R -> A, W
      else if (inputs.v && inputs.r) {
        const A = v / r;
        const W = (v * v) / r;
        calculated.a = format(A);
        calculated.w = format(W);
        steps = [
          `電流 A = V ÷ R = ${inputs.v} ÷ ${inputs.r} = ${calculated.a} A`,
          `瓦數 W = V² ÷ R = ${inputs.v}² ÷ ${inputs.r} = ${calculated.w} W`
        ];
      }
      // 3. V & W -> A, R
      else if (inputs.v && inputs.w) {
        const A = w / v;
        const R = (v * v) / w;
        calculated.a = format(A);
        calculated.r = format(R);
        steps = [
          `電流 A = W ÷ V = ${inputs.w} ÷ ${inputs.v} = ${calculated.a} A`,
          `電阻 R = V² ÷ W = ${inputs.v}² ÷ ${inputs.w} = ${calculated.r} Ω`
        ];
      }
      // 4. A & R -> V, W
      else if (inputs.a && inputs.r) {
        const V = a * r;
        const W = a * a * r;
        calculated.v = format(V);
        calculated.w = format(W);
        steps = [
          `電壓 V = A × R = ${inputs.a} × ${inputs.r} = ${calculated.v} V`,
          `瓦數 W = A² × R = ${inputs.a}² × ${inputs.r} = ${calculated.w} W`
        ];
      }
      // 5. A & W -> V, R
      else if (inputs.a && inputs.w) {
        const V = w / a;
        const R = w / (a * a);
        calculated.v = format(V);
        calculated.r = format(R);
        steps = [
          `電壓 V = W ÷ A = ${inputs.w} ÷ ${inputs.a} = ${calculated.v} V`,
          `電阻 R = W ÷ A² = ${inputs.w} ÷ ${inputs.a}² = ${calculated.r} Ω`
        ];
      }
      // 6. R & W -> V, A
      else if (inputs.r && inputs.w) {
        const V = Math.sqrt(w * r);
        const A = Math.sqrt(w / r);
        calculated.v = format(V);
        calculated.a = format(A);
        steps = [
          `電壓 V = √(W × R) = √(${inputs.w} × ${inputs.r}) = ${calculated.v} V`,
          `電流 A = √(W ÷ R) = √(${inputs.w} ÷ ${inputs.r}) = ${calculated.a} A`
        ];
      }
    } catch (e) {
      console.error(e);
      steps = ['計算錯誤'];
    }

    setResults({ vals: calculated, steps });

  }, [inputs]);

  const getStatus = (field: Field) => {
    if (inputs[field]) return 'user';
    if (isComplete) return 'calculated';
    return 'default';
  };

  const getDisplayValue = (field: Field) => {
    if (inputs[field]) return inputs[field];
    if (isComplete) return results.vals[field];
    return '';
  };

  return (
    <Card 
      title="歐姆定律計算 (Ohm's Law)" 
      icon={<Zap />} 
      categoryTag="馬達" 
      {...props}
    >
      <div className="space-y-4">
        {/* Helper Header */}
        <div className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
           <div className="text-xs text-slate-600">
             <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold mr-1">TIPS</span>
             輸入任意 <span className="font-bold text-slate-800">2</span> 個數值即可
           </div>
           {filledKeys.length > 0 && (
             <button 
               onClick={resetAll}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all active:translate-y-0.5"
             >
               <RotateCcw size={14} />
               全部清除
             </button>
           )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="電壓 (Voltage)" 
            value={getDisplayValue('v')} 
            onChange={(v: string) => handleInput('v', v)} 
            onClear={() => clearField('v')}
            status={getStatus('v')}
            unit="V"
          />
          <InputField 
            label="電流 (Current)" 
            value={getDisplayValue('a')} 
            onChange={(v: string) => handleInput('a', v)}
            onClear={() => clearField('a')}
            status={getStatus('a')}
            unit="A"
          />
          <InputField 
            label="電阻 (Resistance)" 
            value={getDisplayValue('r')} 
            onChange={(v: string) => handleInput('r', v)} 
            onClear={() => clearField('r')}
            status={getStatus('r')}
            unit="Ω"
          />
          <InputField 
            label="瓦數 (Power)" 
            value={getDisplayValue('w')} 
            onChange={(v: string) => handleInput('w', v)}
            onClear={() => clearField('w')}
            status={getStatus('w')}
            unit="W"
          />
        </div>

        {results.steps.length > 0 && (
          <div className="mt-2 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-300">
            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">驗算過程</h4>
            <div className="space-y-2">
              {results.steps.map((step, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-mono text-slate-700 shadow-sm">
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};