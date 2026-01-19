import React, { useState, useEffect } from 'react';
import { Gauge, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { ResultDisplay } from './ResultDisplay';
import { CalculationResult } from '../types';

export const RpmCalculator: React.FC = () => {
  const [rpm, setRpm] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [poles, setPoles] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [targetLabel, setTargetLabel] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('');

  useEffect(() => {
    const r = parseFloat(rpm);
    const f = parseFloat(frequency);
    const p = parseFloat(poles);

    const hasRpm = !isNaN(r);
    const hasFreq = !isNaN(f);
    const hasPoles = !isNaN(p);

    // 計算邏輯：只有當正好有兩個欄位有值時才進行計算
    
    // 情況 1: 已知 頻率(F) 與 極數(P)，計算 RPM
    // 公式: RPM = 120 * F / P
    if (!hasRpm && hasFreq && hasPoles && p !== 0) {
      const val = (120 * f) / p;
      setResult({
        value: val,
        formula: 'RPM = 120 × 頻率 / 極數',
        steps: `120 × ${f} / ${p}`
      });
      setTargetLabel('計算轉速');
      setTargetUnit('RPM');
      return;
    }

    // 情況 2: 已知 RPM 與 極數(P)，計算 頻率(F)
    // 公式: F = RPM * P / 120
    if (hasRpm && !hasFreq && hasPoles) {
      const val = (r * p) / 120;
      setResult({
        value: val,
        formula: '頻率 = RPM × 極數 / 120',
        steps: `${r} × ${p} / 120`
      });
      setTargetLabel('計算頻率');
      setTargetUnit('Hz');
      return;
    }

    // 情況 3: 已知 RPM 與 頻率(F)，計算 極數(P)
    // 公式: P = 120 * F / RPM
    if (hasRpm && hasFreq && !hasPoles && r !== 0) {
      const val = (120 * f) / r;
      setResult({
        value: val,
        formula: '極數 = 120 × 頻率 / RPM',
        steps: `120 × ${f} / ${r}`
      });
      setTargetLabel('計算極數');
      setTargetUnit('P');
      return;
    }

    // 其他情況（輸入不足或輸入三個）不顯示結果
    setResult(null);
    setTargetLabel('');

  }, [rpm, frequency, poles]);

  const handleReset = () => {
    setRpm('');
    setFrequency('');
    setPoles('');
  };

  return (
    <Card 
      title="馬達轉速計算 (RPM)" 
      icon={<Gauge className="w-6 h-6" />}
      description="輸入任2項數值即可計算)"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* RPM Input */}
          <div>
            <label htmlFor="rpmInput" className="block text-sm font-medium text-slate-700 mb-1">
              同步轉速 (RPM)
            </label>
            <input
              type="number"
              id="rpmInput"
              value={rpm}
              onChange={(e) => setRpm(e.target.value)}
              placeholder={(!frequency || !poles) ? "" : "自動計算"}
              className={`block w-full rounded-md shadow-sm sm:text-sm p-3 border ${
                 (!rpm && frequency && poles) ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Frequency Input */}
            <div>
              <label htmlFor="freqInput" className="block text-sm font-medium text-slate-700 mb-1">
                頻率 (Hz)
              </label>
              <input
                type="number"
                id="freqInput"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder={(!frequency || !poles) ? "" : "自動計算"}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 border ${
                  (!frequency && rpm && poles) ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500'
               }`}
              />
            </div>
            
            {/* Poles Input */}
            <div>
              <label htmlFor="polesInput" className="block text-sm font-medium text-slate-700 mb-1">
                馬達極數 (P)
              </label>
              <input
                type="number"
                id="polesInput"
                value={poles}
                onChange={(e) => setPoles(e.target.value)}
                placeholder={(!frequency || !poles) ? "" : "自動計算"}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 border ${
                  (!poles && rpm && frequency) ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500'
               }`}
              />
            </div>
          </div>
        </div>

        <ResultDisplay result={result} label={targetLabel} unit={targetUnit} />
        
        {(rpm || frequency || poles) && (
          <button 
            onClick={handleReset}
            className="flex items-center justify-center w-full mt-4 text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> 重置所有欄位
          </button>
        )}
      </div>
    </Card>
  );
};