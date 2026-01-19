import React, { useState, useEffect } from 'react';
import { Hash, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { ResultDisplay } from './ResultDisplay';
import { CalculationResult } from '../types';

export const DividerCalculator: React.FC = () => {
  const [divider, setDivider] = useState<string>(''); // Hex string
  const [meters, setMeters] = useState<string>('');
  const [rpm, setRpm] = useState<string>('');
  const [encoder, setEncoder] = useState<string>('');
  const [isDeltaVL, setIsDeltaVL] = useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [targetLabel, setTargetLabel] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('');

  useEffect(() => {
    // Parse divider as Hexadecimal
    const d = parseInt(divider, 16);
    const m_raw = parseFloat(meters);
    const r = parseFloat(rpm);
    const e = parseFloat(encoder);

    const m = !isNaN(m_raw) ? Math.max(60, m_raw) : NaN;

    const hasDiv = !isNaN(d);
    const hasMeters = !isNaN(m_raw);
    const hasRpm = !isNaN(r);
    const hasEnc = !isNaN(e);

    // Only calculate if exactly 3 fields are filled
    const filledCount = [hasDiv, hasMeters, hasRpm, hasEnc].filter(Boolean).length;
    if (filledCount !== 3) {
      setResult(null);
      setTargetLabel('');
      return;
    }

    let calculatedValue: number | string = 0;
    let formulaStr = '';
    let stepsStr = '';
    let label = '';
    let unit = '';
    let extraInfo: React.ReactNode = null;

    // A = 4096, Constant2 = 1000 / 0.75 = 1333.33
    // Divider = (4096 * Meters * 1000) / (RPM * Encoder * 0.75)
    // If Delta VL, Divider = Divider / 10

    if (!hasDiv && hasMeters && hasRpm && hasEnc) {
      // Case 1: Calculate Divider
      const rawDiv = (4096 * m * 1000) / (r * e * 0.75);
      const valDecimal = isDeltaVL ? rawDiv / 10 : rawDiv;
      
      // Output as Hex
      const hexValue = Math.round(valDecimal).toString(16).toUpperCase();
      const paddedHex = hexValue.padStart(4, '0');
      
      calculatedValue = paddedHex;
      label = '計算除頻數 (16進位)';
      unit = '';
      
      formulaStr = isDeltaVL 
        ? '(4096 × 米數 × 1000 / (RPM × 編碼器 × 0.75)) / 10' 
        : '4096 × 米數 × 1000 / (RPM × 編碼器 × 0.75)';
      
      // Verification steps
      // ResultDisplay appends " -> result" automatically. 
      // We stop at the decimal value here to avoid duplicate hex display.
      stepsStr = `(${m_raw < 60 ? '60*' : m_raw} × 4096000) / (${r} × ${e} × 0.75)${isDeltaVL ? ' / 10' : ''} → ${valDecimal.toFixed(2)}`;
      
      // Hex conversion info (using the padded hex value)
      const rightTwo = paddedHex.slice(-2);
      const leftTwo = paddedHex.slice(0, 2);
      
      extraInfo = (
        <div className="mt-4 p-3 bg-slate-800 text-slate-100 rounded-lg font-mono text-xs">
          <p className="text-blue-400 font-bold mb-2">16進位參數對應：</p>
          <div className="grid grid-cols-2 gap-2">
            <div>16進位值: <span className="text-white">{paddedHex}H</span></div>
            <div>&nbsp;</div>
            <div className="border-t border-slate-700 pt-1">E57E (右二位): <span className="text-yellow-400 text-sm">{rightTwo}</span></div>
            <div className="border-t border-slate-700 pt-1">E57F (左二位): <span className="text-yellow-400 text-sm">{leftTwo}</span></div>
          </div>
        </div>
      );
    } else if (hasDiv && !hasMeters && hasRpm && hasEnc) {
      // Case 2: Calculate Meters
      const adjDiv = isDeltaVL ? d * 10 : d;
      calculatedValue = (adjDiv * r * e * 0.75) / (4096 * 1000);
      label = '計算米數';
      unit = 'M';
      formulaStr = '除頻數(10進位) × RPM × 編碼器 × 0.75 / (4096 × 1000)';
      // Using d (decimal value of hex input) in calculation display
      stepsStr = `(${d} × ${r} × ${e} × 0.75) / 4096000`;
    } else if (hasDiv && hasMeters && !hasRpm && hasEnc) {
      // Case 3: Calculate RPM
      const adjDiv = isDeltaVL ? d * 10 : d;
      calculatedValue = (4096 * m * 1000) / (adjDiv * e * 0.75);
      label = '計算 RPM';
      unit = 'RPM';
      formulaStr = '4096 × 米數 × 1000 / (除頻數(10進位) × 編碼器 × 0.75)';
      stepsStr = `(4096000 × ${m}) / (${adjDiv} × ${e} × 0.75)`;
    } else if (hasDiv && hasMeters && hasRpm && !hasEnc) {
      // Case 4: Calculate Encoder
      const adjDiv = isDeltaVL ? d * 10 : d;
      calculatedValue = (4096 * m * 1000) / (adjDiv * r * 0.75);
      label = '計算編碼器';
      unit = 'PPR';
      formulaStr = '4096 × 米數 × 1000 / (除頻數(10進位) × RPM × 0.75)';
      stepsStr = `(4096000 × ${m}) / (${adjDiv} × ${r} × 0.75)`;
    }

    setResult({
      value: calculatedValue,
      formula: formulaStr,
      steps: stepsStr,
      extra: extraInfo
    });
    setTargetLabel(label);
    setTargetUnit(unit);

  }, [divider, meters, rpm, encoder, isDeltaVL]);

  const handleReset = () => {
    setDivider('');
    setMeters('');
    setRpm('');
    setEncoder('');
    setResult(null);
  };

  return (
    <Card 
      title="除頻數計算" 
      icon={<Hash className="w-6 h-6" />}
      description="輸入任3項數值即可計算"
    >
      <div className="space-y-4">
        {/* Delta VL Checkbox */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <input
            type="checkbox"
            id="deltaVL"
            checked={isDeltaVL}
            onChange={(e) => setIsDeltaVL(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="deltaVL" className="text-sm font-semibold text-blue-900 cursor-pointer flex items-center gap-1">
            使用台達 VL 變頻器
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">除頻數 (16進位)</label>
            <input
              type="text"
              value={divider}
              onChange={(e) => setDivider(e.target.value.toUpperCase())}
              placeholder={(!meters || !rpm || !encoder) ? ""}
              className={`block w-full rounded-md shadow-sm text-sm p-3 border font-mono ${
                (!divider && meters && rpm && encoder) 
                  ? 'bg-blue-50 border-blue-200 placeholder-blue-300' 
                  : 'bg-white border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">米數 (m/min)</label>
            <input
              type="number"
              value={meters}
              onChange={(e) => setMeters(e.target.value)}
              placeholder=""
              className={`block w-full rounded-md shadow-sm text-sm p-3 border ${
                (!meters && divider && rpm && encoder) 
                  ? 'bg-blue-50 border-blue-200 placeholder-blue-300' 
                  : 'bg-white border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {parseFloat(meters) < 60 && parseFloat(meters) > 0 && (
              <p className="text-[10px] text-orange-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 小於 60M 將以 60M 計算
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">轉速 (RPM)</label>
            <input
              type="number"
              value={rpm}
              onChange={(e) => setRpm(e.target.value)}
              placeholder=""
              className={`block w-full rounded-md shadow-sm text-sm p-3 border ${
                (!rpm && divider && meters && encoder) 
                  ? 'bg-blue-50 border-blue-200 placeholder-blue-300' 
                  : 'bg-white border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">編碼器 (PPR)</label>
            <input
              type="number"
              value={encoder}
              onChange={(e) => setEncoder(e.target.value)}
              placeholder="例如: 1024"
              className={`block w-full rounded-md shadow-sm text-sm p-3 border ${
                (!encoder && divider && meters && rpm) 
                  ? 'bg-blue-50 border-blue-200 placeholder-blue-300' 
                  : 'bg-white border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        {result && (
          <div className="animate-fade-in">
            <ResultDisplay result={result} label={targetLabel} unit={targetUnit} />
            {result.extra}
          </div>
        )}
        
        {(divider || meters || rpm || encoder) && (
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