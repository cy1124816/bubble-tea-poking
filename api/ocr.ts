/**
 * Vercel Serverless 函数：调用百度 OCR API
 * 解决前端跨域问题，保护 API Key 安全
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface BaiduTokenResponse {
  access_token: string;
  expires_in: number;
}

interface BaiduOCRResponse {
  words_result: Array<{
    words: string;
  }>;
  words_result_num: number;
}

// 百度 API 配置（从环境变量读取）
const API_KEY = process.env.BAIDU_API_KEY;
const SECRET_KEY = process.env.BAIDU_SECRET_KEY;

// 缓存 access_token（避免频繁请求）
let cachedToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 获取百度 Access Token
 */
async function getAccessToken(): Promise<string> {
  // 如果有缓存且未过期，直接返回
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`;

  const response = await fetch(url, { method: 'POST' });
  const data: BaiduTokenResponse = await response.json();

  if (!data.access_token) {
    throw new Error('获取百度 Access Token 失败');
  }

  // 缓存 token（提前 5 分钟过期）
  cachedToken = data.access_token;
  tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;

  return cachedToken;
}

/**
 * 调用百度通用文字识别（高精度版）
 */
async function recognizeText(imageBase64: string): Promise<string> {
  const accessToken = await getAccessToken();
  const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `image=${encodeURIComponent(imageBase64)}`,
  });

  const data: BaiduOCRResponse = await response.json();

  if (!data.words_result) {
    throw new Error('OCR 识别失败');
  }

  // 将识别结果合并成一个字符串
  const text = data.words_result.map((item) => item.words).join('\n');
  return text;
}

/**
 * Vercel Serverless 函数入口
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 检查环境变量
  if (!API_KEY || !SECRET_KEY) {
    return res.status(500).json({
      error: '服务器配置错误：缺少百度 API Key',
      message: '请在 Vercel 环境变量中配置 BAIDU_API_KEY 和 BAIDU_SECRET_KEY'
    });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: '缺少图片数据' });
    }

    // 调用百度 OCR
    const text = await recognizeText(image);

    return res.status(200).json({
      success: true,
      text,
    });
  } catch (error) {
    console.error('OCR 识别失败:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
}
