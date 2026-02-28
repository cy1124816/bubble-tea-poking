# 百度 OCR 配置指南

本项目已集成百度 OCR 高精度识别，识别率远高于离线方案。

## 📝 第一步：申请百度 OCR API Key

1. **注册百度智能云账号**
   - 访问：https://cloud.baidu.com/
   - 点击右上角「注册」，使用手机号注册
   - 完成实名认证（需要身份证）

2. **开通文字识别服务**
   - 登录后访问：https://console.bce.baidu.com/ai/#/ai/ocr/overview/index
   - 点击「立即使用」
   - 找到「通用文字识别（高精度版）」，点击「领取免费资源」
   - 免费额度：每天 500 次调用，完全够个人使用

3. **创建应用获取 API Key**
   - 访问：https://console.bce.baidu.com/ai/#/ai/ocr/app/list
   - 点击「创建应用」
   - 填写应用名称：`奶茶戳戳`
   - 应用类型：随便选一个
   - 点击「立即创建」
   - 创建成功后，你会看到：
     - **API Key**（类似：`abc123xyz456...`）
     - **Secret Key**（类似：`def789uvw012...`）
   - ⚠️ 保存好这两个密钥，待会要用

## 🚀 第二步：部署到 Vercel

### 2.1 准备工作

1. 确保你有 GitHub 账号（你已经有了）
2. 访问 https://vercel.com/ 注册账号（用 GitHub 登录）

### 2.2 部署步骤

1. **推送代码到 GitHub**
   ```bash
   cd /Users/cy/Desktop/厦大用文件夹/奶茶戳戳/奶茶戳戳代码

   # 如果还没有初始化 git，先初始化
   git init
   git add .
   git commit -m "集成百度 OCR 功能"

   # 关联远程仓库（如果已经有了，跳过这步）
   git remote add origin https://github.com/cy1124816/bubble-tea-poking.git

   # 推送代码
   git push -u origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com/new
   - 选择 「Import Git Repository」
   - 找到你的 `bubble-tea-poking` 仓库，点击 「Import」
   - Framework Preset: 选择 「Vite」
   - 点击 「Deploy」（先不要着急，还要配置环境变量）

3. **配置环境变量**
   - 在 Vercel 项目页面，点击 「Settings」
   - 点击左侧 「Environment Variables」
   - 添加两个环境变量：

     | Name | Value |
     |------|-------|
     | `BAIDU_API_KEY` | 你的百度 API Key（第一步获取的） |
     | `BAIDU_SECRET_KEY` | 你的百度 Secret Key（第一步获取的） |

   - 点击 「Save」

4. **重新部署**
   - 回到 「Deployments」标签
   - 点击最新的部署右侧的三个点「...」
   - 选择 「Redeploy」
   - 等待部署完成（大约 1-2 分钟）

5. **获取你的网站链接**
   - 部署成功后，你会看到类似：`https://bubble-tea-poking.vercel.app`
   - 这个链接**不需要 VPN**，在国内可以直接访问！

## ✅ 第三步：测试 OCR 功能

1. 访问你的 Vercel 网站
2. 点击「记一杯」
3. 点击「拍照」按钮
4. 选择奶茶标签照片
5. 查看识别结果

### 识别逻辑

代码会自动：
1. **优先使用百度 OCR**（高精度，识别率 95%+）
2. **失败时降级到 Tesseract.js**（离线备选方案）
3. 在控制台显示使用的识别方式

## 🔍 常见问题

### Q1: 提示「服务器配置错误：缺少百度 API Key」
**A**: 检查 Vercel 环境变量是否正确配置，变量名必须是 `BAIDU_API_KEY` 和 `BAIDU_SECRET_KEY`

### Q2: 百度 OCR 识别失败，但 Tesseract.js 成功
**A**: 可能的原因：
- API Key 配置错误
- 百度 API 调用次数超限（免费版每天 500 次）
- 网络问题

### Q3: 两种方式都识别失败
**A**: 检查：
- 照片是否清晰
- 光线是否充足
- 文字是否完整可见

## 📊 费用说明

- **Vercel 部署**：完全免费
- **百度 OCR**：
  - 免费额度：每天 500 次
  - 超出后：每千次 ¥6（对个人用户来说几乎不会超）
- **Tesseract.js**：完全免费（离线）

## 🎉 完成！

配置完成后，你的奶茶记录应用就有了高精度 OCR 识别功能！

---

**技术架构：**
- 前端：React + Vite
- OCR：百度 OCR (主) + Tesseract.js (备)
- 部署：Vercel (前端 + Serverless 函数)
- 存储：localStorage (本地)
