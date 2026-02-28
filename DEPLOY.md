# 🚀 GitHub Pages 部署指南（国内可访问）

## 前提条件
- 已安装 Git
- 有 GitHub 账号

---

## 📝 部署步骤

### **第一步：在 GitHub 创建仓库**

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `bubble-tea-poking`
   - 选择 **Public**（公开仓库才能用免费的 GitHub Pages）
   - **不要勾选** "Add a README file"
3. 点击 **Create repository**

---

### **第二步：配置 Git 用户信息**

在终端运行（替换成你的信息）：

```bash
cd "/Users/cy/Desktop/厦大用文件夹/奶茶戳戳/奶茶戳戳代码"

# 设置你的 GitHub 用户名和邮箱
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的邮箱@example.com"
```

---

### **第三步：提交代码到 GitHub**

```bash
cd "/Users/cy/Desktop/厦大用文件夹/奶茶戳戳/奶茶戳戳代码"

# 添加所有文件
git add .

# 创建第一次提交
git commit -m "Initial commit: 奶茶戳戳应用"

# 重命名分支为 main
git branch -M main

# 连接到你的 GitHub 仓库（替换"你的用户名"）
git remote add origin https://github.com/你的用户名/bubble-tea-poking.git

# 推送到 GitHub
git push -u origin main
```

**注意**：如果 push 时要求输入密码，需要使用 Personal Access Token：
1. 访问: https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 勾选 **repo** 权限
4. 复制生成的 token
5. 在 push 时将 token 作为密码输入

---

### **第四步：部署到 GitHub Pages**

```bash
npm run deploy
```

这个命令会：
1. 自动构建项目（`npm run build`）
2. 将构建好的文件推送到 `gh-pages` 分支

---

### **第五步：在 GitHub 启用 Pages**

1. 访问你的仓库设置页面：
   ```
   https://github.com/你的用户名/bubble-tea-poking/settings/pages
   ```

2. 在 **Build and deployment** 部分：
   - **Source**: 选择 `Deploy from a branch`
   - **Branch**: 选择 `gh-pages` 和 `/ (root)`
   - 点击 **Save**

3. 等待 1-2 分钟，GitHub 会自动部署

---

## 🎉 完成！

访问你的应用：
```
https://你的用户名.github.io/bubble-tea-poking/
```

**这个链接不需要 VPN，国内可以直接访问！**

---

## 🔄 后续更新

每次修改代码后，重新部署：

```bash
cd "/Users/cy/Desktop/厦大用文件夹/奶茶戳戳/奶茶戳戳代码"

# 提交更改
git add .
git commit -m "更新说明"
git push

# 重新部署
npm run deploy
```

---

## ❓ 常见问题

### Q: 页面显示 404
A:
- 确认 Settings → Pages 中已选择 `gh-pages` 分支
- 等待 1-2 分钟让 GitHub 构建完成
- 检查 vite.config.ts 中是否有 `base: '/bubble-tea-poking/'`

### Q: 样式丢失或页面空白
A: 确保 vite.config.ts 中设置了正确的 `base` 路径

### Q: git push 报错
A: 使用 Personal Access Token 而不是密码登录

---

## 📱 分享给朋友

GitHub Pages 的优点：
✅ 完全免费
✅ 国内可直接访问（不需要 VPN）
✅ 自动 HTTPS 加密
✅ 稳定可靠

直接把链接发给朋友即可！
