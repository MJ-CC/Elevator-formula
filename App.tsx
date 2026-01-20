import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator, Filter, ChevronsDown, ChevronsUp } from 'lucide-react';
import { CalculatorCategory } from './types';
import { SpeedProfileCalc } from './components/calculators/SpeedProfileCalc';
import { PoleAngleCalc } from './components/calculators/PoleAngleCalc';
import { CurrentLimitCalc } from './components/calculators/CurrentLimitCalc';
import { MachineSpeedCalc } from './components/calculators/MachineSpeedCalc';
import { FreqDivCalc } from './components/calculators/FreqDivCalc';
import { MotorRpmCalc } from './components/calculators/MotorRpmCalc';
import { PhaseConvCalc } from './components/calculators/PhaseConvCalc';

const CATEGORIES: { id: CalculatorCategory; label: string }[] = [
  { id: 'ALL', label: '全部' },
  { id: 'MOTOR', label: '馬達' },
  { id: 'INVERTER', label: '變頻驅動' },
  { id: 'SPEED', label: '速度' },
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory>('ALL');
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // State for expand/collapse. Key is calculator ID (e.g., 'speed', 'pole')
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  // Effect to track focus on input fields to hide header on mobile
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Only hide header if the focused element is an input/select inside the <main> tag (calculators)
      // We do NOT want to hide the header if the user is typing in the main Search bar (which is in <header>)
      if ((target.tagName === 'INPUT' || target.tagName === 'SELECT') && target.closest('main')) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      // Small delay to allow focus to shift to another input without the header flashing
      setTimeout(() => {
        const active = document.activeElement as HTMLElement;
        // If the new active element is not an input in main, show the header again
        if (!active || !active.closest('main') || (active.tagName !== 'INPUT' && active.tagName !== 'SELECT')) {
          setIsInputFocused(false);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const toggleCalc = (id: string) => {
    setOpenStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    const ids = ['speed', 'pole', 'current', 'machine', 'freq', 'rpm', 'phase'];
    ids.forEach(id => newState[id] = expand);
    setOpenStates(newState);
  };

  // Helper to check if calc matches filter
  const shouldShow = (tags: CalculatorCategory[], text: string) => {
    const matchesCat = activeCategory === 'ALL' || tags.includes(activeCategory);
    const matchesSearch = text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Sticky Header - Collapses when isInputFocused is true */}
      <header 
        className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 overflow-hidden transition-all duration-300 ease-in-out ${
          isInputFocused ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-96 opacity-100'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/30">
                <Calculator size={24} />
             </div>
             <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
               電梯工程<span className="text-blue-600">計算機</span>
             </h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜尋關鍵字 (例如: RPM, 磁極...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl outline-none transition-all"
            />
          </div>

          {/* Filters & Global Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-[70%]">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
               <button onClick={() => toggleAll(true)} className="p-2 text-slate-500 hover:text-blue-600 bg-white rounded-lg border border-slate-200 transition-colors" title="全部展開">
                  <ChevronsDown size={18} />
               </button>
               <button onClick={() => toggleAll(false)} className="p-2 text-slate-500 hover:text-blue-600 bg-white rounded-lg border border-slate-200 transition-colors" title="全部摺疊">
                  <ChevronsUp size={18} />
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {shouldShow(['SPEED'], '長短階速度 04-XX 頻率') && (
          <SpeedProfileCalc 
            isOpen={openStates['speed'] || !!searchTerm} 
            onToggle={() => toggleCalc('speed')} 
            highlight={!!searchTerm}
          />
        )}

        {shouldShow(['MOTOR'], '磁極角調整 08-09 Degree') && (
          <PoleAngleCalc 
            isOpen={openStates['pole'] || !!searchTerm} 
            onToggle={() => toggleCalc('pole')}
            highlight={!!searchTerm}
          />
        )}

        {shouldShow(['INVERTER'], '電流限制 06-11 馬達 變頻器') && (
          <CurrentLimitCalc 
            isOpen={openStates['current'] || !!searchTerm} 
            onToggle={() => toggleCalc('current')}
            highlight={!!searchTerm}
          />
        )}

        {shouldShow(['MOTOR', 'SPEED'], '主機速度計算 RPM 輪徑 減速比 吊掛比') && (
          <MachineSpeedCalc 
            isOpen={openStates['machine'] || !!searchTerm} 
            onToggle={() => toggleCalc('machine')}
            highlight={!!searchTerm}
          />
        )}

        {shouldShow(['INVERTER', 'SPEED'], '除頻數 E57E Hex Delta VL PPR') && (
          <FreqDivCalc 
            isOpen={openStates['freq'] || !!searchTerm} 
            onToggle={() => toggleCalc('freq')}
            highlight={!!searchTerm}
          />
        )}

        {shouldShow(['MOTOR'], '馬達轉速 RPM 頻率 極數') && (
          <MotorRpmCalc 
            isOpen={openStates['rpm'] || !!searchTerm} 
            onToggle={() => toggleCalc('rpm')}
            highlight={!!searchTerm}
          />
        )}

        {shouldShow(['INVERTER'], '變相器規格 kW') && (
          <PhaseConvCalc 
            isOpen={openStates['phase'] || !!searchTerm} 
            onToggle={() => toggleCalc('phase')}
            highlight={!!searchTerm}
          />
        )}

        {/* Empty State */}
        {searchTerm && document.querySelectorAll('main > div').length === 0 && (
           <div className="text-center py-12 text-slate-400">
             <Filter className="mx-auto mb-2 opacity-50" size={48} />
             <p>找不到符合「{searchTerm}」的計算項目</p>
           </div>
        )}

      </main>
    </div>
  );
}

export default App;