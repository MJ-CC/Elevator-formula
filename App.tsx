import React, { useState, useRef, useMemo } from 'react';
import { Settings, Wrench, Search, LayoutGrid, Compass, Zap, Gauge, Cable, Hash, ArrowLeftRight, Activity, ChevronsDown, ChevronsUp } from 'lucide-react';
import { MagneticPoleCalculator } from './components/MagneticPoleCalculator';
import { CurrentLimitCalculator } from './components/CurrentLimitCalculator';
import { RpmCalculator } from './components/RpmCalculator';
import { DividerCalculator } from './components/DividerCalculator';
import { TractionMachineCalculator } from './components/TractionMachineCalculator';
import { PhaseConverterCalculator } from './components/PhaseConverterCalculator';
import { SpeedCurveCalculator } from './components/SpeedCurveCalculator';
import { ExpandContext } from './components/ExpandContext';

// 定義工具介面
interface Tool {
  id: string;
  title: string;
  category: string; 
  icon: React.ReactNode;
  component: React.ReactNode;
  keywords: string[];
}

// 定義分類介面
interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
}

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Expand/Collapse state
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [expandContextValue, setExpandContextValue] = useState({ trigger: 0, shouldExpand: true });

  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Quick Hex-Dec conversion logic for the search bar
  const quickConversion = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return null;

    // Check if it's hex (e.g., 0xAF or AFH)
    // Supports 0x prefix, H suffix, or raw hex if containing A-F
    const isHex = /^0x[0-9A-Fa-f]+$/.test(trimmed) || /^[0-9A-Fa-f]+[Hh]$/.test(trimmed) || (trimmed.length > 0 && /^[0-9A-Fa-f]+$/.test(trimmed) && isNaN(Number(trimmed)));
    const isDec = /^\d+$/.test(trimmed);

    if (isHex) {
      const hexValue = trimmed.replace(/^0x/i, '').replace(/[Hh]$/i, '');
      const dec = parseInt(hexValue, 16);
      if (!isNaN(dec)) return { from: trimmed, to: dec.toString(), type: '16進位 → 10進位' };
    } else if (isDec) {
      const dec = parseInt(trimmed, 10);
      return { from: trimmed, to: dec.toString(16).toUpperCase() + 'H', type: '10進位 → 16進位' };
    }
    return null;
  }, [searchTerm]);

  const categories: Category[] = [
    { id: 'all', label: '全部', icon: LayoutGrid },
    { id: 'motor', label: '馬達', icon: Settings },
    { id: 'drive', label: '變頻驅動', icon: Zap },
    { id: 'rope', label: '鋼索電纜', icon: Cable },
    { id: 'speed', label: '速度相關', icon: Gauge },
  ];

  const tools: Tool[] = [
    {
      id: 'pole',
      title: '磁極角調整 (08-09)',
      category: 'motor',
      icon: <Compass className="w-5 h-5" />,
      component: <MagneticPoleCalculator />,
      keywords: ['磁極', '角度', 'angle', 'pole', '08-09', 'motor', 'hex']
    },
    {
      id: 'speed_curve',
      title: '速度曲線參數 (04-XX)',
      category: 'speed',
      icon: <Activity className="w-5 h-5" />,
      component: <SpeedCurveCalculator />,
      keywords: ['curve', 'speed', '04-01', '04-02', '爬速', '中速', '頻率', 'hz']
    },
    {
      id: 'current',
      title: '電流限制 (06-11)',
      category: 'drive',
      icon: <Zap className="w-5 h-5" />,
      component: <CurrentLimitCalculator />,
      keywords: ['電流', 'limit', 'current', '06-11', 'amp', 'inverter', 'drive']
    },
    {
      id: 'phase',
      title: '變相器規格計算',
      category: 'drive',
      icon: <Zap className="w-5 h-5" />,
      component: <PhaseConverterCalculator />,
      keywords: ['phase', 'converter', 'kw', 'power', '變相器', '瓦數']
    },
    {
      id: 'traction',
      title: '主機速度參數計算',
      category: 'speed',
      icon: <Settings className="w-5 h-5" />,
      component: <TractionMachineCalculator />,
      keywords: ['speed', 'rpm', 'diameter', 'gear', 'ratio', 'roping', '主機', '減速比', '輪徑']
    },
    {
      id: 'divider',
      title: '除頻數計算',
      category: 'drive',
      icon: <Hash className="w-5 h-5" />,
      component: <DividerCalculator />,
      keywords: ['divider', '除頻數', 'hex', '16進位', 'E57E', 'E57F', 'delta', '台達']
    },
    {
      id: 'rpm',
      title: '馬達轉速計算 (RPM)',
      category: 'speed',
      icon: <Gauge className="w-5 h-5" />,
      component: <RpmCalculator />,
      keywords: ['rpm', 'speed', 'frequency', 'pole', 'hz', '極數', '轉速', '頻率']
    }
  ];

  const filteredTools = tools.filter(tool => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = tool.title.toLowerCase().includes(searchLower) ||
                          tool.keywords.some(k => k.toLowerCase().includes(searchLower));
    
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryId: string, index: number) => {
    setActiveCategory(categoryId);
    if (tabsContainerRef.current) {
      const tabElement = tabsContainerRef.current.children[index] as HTMLElement;
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAll = () => {
    const newState = !isAllExpanded;
    setIsAllExpanded(newState);
    setExpandContextValue({
      trigger: Date.now(),
      shouldExpand: newState
    });
  };

  return (
    <ExpandContext.Provider value={expandContextValue}>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Wrench className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">電梯工程計算機</h1>
            </div>
            <div className="text-sm text-slate-500 hidden sm:block">
              現場參數驗算工具
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">常用公式計算</h2>
              <p className="text-slate-500 max-w-2xl">選擇分類或輸入關鍵字，或直接輸入 <span className="text-blue-600 font-semibold">16 進位數值</span> 進行快速進位轉換。</p>
            </div>
            
            <button
              onClick={handleToggleAll}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm font-medium text-sm whitespace-nowrap"
            >
              {isAllExpanded ? (
                <>
                  <ChevronsUp className="w-4 h-4" />
                  全部摺疊
                </>
              ) : (
                <>
                  <ChevronsDown className="w-4 h-4" />
                  全部展開
                </>
              )}
            </button>
          </div>

          <div className="sticky top-16 z-10 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:static mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="relative w-full lg:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3.5 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
                  placeholder="搜尋工具名稱或輸入 16 進位 (如 64H)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {quickConversion && (
                  <div className="absolute top-full left-0 mt-3 w-full bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2 z-30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>{quickConversion.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400 font-mono">{quickConversion.from}</span>
                      <span className="text-blue-500 font-bold">→</span>
                      <span className="text-2xl font-black text-yellow-400 font-mono tracking-tight">{quickConversion.to}</span>
                    </div>
                  </div>
                )}
              </div>

              <div 
                ref={tabsContainerRef}
                className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full"
              >
                 {categories.map((cat, index) => {
                   const Icon = cat.icon;
                   const isActive = activeCategory === cat.id;
                   return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id, index)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                      {cat.label}
                    </button>
                   );
                 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <div key={tool.id} className="animate-fade-in">
                  {tool.component}
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-6">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">找不到相符的內容</h3>
                <p className="mt-2 text-slate-500 max-w-sm mx-auto">
                  請試著更換關鍵字，或是檢查 16 進位的格式（如：64H 或 0x64）。
                </p>
              </div>
            )}
          </div>

          <footer className="mt-16 border-t border-slate-200 pt-10">
            <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Elevator Tech Tools &bull; Field Verification Suite
            </p>
          </footer>
        </main>
      </div>
    </ExpandContext.Provider>
  );
};

export default App;