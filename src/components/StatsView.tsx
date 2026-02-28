import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { TeaRecord } from '../types';

interface StatsViewProps {
  records: TeaRecord[];
}

const COLORS = ['#C89F8D', '#D3E0C8', '#E0D6E9', '#F4DCCF', '#A3B18A', '#E6BEAE', '#B5C99A', '#97A97C'];

type TimeRange = 'week' | 'month' | 'year';

export const StatsView: React.FC<StatsViewProps> = ({ records }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Filter records based on time range
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const start = new Date();
    
    if (timeRange === 'week') {
        start.setDate(now.getDate() - 6); // Last 7 days including today
        start.setHours(0, 0, 0, 0);
    } else if (timeRange === 'month') {
        start.setDate(now.getDate() - 29); // Last 30 days
        start.setHours(0, 0, 0, 0);
    } else if (timeRange === 'year') {
        start.setMonth(now.getMonth() - 11); // Last 12 months
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
    }

    return records.filter(r => r.timestamp >= start.getTime());
  }, [records, timeRange]);

  // Brand Distribution (Based on filtered records)
  const brandData = useMemo(() => {
    const stats = filteredRecords.reduce((acc, curr) => {
        if (!acc[curr.brand]) acc[curr.brand] = { name: curr.brand, value: 0 };
        acc[curr.brand].value += 1;
        return acc;
    }, {} as Record<string, { name: string; value: number }>);
    
    return Object.values(stats).sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  // Trend Data
  const trendData = useMemo(() => {
    const now = new Date();
    const data = [];

    if (timeRange === 'week') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString('zh-CN', { weekday: 'short' });
            // For matching, we need to check day/month/year
            const count = filteredRecords.filter(r => {
                const rd = new Date(r.timestamp);
                return rd.getDate() === d.getDate() && rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
            }).length;
            data.push({ name: dateStr, count });
        }
    } else if (timeRange === 'month') {
        // Last 30 days - Group by 3 days to reduce bars? Or just show all? 
        // Let's show all but hide some labels if needed.
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.getDate().toString(); // Just the day number
            const count = filteredRecords.filter(r => {
                const rd = new Date(r.timestamp);
                return rd.getDate() === d.getDate() && rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
            }).length;
            data.push({ name: dateStr, count });
        }
    } else {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            const dateStr = d.toLocaleDateString('zh-CN', { month: 'short' }); // e.g., "3月"
            const count = filteredRecords.filter(r => {
                const rd = new Date(r.timestamp);
                return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
            }).length;
            data.push({ name: dateStr, count });
        }
    }
    return data;
  }, [filteredRecords, timeRange]);

  const totalSpent = filteredRecords.reduce((sum, r) => sum + r.price, 0);
  const avgRating = filteredRecords.length > 0 ? (filteredRecords.reduce((sum, r) => sum + r.rating, 0) / filteredRecords.length).toFixed(1) : '0';

  return (
    <div className="p-6 pb-24 max-w-md mx-auto space-y-6 animate-fade-in">
      <header>
         <h1 className="text-3xl font-bold text-milk-tea-900 mb-4">饮茶统计</h1>
         
         {/* Time Range Tabs */}
         <div className="bg-white p-1 rounded-xl border border-milk-tea-100 flex mb-6">
            {(['week', 'month', 'year'] as const).map((range) => (
                <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                        timeRange === range 
                        ? 'bg-milk-tea-800 text-white shadow-sm' 
                        : 'text-milk-tea-400 hover:text-milk-tea-600 hover:bg-milk-tea-50'
                    }`}
                >
                    {range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
                </button>
            ))}
         </div>

         <div className="flex gap-4">
             <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-milk-tea-100">
                 <p className="text-xs text-milk-tea-400 uppercase font-bold">
                    {timeRange === 'week' ? '本周消费' : timeRange === 'month' ? '本月消费' : '年度消费'}
                 </p>
                 <p className="text-2xl font-bold text-milk-tea-800">¥{totalSpent}</p>
             </div>
             <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-milk-tea-100">
                 <p className="text-xs text-milk-tea-400 uppercase font-bold">
                    {timeRange === 'week' ? '本周评分' : timeRange === 'month' ? '本月评分' : '年度评分'}
                 </p>
                 <p className="text-2xl font-bold text-milk-tea-800">{avgRating}<span className="text-sm text-milk-tea-400">/5</span></p>
             </div>
         </div>
      </header>

      {/* Brand Chart */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-milk-tea-100">
        <h3 className="text-lg font-bold text-milk-tea-900 mb-4">
            {timeRange === 'week' ? '本周品牌偏好' : timeRange === 'month' ? '本月品牌偏好' : '年度品牌偏好'}
        </h3>
        <div className="h-64 w-full">
            {brandData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={brandData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {brandData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-milk-tea-300">暂无数据</div>
            )}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
            {brandData.slice(0, 6).map((b, i) => (
                <div key={b.name} className="flex items-center gap-1 text-xs text-milk-tea-600">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                    {b.name} <span className="opacity-50">({b.value})</span>
                </div>
            ))}
        </div>
      </section>

      {/* Trend Chart */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-milk-tea-100">
        <h3 className="text-lg font-bold text-milk-tea-900 mb-4">
            {timeRange === 'week' ? '本周趋势' : timeRange === 'month' ? '本月趋势' : '年度趋势'}
        </h3>
        <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9CA3AF', fontSize: 10}} 
                        dy={10}
                        interval={timeRange === 'month' ? 4 : 0} // Skip labels for month view
                    />
                    <Tooltip 
                        cursor={{fill: '#FCEDE4', opacity: 0.4}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="count" fill="#C89F8D" radius={[4, 4, 4, 4]} barSize={timeRange === 'month' ? 8 : 20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};