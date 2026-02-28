import React, { useMemo, useState } from 'react';
import { TeaRecord } from '../types';
import { Search, X, ChevronDown, CupSoda } from 'lucide-react';

interface LibraryViewProps {
  records: TeaRecord[];
}

interface DrinkGroup {
    name: string;
    records: TeaRecord[];
    count: number;
    avgRating: number;
    latestTimestamp: number;
}

interface BrandGroup {
    brand: string;
    drinks: DrinkGroup[];
    totalCount: number;
    avgRating: number;
    latestTimestamp: number;
}

type SortOption = 'frequency' | 'rating' | 'date';

export const LibraryView: React.FC<LibraryViewProps> = ({ records }) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Changed to Set to support multiple expanded brands
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('frequency');

  // Grouping Logic
  const groupedData: BrandGroup[] = useMemo(() => {
    if (searchQuery) return []; 

    const brands: Record<string, Record<string, TeaRecord[]>> = {};

    // 1. Group by Brand -> Drink Name
    records.forEach(r => {
        if (!brands[r.brand]) brands[r.brand] = {};
        if (!brands[r.brand][r.name]) brands[r.brand][r.name] = [];
        brands[r.brand][r.name].push(r);
    });

    // 2. Transform to Array structure
    const brandGroups: BrandGroup[] = Object.entries(brands).map(([brandName, drinkMap]) => {
        const drinks: DrinkGroup[] = Object.entries(drinkMap).map(([drinkName, drinkRecords]) => {
            const sumRating = drinkRecords.reduce((sum, r) => sum + r.rating, 0);
            const latest = Math.max(...drinkRecords.map(r => r.timestamp));
            
            return {
                name: drinkName,
                records: drinkRecords,
                count: drinkRecords.length,
                avgRating: sumRating / drinkRecords.length,
                latestTimestamp: latest
            };
        });

        // Sort Drinks inside the brand based on current sort option
        drinks.sort((a, b) => {
            if (sortBy === 'frequency') {
                if (b.count !== a.count) return b.count - a.count;
                return b.latestTimestamp - a.latestTimestamp;
            } else if (sortBy === 'rating') {
                if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
                return b.latestTimestamp - a.latestTimestamp;
            } else { // date
                return b.latestTimestamp - a.latestTimestamp;
            }
        });

        const totalCount = drinks.reduce((sum, d) => sum + d.count, 0);
        
        // Calculate weighted average for brand
        const allBrandRecords = drinks.flatMap(d => d.records);
        const brandAvgRating = allBrandRecords.reduce((sum, r) => sum + r.rating, 0) / allBrandRecords.length;
        
        // Find latest timestamp for the brand
        const brandLatestTimestamp = Math.max(...drinks.map(d => d.latestTimestamp));

        return {
            brand: brandName,
            drinks,
            totalCount,
            avgRating: brandAvgRating,
            latestTimestamp: brandLatestTimestamp
        };
    });

    // 3. Sort Brands based on the selected criteria
    brandGroups.sort((a, b) => {
        if (sortBy === 'frequency') {
            // Sort by total count desc
            if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
            return a.brand.localeCompare(b.brand);
        } else if (sortBy === 'rating') {
            // Sort by average rating desc
            if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
            return a.brand.localeCompare(b.brand);
        } else { // date
            // Sort by latest timestamp desc
            return b.latestTimestamp - a.latestTimestamp;
        }
    });

    return brandGroups;
  }, [records, searchQuery, sortBy]);

  // Search Logic
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return records.filter(
      r => 
        r.brand.toLowerCase().includes(lowerQuery) || 
        r.name.toLowerCase().includes(lowerQuery)
    );
  }, [records, searchQuery]);

  const renderStars = (rating: number) => {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  };

  const toggleBrand = (brand: string) => {
      const newSet = new Set(expandedBrands);
      if (newSet.has(brand)) {
          newSet.delete(brand);
      } else {
          newSet.add(brand);
      }
      setExpandedBrands(newSet);
  };

  const SortButton = ({ type, label }: { type: SortOption, label: string }) => (
    <button 
        onClick={() => setSortBy(type)}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
            sortBy === type 
                ? 'bg-milk-tea-800 text-white border-milk-tea-800' 
                : 'bg-white text-milk-tea-500 border-milk-tea-100 hover:bg-milk-tea-50'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-6 pb-24 max-w-md mx-auto animate-fade-in">
      <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 pb-4 -mx-6 px-6 pt-2">
        <h1 className="text-3xl font-bold text-milk-tea-900 mb-4">品鉴图鉴</h1>
        
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-milk-tea-300" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索品牌或饮品..."
            className="w-full pl-12 pr-10 py-3 bg-white rounded-2xl border border-milk-tea-100 text-milk-tea-900 focus:outline-none focus:ring-2 focus:ring-milk-tea-200 placeholder:text-milk-tea-200 transition-all shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-milk-tea-300 hover:text-milk-tea-500 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Controls (Only visible when not searching) */}
        {!searchQuery && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {/* Icon removed here */}
                <SortButton type="frequency" label="最常喝" />
                <SortButton type="rating" label="评分最高" />
                <SortButton type="date" label="最新" />
            </div>
        )}
      </div>
      
      <div className="space-y-4 mt-2">
        {/* Accordion Brand List */}
        {!searchQuery && groupedData.map((group) => {
            const isExpanded = expandedBrands.has(group.brand);
            return (
                <div key={group.brand} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-milk-tea-100 transition-all duration-300">
                    <button 
                        onClick={() => toggleBrand(group.brand)}
                        className={`w-full flex justify-between items-center p-5 text-left transition-colors ${isExpanded ? 'bg-milk-tea-50/50' : 'hover:bg-milk-tea-50/30'}`}
                    >
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-milk-tea-100 flex items-center justify-center text-milk-tea-800 font-bold text-xl">
                                {group.brand[0]}
                             </div>
                             <div>
                                <h2 className="font-bold text-milk-tea-900 text-lg">{group.brand}</h2>
                                <p className="text-xs text-milk-tea-500 font-medium">
                                    {group.totalCount} 杯 • {group.avgRating.toFixed(1)} 平均分
                                </p>
                             </div>
                        </div>
                        <div className={`text-milk-tea-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} />
                        </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="bg-white border-t border-milk-tea-50 animate-fade-in">
                            {group.drinks.map((drink, idx) => (
                                <div key={`${drink.name}-${idx}`} className="p-4 flex items-center justify-between border-b border-milk-tea-50 last:border-none hover:bg-cream/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 text-milk-tea-300">
                                            <CupSoda size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-milk-tea-800 text-sm">{drink.name}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="px-1.5 py-0.5 bg-milk-tea-100 text-milk-tea-800 text-[10px] rounded font-medium">
                                                    {drink.count} 杯
                                                </span>
                                                <span className="text-[10px] text-milk-tea-400 flex items-center">
                                                    上次: {new Date(drink.latestTimestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-yellow-400 text-xs tracking-tighter">{renderStars(drink.avgRating)}</span>
                                        <p className="text-[10px] text-milk-tea-400 font-medium mt-0.5">
                                            {drink.avgRating.toFixed(1)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        })}
        
        {/* Search Results (Flat List) */}
        {searchQuery && filteredRecords.map(record => (
             <div key={record.id} className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm shadow-milk-tea-100 border border-transparent">
                <div className="w-14 h-14 rounded-xl bg-milk-tea-100 flex-shrink-0 overflow-hidden relative">
                    {record.imageUrl ? (
                        <img src={record.imageUrl} alt={record.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-milk-tea-300 text-xl font-bold opacity-50">
                            {record.brand[0]}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-milk-tea-900 truncate">{record.name}</h4>
                            <p className="text-xs text-milk-tea-500 font-medium uppercase tracking-wide">{record.brand}</p>
                        </div>
                        <span className="text-yellow-400 text-xs tracking-tighter">{renderStars(record.rating)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                         <p className="text-[11px] text-milk-tea-400">
                             {record.sugar} • {record.ice}
                         </p>
                    </div>
                </div>
             </div>
        ))}
        
        {records.length > 0 && searchQuery && filteredRecords.length === 0 && (
             <div className="text-center text-milk-tea-300 mt-10">
                <p>未找到匹配项 "{searchQuery}"</p>
            </div>
        )}

        {records.length === 0 && (
            <div className="text-center text-milk-tea-300 mt-20 flex flex-col items-center">
                <p>图鉴是空的。</p>
                <p className="text-sm">快去喝一杯吧！</p>
            </div>
        )}
      </div>
    </div>
  );
};