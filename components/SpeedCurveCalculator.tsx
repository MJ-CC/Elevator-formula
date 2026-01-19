import React, { useState, useEffect } from 'react';
import { Activity, Gauge } from 'lucide-react';
import { Card } from './Card';
import { CalculationResult } from '../types';

type SpeedType = '30' | '45' | '60';

interface ParamRow {
  code: string;
  name: string;
  divisors: Record<SpeedType, number>;
}

const PARAM_DATA: ParamRow[] = [
  { code: '04-01', name: '啟動緩速、再平層速度', divisors: { '30': 0, '45': 0, '60': 0 } },
  { code: '04-02', name: '尾速', divisors: { '30': 15, '45': 22.5, '60': 30 } },
  { code: '04-03', name: 'UPS速', divisors: { '30': 6, '45': 9, '60': 12 } },
  { code: '04-04', name: '低速、手動速', divisors: { '30': 2, '45': 3, '60': 4 } },
  { code: '04-05', name: '讀樓速', divisors: { '30': 2, '45': 3, '60': 4 } },
  { code: '04-06', name: '中速', divisors: { '30': 1, '45': 1, '60': 1.15 } },
  { code: '04-07', name: '全速', divisors: { '30': 1, '45': 1, '60': 1 } },
];

export const SpeedCurveCalculator: React.FC = () => {
  const [speed, setSpeed] = useState<SpeedType>('30');
  const [frequency, setFrequency] = useState<string>('');

  const calculateValue = (divisor: number, freq: number): string => {
    if (divisor === 0) return '0'; // Special case for 04-01
    const val = freq / divisor;
    // Format: remove unnecessary decimals if integer, otherwise max 2 decimals
    return Number.isInteger(val) ? val.toString() : val.toFixed(2); // Match user example 0.8
  };

  const freqNum = parseFloat(frequency);
  const isValid = !isNaN(freqNum);

  return (
    <Card 
      title="長、短階速度 (04-XX)" 
      icon={<Activity className="w-6 h-6" />}
      description="根據額定速度與頻率，計算 04 群組參數設定值"
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">額定速度 (米數)</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['30', '45', '60'] as SpeedType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    speed === s 
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s}M
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">運轉頻率 (Hz)</label>
            <div className="relative">
              <input
                type="number"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder=""
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-slate-50"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs font-bold">Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {isValid && (
          <div className="border border-slate-200 rounded-lg overflow-hidden animate-fade-in">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-16">代碼</th>
                  <th className="px-4 py-3">功能說明</th>
                  <th className="px-4 py-3 text-right">設定值 (Hz)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PARAM_DATA.map((row) => (
                  <tr key={row.code} className="bg-white hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-slate-500 font-medium">{row.code}</td>
                    <td className="px-4 py-3 text-slate-700">{row.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600 font-mono">
                      {calculateValue(row.divisors[speed], freqNum)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-blue-50/50 border-t border-blue-100 text-[10px] text-blue-600/70 text-right">
              計算公式: 頻率 ÷ 係數
            </div>
          </div>
        )}

        {!isValid && (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <Gauge className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">請輸入頻率以顯示參數表</p>
          </div>
        )}
      </div>
    </Card>
  );
};