import React from 'react';
import { Calendar, Plus, BarChart2, Coffee } from 'lucide-react';
import { Screen } from '../types';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onAdd: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate, onAdd }) => {
  const getIconClass = (screenName: string) => {
      const isActive = currentScreen === screenName;
      return `flex flex-col items-center gap-0.5 w-12 transition-all duration-300 ${
        isActive ? 'text-milk-tea-800 scale-110' : 'text-milk-tea-300 hover:text-milk-tea-500'
      }`;
  };

  const getStrokeWidth = (screenName: string) => currentScreen === screenName ? 2.5 : 2;

  return (
    <div className="fixed bottom-8 left-0 right-0 z-40 pointer-events-none flex justify-center">
      <div className="w-full max-w-[280px] relative">
        {/* Floating Add Button */}
        <button
            onClick={onAdd}
            className="absolute bottom-20 -right-2 w-12 h-12 bg-milk-tea-800 text-cream rounded-full shadow-lg shadow-milk-tea-800/20 flex items-center justify-center transform transition-all duration-200 active:scale-95 hover:scale-105 pointer-events-auto z-50"
        >
            <Plus size={24} strokeWidth={2.5} />
        </button>

        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/50 p-2 pl-8 pr-8 flex justify-between items-center h-16 pointer-events-auto">
            
            {/* Diary */}
            <button
            onClick={() => onNavigate('calendar')}
            className={getIconClass('calendar')}
            >
            <Calendar size={20} strokeWidth={getStrokeWidth('calendar')} />
            <span className="text-[9px] font-bold tracking-wide">日历</span>
            </button>

            {/* Tasting */}
            <button
                onClick={() => onNavigate('library')}
                className={getIconClass('library')}
            >
                <Coffee size={20} strokeWidth={getStrokeWidth('library')} />
                <span className="text-[9px] font-bold tracking-wide">图鉴</span>
            </button>

            {/* Stats */}
            <button
                onClick={() => onNavigate('stats')}
                className={getIconClass('stats')}
            >
                <BarChart2 size={20} strokeWidth={getStrokeWidth('stats')} />
                <span className="text-[9px] font-bold tracking-wide">统计</span>
            </button>

        </div>
      </div>
    </div>
  );
};