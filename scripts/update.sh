#!/bin/bash

# 奶茶戳戳 - 一键更新部署脚本

echo "🧋 开始更新奶茶戳戳..."

# 进入项目根目录
cd "$(dirname "$0")/.."

# 显示修改的文件
echo ""
echo "📝 修改的文件："
git status --short

# 添加所有修改
echo ""
echo "📦 添加修改..."
git add .

# 获取提交信息
echo ""
read -p "✍️  请输入更新说明（直接回车使用默认）: " commit_msg

# 如果没有输入，使用默认信息
if [ -z "$commit_msg" ]; then
    commit_msg="更新代码 $(date '+%Y-%m-%d %H:%M')"
fi

# 提交
echo ""
echo "💾 提交修改..."
git commit -m "$commit_msg"

# 推送到 GitHub
echo ""
echo "☁️  推送到 GitHub..."
git push

# 部署到 GitHub Pages
echo ""
echo "🚀 部署到 GitHub Pages..."
npm run deploy

echo ""
echo "✅ 完成！"
echo ""
echo "📱 访问你的应用："
echo "https://cy1124816.github.io/bubble-tea-poking/"
echo ""
echo "⏱️  等待 1-2 分钟后刷新页面查看更新"
