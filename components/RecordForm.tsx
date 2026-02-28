import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader2, Sparkles, Upload, Image as ImageIcon, ScanText } from 'lucide-react';
import { TeaRecord } from '../types';

interface RecordFormProps {
  initialData?: TeaRecord;
  onSave: (record: Omit<TeaRecord, 'id'>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const COMMON_SUGAR = ['标准', '七分糖', '五分糖', '三分糖', '无糖'];
const COMMON_ICE = ['正常冰', '少冰', '去冰', '温', '热饮'];
const COMMON_BRANDS = [
  '喜茶', '奈雪的茶', '蜜雪冰城', '茶百道', 'CoCo都可', 
  '一点点', '古茗', '沪上阿姨', '霸王茶姬', '书亦烧仙草', 
  '益禾堂', '茶颜悦色', '7分甜', '乐乐茶'
];

export const RecordForm: React.FC<RecordFormProps> = ({ initialData, onSave, onCancel, onDelete }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  
  // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (timestamp: number) => {
    const d = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    name: initialData?.name || '',
    sugar: initialData?.sugar || '',
    ice: initialData?.ice || '',
    price: initialData?.price ? String(initialData.price) : '',
    rating: initialData?.rating || 0,
    remark: initialData?.remark || '',
    timestamp: initialData?.timestamp ? formatDateTimeLocal(initialData.timestamp) : formatDateTimeLocal(Date.now()),
  });

  const [errors, setErrors] = useState({
      brand: false,
      name: false
  });

  // Tag/Topping state
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  const coverInputRef = useRef<HTMLInputElement>(null);

