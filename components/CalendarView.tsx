import React, { useState, useRef } from 'react';
import { TeaRecord } from '../types';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Search, X, ChevronDown, Plus } from 'lucide-react';

interface CalendarViewProps {
  records: TeaRecord[];
  onDelete?: (id: string) => void;
  onEdit?: (record: TeaRecord) => void;
  onViewRecord?: (record: TeaRecord) => void;
}

const renderStars = (rating: number) => {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
};

// Swipeable Item Component
interface SwipeableRecordItemProps {
    record: TeaRecord;
    onEdit: (record: TeaRecord) => void;
    onDelete: (id: string) => void;
    onView: (record: TeaRecord) => void;
}

const SwipeableRecordItem: React.FC<SwipeableRecordItemProps> = ({ record, onEdit, onDelete, onView }) => {
    const [offsetX, setOffsetX] = useState(0);
    const startXRef = useRef<number | null>(null);
    const initialOffsetXRef = useRef<number>(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        startXRef.current = e.touches[0].clientX;
        initialOffsetXRef.current = offsetX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startXRef.current === null) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startXRef.current;

        // Calculate new offset based on where we started
        const newOffset = initialOffsetXRef.current + diff;

        // Clamp between -140 (fully open) and 0 (closed)
        // Allows for smooth dragging back and forth
        setOffsetX(Math.max(-140, Math.min(0, newOffset)));
    };

    const handleTouchEnd = () => {
        if (startXRef.current === null) return;
        
        // Threshold to snap open or closed (halfway point of 140 is 70)
        if (offsetX < -70) {
            setOffsetX(-140);
        } else {
            setOffsetX(0);
        }
        startXRef.current = null;
    };

    return (
        <div className="relative group rounded-2xl shadow-sm shadow-milk-tea-100 mb-4 select-none bg-milk-tea-100/50 overflow-hidden">
             {/* Action Buttons Background */}
             <div className="absolute inset-y-0 right-0 w-[140px] flex rounded-r-2xl">
                <button
                    onClick={(e) => {
                         e.stopPropagation();
                         onEdit(record);
                         setOffsetX(0); 
                    }}
                    className="flex-1 bg-milk-tea-200 text-milk-tea-800 flex flex-col items-center justify-center gap-1 active:bg-milk-tea-300 transition-colors"
                >
                    <Edit2 size={18} />
                    <span className="text-[10px] font-bold">编辑</span>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(record.id);
                        setOffsetX(0);
                    }}
                    className="flex-1 bg-red-400 text-white flex flex-col items-center justify-center gap-1 active:bg-red-500 transition-colors"
                >
                    <Trash2 size={18} />
                    <span className="text-[10px] font-bold">删除</span>
                </button>
             </div>

             {/* Main Card Content */}
             <div 
                className="relative bg-white p-4 rounded-2xl flex gap-4 border border-transparent transition-transform duration-300 ease-out z-10"
                style={{ transform: `translateX(${offsetX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                    if (offsetX < -10) setOffsetX(0); // Close if open
                    else onView(record);
                }}
             >
                <div className="w-16 h-16 rounded-xl bg-milk-tea-100 flex-shrink-0 overflow-hidden relative pointer-events-none">
                    {record.imageUrl ? (
                        <img src={record.imageUrl} alt={record.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-milk-tea-300 text-2xl font-bold opacity-50">
                            {record.brand[0]}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0 pointer-events-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-milk-tea-900 truncate">{record.name}</h4>
                            <p className="text-xs text-milk-tea-500 font-medium uppercase tracking-wide">{record.brand}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-yellow-400 text-xs tracking-tighter">{renderStars(record.rating)}</span>
                            <span className="text-xs font-bold text-milk-tea-800 mt-1">¥{record.price}</span>
                        </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-milk-tea-50 text-milk-tea-600 text-[10px] rounded-md border border-milk-tea-100">
                            {record.sugar || '标准'}
                        </span>
                        {record.tags && record.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-milk-tea-50 text-milk-tea-600 text-[10px] rounded-md border border-milk-tea-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
             </div>
        </div>
    );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ records, onDelete, onEdit, onViewRecord }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Month navigation
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Dropdown data
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // +/- 5 years
  const months = Array.from({ length: 12 }, (_, i) => i);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  // Filter records
  const filteredRecords = records.filter(record => {
    const d = new Date(record.timestamp);
    const matchesMonth = d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    const matchesDate = selectedDate ? d.getDate() === selectedDate.getDate() : true;
    const matchesSearch = searchQuery 
        ? record.name.toLowerCase().includes(searchQuery.toLowerCase()) || record.brand.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
    
    if (searchQuery) return matchesSearch;
    return matchesMonth && matchesDate;
  }).sort((a,b) => b.timestamp - a.timestamp);

  // Group records for calendar dots (visual only)
  const recordsByDay = records.reduce((acc, record) => {
    const d = new Date(record.timestamp);
    if (d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()) {
      const day = d.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(record);
    }
    return acc;
  }, {} as Record<number, TeaRecord[]>);

  return (
    <div className="p-6 max-w-md mx-auto animate-fade-in">
        {/* Reduce bottom margin from mb-6 to mb-2 */}
        <header className="mb-2 space-y-4">
            <h1 className="text-3xl font-bold text-milk-tea-900">奶茶手记</h1>
            
            {/* Search Bar */}
            <div className="relative z-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-milk-tea-300" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索你的记录..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-milk-tea-100 text-sm text-milk-tea-900 focus:outline-none focus:ring-2 focus:ring-milk-tea-200 placeholder:text-milk-tea-200 transition-all shadow-sm"
                />
                {searchQuery && (
                    <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-milk-tea-300 hover:text-milk-tea-500 p-1"
                    >
                    <X size={14} />
                    </button>
                )}
            </div>
            
            {/* Month Nav - Hidden if searching */}
            {!searchQuery && (
                <div className="relative flex items-center justify-center bg-white/50 p-2 rounded-2xl backdrop-blur-sm z-20 min-h-[56px]">
                    <button onClick={prevMonth} className="absolute left-2 p-2 text-milk-tea-600 hover:bg-white rounded-xl transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    
                    {/* Centered Date Picker Button */}
                    <button 
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-milk-tea-50/50 rounded-full cursor-pointer hover:bg-milk-tea-100 transition-colors"
                    >
                        <span className="text-milk-tea-800 font-bold text-sm uppercase tracking-widest">
                            {currentMonth.toLocaleString('zh-CN', { month: 'long', year: 'numeric' })}
                        </span>
                        <ChevronDown size={16} className={`text-milk-tea-400 transition-transform duration-300 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <button onClick={nextMonth} className="absolute right-2 p-2 text-milk-tea-600 hover:bg-white rounded-xl transition-colors">
                        <ChevronRight size={20} />
                    </button>

                    {/* Custom Date Picker Popup - Absolutely Centered via left-0 right-0 mx-auto */}
                    {isDatePickerOpen && (
                        <>
                            {/* Invisible backdrop to close on outside click */}
                            <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)} />
                            
                            <div 
                                className="absolute top-full mt-2 left-0 right-0 mx-auto w-fit bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-white/50 z-50 flex gap-2 min-w-[240px] animate-fade-in origin-top" 
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative flex-1">
                                    <select 
                                        value={currentMonth.getFullYear()}
                                        onChange={(e) => {
                                            const newYear = parseInt(e.target.value);
                                            setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
                                        }}
                                        className="w-full p-2 bg-milk-tea-50 rounded-xl text-sm font-bold text-milk-tea-900 focus:outline-none appearance-none text-center hover:bg-milk-tea-100 transition-colors cursor-pointer"
                                    >
                                        {years.map(y => <option key={y} value={y}>{y}年</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none">
                                        <ChevronDown size={12} className="text-milk-tea-400" />
                                    </div>
                                </div>
                                
                                <div className="relative flex-1">
                                    <select 
                                        value={currentMonth.getMonth()}
                                        onChange={(e) => {
                                            const newMonth = parseInt(e.target.value);
                                            setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1));
                                        }}
                                        className="w-full p-2 bg-milk-tea-50 rounded-xl text-sm font-bold text-milk-tea-900 focus:outline-none appearance-none text-center hover:bg-milk-tea-100 transition-colors cursor-pointer"
                                    >
                                        {months.map(m => (
                                            <option key={m} value={m}>
                                                {m + 1}月
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none">
                                        <ChevronDown size={12} className="text-milk-tea-400" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </header>

      {/* Calendar Grid - Hidden if searching */}
      {!searchQuery && (
          // Adjusted padding-top (pt-4) and removed extra margins to tighten gap
          <div className="bg-white rounded-3xl p-5 pt-4 shadow-sm shadow-milk-tea-100 mb-8 transition-all relative z-0">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d} className="text-center text-xs text-milk-tea-400 font-bold">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dailyRecords = recordsByDay[day] || [];
                const count = dailyRecords.length;
                const hasTea = count > 0;
                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth();
                
                // Determine background color based on intensity
                let bgClass = '';
                let textClass = '';
                
                if (isSelected) {
                   bgClass = 'bg-milk-tea-800 shadow-md scale-110';
                   textClass = 'text-white';
                } else if (count === 0) {
                   bgClass = 'text-milk-tea-300 hover:bg-cream';
                   textClass = 'text-milk-tea-300';
                } else if (count === 1) {
                   bgClass = 'bg-milk-tea-100 hover:bg-milk-tea-200';
                   textClass = 'text-milk-tea-800';
                } else if (count === 2) {
                   bgClass = 'bg-milk-tea-200 hover:bg-[#EBCFBF]';
                   textClass = 'text-milk-tea-900';
                } else {
                   // 3 or more - Use a darker beige/pink but keep text dark to allow dark dots
                   bgClass = 'bg-[#Dbb0a0] hover:bg-[#cf9f8f]';
                   textClass = 'text-milk-tea-900';
                }

                // Dot Logic: Max 3 dots
                const dotsCount = Math.min(count, 3);
                
                // Only if background is dark brown (selected) do we use white dots.
                // For 3+ cups (bg-[#Dbb0a0]), we keep dark dots for consistency.
                const isDarkBg = isSelected;
                const dotColor = isDarkBg ? 'bg-white/90' : 'bg-milk-tea-800/70';

                return (
                  <button 
                    key={day} 
                    onClick={() => {
                        // Toggle selection
                        if (isSelected) setSelectedDate(null);
                        else {
                            const newDate = new Date(currentMonth);
                            newDate.setDate(day);
                            setSelectedDate(newDate);
                        }
                    }}
                    className="flex flex-col items-center gap-1 group relative"
                  >
                    <span className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${bgClass} ${textClass}`}>
                      {day}
                    </span>
                    {/* Dots always visible if hasTea */}
                    {hasTea && (
                        <div className="flex gap-0.5 absolute -bottom-1.5">
                            {Array.from({ length: dotsCount }).map((_, idx) => {
                                return (
                                    <div key={idx} className={`w-1 h-1 rounded-full ${dotColor}`} />
                                );
                            })}
                        </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
      )}

      {/* Filtered Records List */}
      <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-milk-tea-800">
            {searchQuery ? '搜索结果' : selectedDate ? '今日饮品' : '最近记录'}
          </h3>
          {selectedDate && !searchQuery && (
              <button onClick={() => setSelectedDate(null)} className="text-xs text-milk-tea-500 hover:text-milk-tea-800">清除日期</button>
          )}
      </div>

      <div className="space-y-4 pb-24">
        {filteredRecords.map(record => (
            <SwipeableRecordItem
                key={record.id}
                record={record}
                onEdit={(r) => onEdit?.(r)}
                onDelete={(id) => onDelete?.(id)}
                onView={(r) => onViewRecord?.(r)}
            />
        ))}
        {filteredRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="text-8xl mb-6 animate-bounce">🧋</div>
                <h3 className="text-xl font-medium text-milk-tea-700 mb-2">
                    {searchQuery ? '未找到匹配的记录' : '还没有奶茶记录'}
                </h3>
                <p className="text-sm text-milk-tea-400 text-center max-w-xs">
                    {searchQuery ? '试试换个关键词搜索吧' : '点击下方 + 按钮，开始记录你的第一杯奶茶吧！'}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};