import { TeaRecord } from '../types';

const STORAGE_KEY = 'bubble_tea_journal_v1';
const INITIALIZED_KEY = 'bubble_tea_initialized';

export const saveRecords = (records: TeaRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    // Mark as initialized when user saves any data (even empty array)
    localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch (e) {
    console.error("Failed to save records", e);
  }
};

export const loadRecords = (): TeaRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load records", e);
    return [];
  }
};

export const isInitialized = (): boolean => {
  return localStorage.getItem(INITIALIZED_KEY) === 'true';
};

// Seed some fake data if empty for better first-time UX
export const seedInitialData = (): TeaRecord[] => {
  const existing = loadRecords();
  if (existing.length > 0) return existing;

  const now = Date.now();
  const day = 86400000;
  
  const mock: TeaRecord[] = [
    {
      id: '1',
      brand: '喜茶',
      name: '多肉葡萄',
      sugar: '少糖',
      ice: '少冰',
      price: 28,
      rating: 5,
      remark: '经典口味，今天的芝士奶盖很完美，葡萄果肉很多。',
      timestamp: now - day * 2,
    },
    {
      id: '2',
      brand: 'CoCo都可',
      name: '珍珠奶茶',
      sugar: '五分糖',
      ice: '正常冰',
      price: 15,
      rating: 4,
      remark: '性价比很高，珍珠很有嚼劲。',
      timestamp: now - day * 5,
    },
    {
      id: '3',
      brand: '霸王茶姬',
      name: '伯牙绝弦',
      sugar: '三分糖',
      ice: '去冰',
      price: 18,
      rating: 3,
      remark: '今天的茶味稍微淡了一点点。',
      timestamp: now - day * 1,
    }
  ];
  
  saveRecords(mock);
  return mock;
};