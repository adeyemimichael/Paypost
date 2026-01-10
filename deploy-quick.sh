#!/bin/bash

echo "🚀 Quick PayPost Deployment Script"
echo "=================================="

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo ""
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo ""
echo "🔧 Deploying backend..."
cd backend
vercel --prod --yes

if [ $? -ne 0 ]; then
    echo "❌ Backend deployment failed!"
    exit 1
fi

echo ""
echo "📝 Please update your frontend .env file with the backend URL shown above"
echo "   Set VITE_API_BASE_URL=https://your-backend-url.vercel.app/api"
echo ""
read -p "Press Enter after updating the .env file..."

cd ..

echo ""
echo "🌐 Deploying frontend..."
vercel --prod --yes

if [ $? -ne 0 ]; then
    echo "❌ Frontend deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🔧 Don't forget to:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Test survey completion functionality"
echo "3. Verify no blank pages or errors"
echo ""
echo "🎉 Your PayPost app should now be live!"