import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { ResultDisplay } from './ResultDisplay';
import { CalculationResult } from '../types';

export const TractionMachineCalculator: React.FC = () => {
  const [speed, setSpeed] = useState<string>(''); // m/min
  const [rpm, setRpm] = useState<string>('');
  const [diameter, setDiameter] = useState<string>(''); // mm
  const [gearRatio, setGearRatio] = useState<string>(''); // e.g. "43:2" or "21.5"
  const [roping, setRoping] = useState<string>(''); // e.g. "2:1" or "2"
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [targetLabel, setTargetLabel] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('');

  // Helper to parse "A:B" or number string
  const parseRatioValue = (str: string): number => {
    if (!str) return NaN;
    const cleanStr = str.trim();
    if (cleanStr.includes(':')) {
      const parts = cleanStr.split(':');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        // Gear Ratio usually means Reduction Ratio (e.g. 43:2 means input 43 turns = output 2 turns? 
        // OR 43 teeth worm gear, 2 starts worm shaft?)
        // In the user's example: (1457 * ... * 2/43) / 2
        // This implies the Gear Ratio factor in the numerator is (2/43).
        // Standard formula: V = (RPM / Ratio) * ...
        // If user enters 43:2, they usually mean Ratio = 43/2 = 21.5.
        // Formula: V = (RPM / 21.5) ... which is RPM * (1/21.5) = RPM * (2/43).
        // So we return the division result.
        return num / den;
      }
    }
    return parseFloat(cleanStr);
  };

  useEffect(() => {
    const v = parseFloat(speed);
    const n = parseFloat(rpm);
    const d = parseFloat(diameter);
    const g = parseRatioValue(gearRatio); // Gear Ratio (Reduction)
    const r = parseRatioValue(roping); // Roping Ratio

    // Check validity
    const hasV = !isNaN(v);
    const hasN = !isNaN(n);
    const hasD = !isNaN(d);
    const hasG = !isNaN(g) && g !== 0;
    const hasR = !isNaN(r) && r !== 0;

    const validCount = [hasV, hasN, hasD, hasG, hasR].filter(Boolean).length;

    // Only calculate if exactly 4 fields are filled
    if (validCount !== 4) {
      setResult(null);
      setTargetLabel('');
      return;
    }

    // Formula Base: Speed = (RPM * 3.14 * (D/1000)) / (GearRatio * Roping)
    // Constants
    const PI = 3.14; 

    let val = 0;
    let formulaDisplay = '';
    let stepsDisplay = '';
    let label = '';
    let unit = '';

    if (!hasV) {
      // Calculate Speed
      // V = (N * 3.14 * D * 0.001) / (G * R)
      val = (n * PI * (d / 1000)) / (g * r);
      label = '計算速度';
      unit = 'm/min';
      formulaDisplay = 'RPM × 3.14 × (輪徑/1000) / (減速比 × 吊掛比)';
      stepsDisplay = `(${n} × 3.14 × ${d/1000}) / (${g.toFixed(2)} × ${r})`;
    } else if (!hasN) {
      // Calculate RPM
      // N = (V * G * R) / (3.14 * D * 0.001)
      val = (v * g * r) / (PI * (d / 1000));
      label = '計算馬達轉速';
      unit = 'RPM';
      formulaDisplay = '速度 × 減速比 × 吊掛比 / (3.14 × (輪徑/1000))';
      stepsDisplay = `(${v} × ${g.toFixed(2)} × ${r}) / (3.14 × ${d/1000})`;
    } else if (!hasD) {
      // Calculate Diameter
      // D = (V * G * R * 1000) / (N * 3.14)
      val = (v * g * r * 1000) / (n * PI);
      label = '計算主機輪徑';
      unit = 'mm';
      formulaDisplay = '速度 × 減速比 × 吊掛比 × 1000 / (RPM × 3.14)';
      stepsDisplay = `(${v} × ${g.toFixed(2)} × ${r} × 1000) / (${n} × 3.14)`;
    } else if (!hasG) {
      // Calculate Gear Ratio
      // G = (N * 3.14 * D * 0.001) / (V * R)
      val = (n * PI * (d / 1000)) / (v * r);
      label = '計算減速比';
      unit = ':1';
      formulaDisplay = '(RPM × 3.14 × (輪徑/1000)) / (速度 × 吊掛比)';
      stepsDisplay = `(${n} × 3.14 × ${d/1000}) / (${v} × ${r})`;
    } else if (!hasR) {
      // Calculate Roping
      // R = (N * 3.14 * D * 0.001) / (V * G)
      val = (n * PI * (d / 1000)) / (v * g);
      label = '計算吊掛比';
      unit = ':1';
      formulaDisplay = '(RPM × 3.14 × (輪徑/1000)) / (速度 × 減速比)';
      stepsDisplay = `(${n} × 3.14 × ${d/1000}) / (${v} × ${g.toFixed(2)})`;
    }

    setResult({
      value: val,
      formula: formulaDisplay,
      steps: stepsDisplay
    });
    setTargetLabel(label);
    setTargetUnit(unit);

  }, [speed, rpm, diameter, gearRatio, roping]);

  const handleReset = () => {
    setSpeed('');
    setRpm('');
    setDiameter('');
    setGearRatio('');
    setRoping('');
    setResult(null);
  };

  const getFieldStatus = (val: string) => {
     // If field is empty but we have 4 other fields, it's the target (highlight it)
     const filled = [speed, rpm, diameter, gearRatio, roping].filter(v => v !== '').length;
     if (!val && filled === 4) return 'bg-blue-50 border-blue-200 placeholder-blue-300';
     // If field is empty and we don't have enough data yet
     if (!val) return 'bg-slate-50 border-slate-300';
     // If field has value
     return 'bg-white border-slate-300';
  };

  return (
    <Card 
      title="主機速度參數計算" 
      icon={<Settings className="w-6 h-6" />}
      description="輸入任4項數值即可計算"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Speed */}
          <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">米數 (m/min)</label>
            <div className="relative">
              <input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder={(!frequency || !poles) ? "" : "自動計算"}
                className={`block w-full rounded-md shadow-sm text-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldStatus(speed)}`}
              />
            </div>
          </div>
          
          {/* RPM */}
          <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">馬達轉速</label>
            <div className="relative">
              <input
                type="number"
                value={rpm}
                onChange={(e) => setRpm(e.target.value)}
                placeholder={(!frequency || !poles) ? "" : "自動計算"}
                className={`block w-full rounded-md shadow-sm text-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldStatus(rpm)}`}
              />
            </div>
          </div>

          {/* Diameter */}
          <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">主機輪徑(mm)</label>
            <div className="relative">
              <input
                type="number"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                placeholder={(!frequency || !poles) ? "" : "自動計算"}
                className={`block w-full rounded-md shadow-sm text-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldStatus(diameter)}`}
              />
            </div>
          </div>

          {/* Gear Ratio */}
          <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">減速比</label>
            <div className="relative">
              <input
                type="text"
                value={gearRatio}
                onChange={(e) => setGearRatio(e.target.value)}
                placeholder={(!frequency || !poles) ? "例如 43:2 或 21.5" : "自動計算"}
                className={`block w-full rounded-md shadow-sm text-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldStatus(gearRatio)}`}
              />
            </div>
          </div>

          {/* Roping Ratio */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">吊掛比</label>
            <div className="relative">
              <input
                type="text"
                value={roping}
                onChange={(e) => setRoping(e.target.value)}
                placeholder={(!frequency || !poles) ? "例如 2:1 或 2" : "自動計算"}
                className={`block w-full rounded-md shadow-sm text-sm p-3 border focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldStatus(roping)}`}
              />
            </div>
          </div>
        </div>

        {/* Hints */}
        <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
           提示：支援「43:2」格式輸入。公式採用 PI=3.14。
        </div>

        <ResultDisplay result={result} label={targetLabel} unit={targetUnit} />
        
        {(speed || rpm || diameter || gearRatio || roping) && (
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