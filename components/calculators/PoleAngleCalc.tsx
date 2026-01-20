import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { ResultDisplay } from '../ResultDisplay';
import { CalculatorProps } from '../../types';
import { Compass } from 'lucide-react';

export const PoleAngleCalc: React.FC<CalculatorProps> = (props) => {
  const [angle, setAngle] = useState<string>('');
  const [result, setResult] = useState<{ val: number | string, steps: string[] }>({ val: '-', steps: [] });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  useEffect(() => {
    const val = parseFloat(angle);
    if (isNaN(val)) {
      setResult({ val: '-', steps: [] });
      return;
    }

    let calculated: number;
    let step = '';

    // Calculate and round to 1 decimal place to avoid float errors (e.g. 142.7 - 90 = 52.699999)
    // Using Math.round(num * 10) / 10 ensures we get 52.7 exactly
    if (val > 90) {
      calculated = Math.round((val - 90) * 10) / 10;
      step = `${val} - 90 = ${calculated}`;
    } else {
      calculated = Math.round((360 - (90 - val)) * 10) / 10;
      step = `360 - (90 - ${val}) = ${calculated}`;
    }

    // Formatting: integer or 1 decimal place
    const formatted = Number.isInteger(calculated) ? calculated : calculated.toFixed(1);

    setResult({
      val: formatted,
      steps: [step]
    });

  }, [angle]);

  return (
    <Card 
      title="磁極角調整 (08-09)" 
      icon={<Compass />} 
      categoryTag="馬達"
      {...props}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">角度值 (08-09)</label>
          <input
            type="number"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="輸入角度 (0-360)"
          />
        </div>
        
        {result.val !== '-' && (
          <ResultDisplay 
            label="需調整的角度" 
            result={result.val} 
            unit="°" 
            steps={result.steps} 
          />
        )}
      </div>
    </Card>
  );
};