import React from 'react';
import { X, Calendar, Clock, Tag, Edit2 } from 'lucide-react';
import { TeaRecord } from '../types';

interface RecordDetailModalProps {
  record: TeaRecord;
  onClose: () => void;
  onEdit?: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose, onEdit }) => {
  const dateObj = new Date(record.timestamp);
  const dateStr = dateObj.toLocaleDateString('zh-CN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pointer-events-auto animate-slide-up overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Image Area */}
        <div className="relative h-56 bg-milk-tea-100 w-full shrink-0">
          {record.imageUrl ? (
            <img src={record.imageUrl} alt={record.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-milk-tea-300 text-4xl font-bold opacity-30">
              {record.brand}
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            {onEdit && (
                <button 
                    onClick={onEdit}
                    className="w-8 h-8 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-colors"
                >
                    <Edit2 size={16} />
                </button>
            )}
            <button 
                onClick={onClose}
                className="w-8 h-8 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-colors"
            >
                <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-milk-tea-500 uppercase tracking-wide mb-1">{record.brand}</p>
              <h2 className="text-2xl font-bold text-milk-tea-900 leading-tight">{record.name}</h2>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-milk-tea-800">¥{record.price}</div>
              {renderStars(record.rating)}
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-4 text-sm text-milk-tea-500 mb-6 bg-cream p-3 rounded-xl">
             <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{dateStr}</span>
             </div>
             <div className="w-px h-3 bg-milk-tea-200"></div>
             <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{timeStr}</span>
             </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 border border-milk-tea-100 rounded-xl bg-white">
                <p className="text-[10px] uppercase text-milk-tea-400 font-bold mb-1">甜度</p>
                <p className="text-milk-tea-800 font-medium">{record.sugar || '标准'}</p>
            </div>
            <div className="p-3 border border-milk-tea-100 rounded-xl bg-white">
                <p className="text-[10px] uppercase text-milk-tea-400 font-bold mb-1">温度/冰量</p>
                <p className="text-milk-tea-800 font-medium">{record.ice || '标准'}</p>
            </div>
          </div>

          {/* Tags */}
          {record.tags && record.tags.length > 0 && (
             <div className="mb-6">
                 <h3 className="text-xs font-bold text-milk-tea-400 uppercase mb-2 flex items-center gap-1">
                    <Tag size={12} /> 小料/备注
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {record.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-milk-tea-100 text-milk-tea-800 rounded-full text-xs font-medium">
                            {tag}
                        </span>
                    ))}
                 </div>
             </div>
          )}

          {/* Remark */}
          {record.remark && (
            <div className="mb-8">
                <h3 className="text-xs font-bold text-milk-tea-400 uppercase mb-2">饮用评价</h3>
                <div className="p-4 bg-cream rounded-2xl text-milk-tea-800 text-sm leading-relaxed italic border border-milk-tea-50">
                    "{record.remark}"
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};