# 🚀 Vercel 部署完整指南

## 前提条件

✅ 你已经有了：
- GitHub 账号
- 百度 OCR 的 API Key 和 Secret Key
- 项目已推送到 GitHub

## 📝 部署步骤

### 第一步：注册/登录 Vercel

1. **访问 Vercel 官网**
   ```
   https://vercel.com/
   ```

2. **用 GitHub 登录**
   - 点击右上角「Sign Up」或「Log in」
   - 选择「Continue with GitHub」
   - 授权 Vercel 访问你的 GitHub 账号

### 第二步：导入项目

1. **进入控制台**
   - 登录后会自动跳转到控制台（Dashboard）

2. **添加新项目**
   - 点击右上角「Add New...」按钮
   - 选择「Project」

3. **选择仓库**
   - 在列表中找到 `bubble-tea-poking`
   - 点击右侧的「Import」按钮

   > 💡 如果没看到你的仓库，点击「Adjust GitHub App Permissions」授权更多仓库

### 第三步：配置项目

配置页面会自动识别项目信息：

#### 基础配置（保持默认即可）

| 配置项 | 值 | 说明 |
|--------|----|----- |
| Framework Preset | Vite | ✅ 自动识别 |
| Root Directory | `./` | ✅ 默认值 |
| Build Command | `npm run build` | ✅ 自动填充 |
| Output Directory | `dist` | ✅ 自动填充 |
| Install Command | `npm install` | ✅ 自动填充 |

#### ⚠️ 重要：配置环境变量

**在点击 Deploy 之前，必须配置环境变量！**

往下滚动页面，找到「Environment Variables」部分：

1. **添加第一个变量**
   - 点击「Name」输入框，输入：`BAIDU_API_KEY`
   - 点击「Value」输入框，粘贴你的百度 API Key
   - 点击「Add」按钮

2. **添加第二个变量**
   - 再次点击下方的输入框
   - Name: `BAIDU_SECRET_KEY`
   - Value: 粘贴你的百度 Secret Key
   - 点击「Add」按钮

确认添加了两个环境变量：
- ✅ BAIDU_API_KEY
- ✅ BAIDU_SECRET_KEY

### 第四步：开始部署

1. **点击 Deploy 按钮**
   - 在页面底部，点击蓝色的「Deploy」按钮

2. **等待部署完成**
   - 你会看到实时的构建日志
   - 通常需要 1-2 分钟

3. **部署成功**
   - 看到祝贺页面（Congratulations!）
   - 会显示你的项目网址，类似：
     ```
     https://bubble-tea-poking.vercel.app
     ```

### 第五步：测试 OCR 功能

1. **访问你的 Vercel 网站**
   - 点击页面上的「Visit」按钮
   - 或直接访问显示的网址

2. **测试拍照识别**
   - 点击「记一杯」
   - 点击「拍照」按钮
   - 选择奶茶标签照片
   - 查看识别结果

3. **查看识别引擎**
   - 打开浏览器控制台（F12）
   - 看到「识别方式: 百度 OCR」说明配置成功！

## 🔍 常见问题

### Q1: 找不到我的 GitHub 仓库

**解决方法：**
1. 点击页面上的「Adjust GitHub App Permissions」
2. 选择「All repositories」或勾选 `bubble-tea-poking`
3. 点击「Save」

### Q2: 部署失败，提示环境变量错误

**解决方法：**
1. 进入项目 Settings → Environment Variables
2. 检查变量名是否完全正确（区分大小写）：
   - `BAIDU_API_KEY`（不是 baidu_api_key）
   - `BAIDU_SECRET_KEY`（不是 baidu_secret_key）
3. 检查 Value 是否正确复制（没有多余空格）
4. 重新部署：Deployments → 最新部署 → ... → Redeploy

### Q3: OCR 还是使用 Tesseract.js

**可能原因：**
1. 环境变量配置错误
2. 百度 API Key 无效或过期
3. 浏览器缓存问题

**解决方法：**
1. 检查控制台错误信息
2. 验证环境变量是否正确
3. 强制刷新页面（Cmd+Shift+R / Ctrl+Shift+R）

### Q4: 想要更新环境变量

**步骤：**
1. 进入 Vercel 控制台
2. 选择项目 → Settings → Environment Variables
3. 找到要修改的变量，点击「...」→「Edit」
4. 修改后，返回 Deployments → Redeploy

## 🎯 部署后的工作流

### 更新代码

每次你推送代码到 GitHub，Vercel 会自动部署！

```bash
# 在本地修改代码后
git add .
git commit -m "更新说明"
git push

# Vercel 会自动检测并部署新版本
```

### 查看部署历史

1. 进入 Vercel 控制台
2. 选择项目 → Deployments
3. 可以看到所有部署记录
4. 点击任意一个可以查看详细日志

### 回滚到之前的版本

1. Deployments → 选择一个旧版本
2. 点击「...」→「Promote to Production」

## 📊 两个部署的对比

| 特性 | GitHub Pages | Vercel |
|------|-------------|--------|
| OCR 识别 | Tesseract.js（60-80%） | 百度 OCR（95%+） |
| 部署方式 | 手动 `npm run update` | 自动（git push） |
| 环境变量 | ❌ 不支持 | ✅ 支持 |
| 自定义域名 | ✅ 支持 | ✅ 支持 |
| 访问速度 | 快 | 快 |
| 费用 | 免费 | 免费 |

## ✅ 完成检查清单

- [ ] Vercel 账号已创建并登录
- [ ] 项目已从 GitHub 导入
- [ ] 配置了 BAIDU_API_KEY 环境变量
- [ ] 配置了 BAIDU_SECRET_KEY 环境变量
- [ ] 部署成功
- [ ] 测试 OCR 功能正常
- [ ] 控制台显示"百度 OCR"识别引擎

## 🎉 恭喜！

你的奶茶记录应用现在已经有了高精度的 OCR 识别功能！

**你的 Vercel 网址：**
```
https://bubble-tea-poking.vercel.app
```
（或者是 Vercel 自动分配的网址）

**两个访问地址：**
- GitHub Pages: https://cy1124816.github.io/bubble-tea-poking/ （Tesseract.js）
- Vercel: https://你的项目名.vercel.app （百度 OCR）

根据需要选择使用哪个版本！
