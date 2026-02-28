/**
 * 文字解析服务
 * 从 OCR 识别的文字中提取结构化数据
 * 支持容错和模糊匹配以应对 OCR 识别错误
 */

export interface ParsedTeaInfo {
  brand: string | null;
  name: string | null;
  sugar: string | null;
  ice: string | null;
  price: number | null;
}

// 支持的奶茶品牌列表
const BRANDS = [
  '喜茶',
  'CoCo',
  'COCO',
  'coco',
  '霸王茶姬',
  '茶百道',
  '古茗',
  '奈雪',
  '奈雪的茶',
  '一点点',
  '蜜雪冰城',
  '书亦烧仙草',
  '茶颜悦色',
  '沪上阿姨',
  '益禾堂',
  '乐乐茶',
  '7分甜',
  'KOI',
  'koi',
];

// 糖度选项（按优先级排序，避免误匹配）
const SUGAR_OPTIONS = [
  { keywords: ['7分糖', '七分糖', '少糖'], value: '少糖', pattern: /[7七]分?糖/ },
  { keywords: ['5分糖', '五分糖', '半糖'], value: '半糖', pattern: /[5五]分?糖/ },
  { keywords: ['3分糖', '三分糖', '微糖'], value: '微糖', pattern: /[3三]分?糖/ },
  { keywords: ['0糖', '零糖', '无糖'], value: '无糖', pattern: /[0零]糖|无糖/ },
  { keywords: ['正常糖', '标准糖', '全糖'], value: '正常糖', pattern: /正常糖|标准糖|全糖/ },
];

// 冰度选项
const ICE_OPTIONS = [
  { keywords: ['7分冰', '七分冰', '少冰'], value: '少冰', pattern: /[7七]分?冰|少冰/ },
  { keywords: ['去冰', '无冰', '0冰'], value: '去冰', pattern: /去冰|无冰|[0零]冰/ },
  { keywords: ['正常冰', '标准冰', '全冰'], value: '正常冰', pattern: /正常冰|标准冰|全冰/ },
  { keywords: ['温', '常温'], value: '温', pattern: /温|常温/ },
  { keywords: ['热'], value: '热', pattern: /热/ },
];

/**
 * 清理文本：移除空格和特殊字符，便于匹配
 */
function cleanText(text: string): string {
  return text.replace(/\s+/g, '').replace(/[，。、；：""''（）\[\]{}]/g, '');
}

/**
 * 从文字中提取品牌
 */
function extractBrand(text: string): string | null {
  const cleanedText = cleanText(text);

  for (const brand of BRANDS) {
    const cleanedBrand = cleanText(brand);
    if (cleanedText.includes(cleanedBrand)) {
      return brand;
    }
  }
  return null;
}

/**
 * 从文字中提取糖度（支持模糊匹配和 OCR 识别错误容错）
 */
function extractSugar(text: string): string | null {
  // 移除空格以提高匹配率
  const cleanedText = cleanText(text);

  // 先尝试关键词精确匹配
  for (const option of SUGAR_OPTIONS) {
    for (const keyword of option.keywords) {
      if (cleanedText.includes(cleanText(keyword))) {
        console.log(`[糖度] 关键词匹配成功: "${keyword}" -> ${option.value}`);
        return option.value;
      }
    }
  }

  // 再尝试正则模糊匹配
  for (const option of SUGAR_OPTIONS) {
    if (option.pattern && option.pattern.test(cleanedText)) {
      console.log(`[糖度] 正则匹配成功: ${option.pattern} -> ${option.value}`);
      return option.value;
    }
  }

  console.log('[糖度] 未匹配到任何糖度信息');
  return null;
}

/**
 * 从文字中提取冰度
 */
function extractIce(text: string): string | null {
  const cleanedText = cleanText(text);

  // 先尝试关键词精确匹配
  for (const option of ICE_OPTIONS) {
    for (const keyword of option.keywords) {
      if (cleanedText.includes(cleanText(keyword))) {
        console.log(`[冰度] 关键词匹配成功: "${keyword}" -> ${option.value}`);
        return option.value;
      }
    }
  }

  // 再尝试正则模糊匹配
  for (const option of ICE_OPTIONS) {
    if (option.pattern && option.pattern.test(cleanedText)) {
      console.log(`[冰度] 正则匹配成功: ${option.pattern} -> ${option.value}`);
      return option.value;
    }
  }

  console.log('[冰度] 未匹配到任何冰度信息');
  return null;
}

