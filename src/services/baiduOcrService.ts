/**
 * 百度 OCR 识别服务（通过 Vercel API 代理）
 * 高精度识别，适合复杂场景
 */

import { fileToBase64 } from './imageService';

/**
 * 使用百度 OCR 识别图片中的文字
 * @param imageFile File 对象
 */
export async function recognizeTextWithBaidu(imageFile: File): Promise<string> {
  try {
    console.log('正在使用百度 OCR 识别...');

    // 将图片转换为 Base64
    const base64Image = await fileToBase64(imageFile);

    // 调用 Vercel API 函数（自动路由到 /api/ocr）
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || '识别失败');
    }

    console.log('百度 OCR 识别成功');
    return data.text;
  } catch (error) {
    console.error('百度 OCR 识别失败:', error);
    throw error;
  }
}
