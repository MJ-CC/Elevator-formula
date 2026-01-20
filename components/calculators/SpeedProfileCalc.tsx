import React, { useState } from 'react';
import { Card } from '../Card';
import { CalculatorProps } from '../../types';
import { Gauge } from 'lucide-react';

type SpeedRating = 30 | 45 | 60;

export const SpeedProfileCalc: React.FC<CalculatorProps> = (props) => {
  const [ratedSpeed, setRatedSpeed] = useState<SpeedRating>(30);
  const [frequency, setFrequency] = useState<string>('');

  const freqNum = parseFloat(frequency) || 0;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const calculateParams = () => {
    const format = (val: number) => Number.isInteger(val) ? val.toString() : val.toFixed(2);
    
    // Coefficients
    const coef = {
      p02: ratedSpeed === 30 ? 15 : ratedSpeed === 45 ? 22.5 : 30,
      p03: ratedSpeed === 30 ? 6 : ratedSpeed === 45 ? 9 : 12,
      p0405: ratedSpeed === 30 ? 2 : ratedSpeed === 45 ? 3 : 4,
      p06: ratedSpeed === 60 ? 1.15 : 1,
      p07: 1
    };

    return [
      { code: '04-01', name: '啟動緩速', div: '-', val: 0 },
      { code: '04-02', name: '尾速', div: coef.p02, val: format(freqNum / coef.p02) },
      { code: '04-03', name: 'UPS運轉', div: coef.p03, val: format(freqNum / coef.p03) },
      { code: '04-04', name: '低速設定', div: coef.p0405, val: format(freqNum / coef.p0405) },
      { code: '04-05', name: '讀樓速度', div: coef.p0405, val: format(freqNum / coef.p0405) },
      { code: '04-06', name: '中速設定', div: coef.p06, val: format(freqNum / coef.p06) },
      { code: '04-07', name: '全速設定', div: coef.p07, val: format(freqNum / coef.p07) },
    ];
  };

  const rows = calculateParams();

  return (
    <Card 
      title="長短階速度 (04-XX)" 
      icon={<Gauge />} 
      categoryTag="速度"
      {...props}
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">額定速度 (m/min)</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {[30, 45, 60].map((s) => (
                <button
                  key={s}
                  onClick={() => setRatedSpeed(s as SpeedRating)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    ratedSpeed === s 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">運轉頻率 (Hz)</label>
            <input
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              onFocus={handleFocus}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder=""
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">代碼</th>
                <th className="px-4 py-3">功能</th>
                <th className="px-4 py-3 text-right">係數</th>
                <th className="px-4 py-3 text-right">設定值 (Hz)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-mono text-slate-600">{row.code}</td>
                  <td className="px-4 py-2 text-slate-800">{row.name}</td>
                  <td className="px-4 py-2 text-right text-slate-400">{row.div}</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-600">{row.val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};