/**
 * 从文字中提取价格
 */
function extractPrice(text: string): number | null {
  // 匹配价格模式: ￥28, 28元, 28.5, $28 等
  const patterns = [
    /￥\s*(\d+\.?\d*)/,
    /(\d+\.?\d*)\s*元/,
    /\$\s*(\d+\.?\d*)/,
    /价格[：:]\s*(\d+\.?\d*)/,
    /(\d{1,2}\.\d{1,2})/,  // 匹配小数格式，如 18.8
    /^(\d{1,3})$/m,        // 单独一行的1-3位数字
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const price = parseFloat(match[1]);
      // 合理的价格范围 1-200 元
      if (price >= 1 && price <= 200) {
        console.log(`[价格] 匹配成功: ${pattern} -> ¥${price}`);
        return price;
      }
    }
  }

  console.log('[价格] 未匹配到有效价格');
  return null;
}

/**
 * 从文字中提取奶茶名称
 * 策略：
 * 1. 查找包含"茶"、"奶"等关键词的短语
 * 2. 排除品牌名、糖度、冰度等干扰信息
 */
function extractName(text: string, brand: string | null): string | null {
  // 按行分割
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  // 常见的奶茶名称关键词
  const teaKeywords = ['茶', '奶', '果', '波', '布丁', '椰', '芋', '红豆', '珍珠', '多肉', '葡萄', '柠檬', '草莓', '芝士', '烧仙草'];

  for (const line of lines) {
    const cleanedLine = cleanText(line);

    // 跳过包含品牌、糖度、冰度、价格的行
    if (
      (brand && cleanedLine.includes(cleanText(brand))) ||
      cleanedLine.includes('糖') ||
      cleanedLine.includes('冰') ||
      cleanedLine.includes('￥') ||
      cleanedLine.includes('元') ||
      cleanedLine.includes('推荐') ||
      /\d+分/.test(cleanedLine)
    ) {
      continue;
    }

    // 检查是否包含奶茶关键词
    const hasTeaKeyword = teaKeywords.some(keyword => cleanedLine.includes(keyword));

    if (hasTeaKeyword && cleanedLine.length >= 2 && cleanedLine.length <= 15) {
      console.log(`[名称] 匹配成功: "${line}"`);
      return line.trim();
    }
  }

  // 如果没找到，返回第一个符合长度的行（排除干扰信息）
  for (const line of lines) {
    const cleanedLine = cleanText(line);
    if (
      line.length >= 2 &&
      line.length <= 15 &&
      !cleanedLine.includes('糖') &&
      !cleanedLine.includes('冰') &&
      !cleanedLine.includes('￥') &&
      !cleanedLine.includes('元') &&
      !cleanedLine.includes('推荐') &&
      !/\d+分/.test(cleanedLine) &&
      !(brand && cleanedLine.includes(cleanText(brand)))
    ) {
      console.log(`[名称] 备选匹配: "${line}"`);
      return line.trim();
    }
  }

  console.log('[名称] 未匹配到奶茶名称');
  return null;
}

/**
 * 解析 OCR 识别的文字
 */
export function parseTeaInfo(text: string): ParsedTeaInfo {
  console.log('========== 开始解析文字 ==========');
  console.log('原始文字:\n', text);
  console.log('清理后文字:', cleanText(text));

  const brand = extractBrand(text);
  const name = extractName(text, brand);
  const sugar = extractSugar(text);
  const ice = extractIce(text);
  const price = extractPrice(text);

  const result = {
    brand,
    name,
    sugar,
    ice,
    price,
  };

  console.log('========== 解析结果 ==========');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * 添加自定义品牌（用户可以扩展品牌列表）
 */
export function addCustomBrand(brand: string) {
  if (!BRANDS.includes(brand)) {
    BRANDS.push(brand);
    console.log(`[品牌] 添加自定义品牌: ${brand}`);
  }
}