  // Handle Cover Photo (Visual Only)
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64); 
    };
    reader.readAsDataURL(file);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentTag.trim()) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors = {
        brand: !formData.brand.trim(),
        name: !formData.name.trim()
    };

    if (newErrors.brand || newErrors.name) {
        setErrors(newErrors);
        return;
    }

    onSave({
      brand: formData.brand.trim(),
      name: formData.name.trim(),
      sugar: formData.sugar,
      ice: formData.ice,
      price: parseFloat(formData.price) || 0,
      rating: formData.rating,
      remark: formData.remark,
      imageUrl: imagePreview || undefined,
      tags: tags,
      timestamp: new Date(formData.timestamp).getTime()
    });
  };

  const handleDelete = () => {
      if (initialData && onDelete) {
          if (window.confirm('确定要删除这条记录吗？')) {
              onDelete(initialData.id);
          }
      }
  };

  return (
    <div className="bg-cream min-h-full pb-6 animate-fade-in">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-20 px-6 py-4 flex justify-between items-center border-b border-milk-tea-100">
        <button onClick={onCancel} className="p-2 -ml-2 text-milk-tea-500">
            <X size={24} />
        </button>
        <h2 className="text-lg font-bold text-milk-tea-900">{initialData ? '编辑记录' : '记一杯'}</h2>
        <button 
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-milk-tea-800 text-cream rounded-full text-sm font-semibold shadow-md active:scale-95 transition-transform"
        >
            保存
        </button>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Cover Image Section */}
        <div className="relative group">
            <input 
                type="file" 
                ref={coverInputRef} 
                onChange={handleCoverChange} 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                className="hidden" 
            />
            
            <div 
                onClick={() => coverInputRef.current?.click()}
                className={`w-full aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                    imagePreview ? 'border-transparent' : 'border-milk-tea-200 bg-milk-tea-100/30 hover:bg-milk-tea-100/50'
                }`}
            >
                {imagePreview ? (
                    <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium flex items-center gap-2">
                                <ImageIcon size={16} /> 更换封面
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-milk-tea-400 flex flex-col items-center gap-2">
                        <ImageIcon size={32} />
                        <span className="text-sm font-medium">添加封面图片</span>
                    </div>
                )}
            </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
            {/* Timestamp */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">时间</label>
                <input
                    type="datetime-local"
                    value={formData.timestamp}
                    onChange={(e) => setFormData({...formData, timestamp: e.target.value})}
                    className="w-full p-4 bg-white border border-milk-tea-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-milk-tea-300 text-milk-tea-900 placeholder:text-milk-tea-200 transition-colors"
                />
            </div>

            {/* Brand & Name */}
            <div className="space-y-3">
                <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">品牌 <span className="text-red-400">*</span></label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => {
                                setFormData({...formData, brand: e.target.value});
                                if (errors.brand && e.target.value.trim()) setErrors(prev => ({...prev, brand: false}));
                                setShowBrandDropdown(true);
                            }}
                            onFocus={() => setShowBrandDropdown(true)}
                            onBlur={() => setTimeout(() => setShowBrandDropdown(false), 200)} // Delay to allow click
                            placeholder="例如：喜茶"
                            className={`w-full p-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 text-milk-tea-900 placeholder:text-milk-tea-200 transition-colors ${
                                errors.brand 
                                ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                                : 'border-milk-tea-100 focus:ring-milk-tea-300'
                            }`}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-milk-tea-400 p-2 hover:text-milk-tea-600"
                        >
                            ▼
                        </button>
                    </div>
                    
                    {/* Brand Dropdown */}
                    {showBrandDropdown && (
                        <div className="absolute z-30 w-full mt-1 bg-white border border-milk-tea-100 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-fade-in">
                            {COMMON_BRANDS.filter(b => b.includes(formData.brand)).map((brand) => (
                                <button
                                    key={brand}
                                    type="button"
                                    onClick={() => {
                                        setFormData({...formData, brand});
                                        setErrors(prev => ({...prev, brand: false}));
                                        setShowBrandDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-milk-tea-50 text-milk-tea-800 text-sm font-medium border-b border-milk-tea-50 last:border-none"
                                >
                                    {brand}
                                </button>
                            ))}
                            {COMMON_BRANDS.filter(b => b.includes(formData.brand)).length === 0 && (
                                <div className="px-4 py-3 text-milk-tea-300 text-xs text-center">
                                    无匹配品牌，可直接输入
                                </div>
                            )}
                        </div>
                    )}
                    {errors.brand && <p className="text-red-400 text-xs font-bold ml-1">请输入品牌</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">饮品名称 <span className="text-red-400">*</span></label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({...formData, name: e.target.value});
                            if (errors.name && e.target.value.trim()) setErrors(prev => ({...prev, name: false}));
                        }}
                        placeholder="例如：多肉葡萄"
                        className={`w-full p-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 text-milk-tea-900 placeholder:text-milk-tea-200 transition-colors ${
                            errors.name 
                            ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                            : 'border-milk-tea-100 focus:ring-milk-tea-300'
                        }`}
                    />
                    {errors.name && <p className="text-red-400 text-xs font-bold ml-1">请输入饮品名称</p>}
                </div>
            </div>

            {/* Toppings (Tags) */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">小料/备注</label>
                <div className="w-full p-2 bg-white border border-milk-tea-100 rounded-2xl focus-within:ring-2 focus-within:ring-milk-tea-300 min-h-[56px] flex flex-wrap gap-2 items-center">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="bg-milk-tea-100 text-milk-tea-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(idx)} className="hover:text-milk-tea-900">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder={tags.length === 0 ? "例如：波霸 (回车添加)" : ""}
                        className="flex-1 bg-transparent p-2 focus:outline-none text-milk-tea-900 min-w-[100px] placeholder:text-milk-tea-200"
                    />
                </div>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">甜度</label>
                     <div className="relative">
                        <select 
                            value={formData.sugar}
                            onChange={(e) => setFormData({...formData, sugar: e.target.value})}
                            className="w-full p-3 bg-white border border-milk-tea-100 rounded-xl appearance-none text-milk-tea-900 focus:outline-none focus:ring-2 focus:ring-milk-tea-300"
                        >
                            <option value="">选择</option>
                            {COMMON_SUGAR.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-milk-tea-400">▼</div>
                     </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">温度/冰量</label>
                    <div className="relative">
                        <select 
                            value={formData.ice}
                            onChange={(e) => setFormData({...formData, ice: e.target.value})}
                            className="w-full p-3 bg-white border border-milk-tea-100 rounded-xl appearance-none text-milk-tea-900 focus:outline-none focus:ring-2 focus:ring-milk-tea-300"
                        >
                            <option value="">选择</option>
                            {COMMON_ICE.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-milk-tea-400">▼</div>
                    </div>
                </div>
            </div>

            {/* Price & Rating */}
            <div className="flex gap-4 items-end">
                <div className="space-y-1 flex-1">
                    <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">价格</label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00"
                        className="w-full p-3 bg-white border border-milk-tea-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-milk-tea-300 text-milk-tea-900 text-center"
                    />
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">评分</label>
                    <div className="flex justify-between bg-white p-3 rounded-xl border border-milk-tea-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({...formData, rating: star})}
                                className={`text-xl transition-transform active:scale-125 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Remark */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-milk-tea-500 uppercase tracking-wider ml-1">评价</label>
                <textarea
                    value={formData.remark}
                    onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    placeholder="口感如何？味道怎么样？"
                    rows={3}
                    className="w-full p-4 bg-white border border-milk-tea-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-milk-tea-300 text-milk-tea-900 resize-none placeholder:text-milk-tea-200"
                />
            </div>

            {/* Delete Button (Only in Edit Mode) */}
            {initialData && onDelete && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full py-3 mt-4 text-red-400 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                >
                    删除记录
                </button>
            )}
        </div>
      </div>
    </div>
  );
};