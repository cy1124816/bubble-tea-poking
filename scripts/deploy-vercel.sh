#!/bin/bash

# 奶茶戳戳 - Vercel 部署脚本

echo "🚀 开始部署到 Vercel..."
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 检测到未安装 Vercel CLI，正在安装..."
    npm install -g vercel
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建成功！"
echo ""

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
vercel --prod

echo ""
echo "🎉 部署完成！"
echo ""
echo "⚠️  别忘了在 Vercel 配置环境变量："
echo "   1. 访问 https://vercel.com/dashboard"
echo "   2. 进入项目 Settings → Environment Variables"
echo "   3. 添加 BAIDU_API_KEY 和 BAIDU_SECRET_KEY"
echo ""
echo "📖 详细配置说明请查看 docs/BAIDU_OCR_SETUP.md"
