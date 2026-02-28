/**
 * OCR 识别服务（使用 Tesseract.js）
 * 完全离线运行，不需要 API Key，隐私更好
 */

import { createWorker } from 'tesseract.js';
import { preprocessForOCR } from './imageService';

let worker: any = null;

/**
 * 初始化 OCR Worker（只初始化一次，提高性能）
 */
async function getWorker() {
  if (worker) {
    return worker;
  }

  worker = await createWorker('chi_sim', 1, {
    // 使用简体中文语言包
    // 可以同时支持中英文
    logger: (m: any) => {
      // 可以在这里打印进度日志
      if (m.status === 'loading language' || m.status === 'initializing tesseract') {
        console.log(`OCR 初始化: ${m.status} ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  return worker;
}

/**
 * 识别图片中的文字
 * @param imageFile File 对象或 Base64 字符串
 * @param onProgress 进度回调
 */
export async function recognizeText(
  imageFile: File | string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const ocrWorker = await getWorker();

  // 如果是 File 对象，先进行图片预处理
  let processedImage: File | Blob | string = imageFile;
  if (imageFile instanceof File) {
    console.log('正在预处理图片（灰度化+增强对比度）...');
    processedImage = await preprocessForOCR(imageFile);
    console.log('图片预处理完成');
  }

  // 识别图片
  const {
    data: { text },
  } = await ocrWorker.recognize(processedImage, {
    rotateAuto: true, // 自动旋转
  });

  return text;
}

/**
 * 清理 Worker（在不需要时调用，释放资源）
 */
export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
