#!/bin/bash

echo "🚀 Deploying PayPost to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📦 Building frontend..."
npm run build

echo "🌐 Deploying frontend to Vercel..."
vercel --prod

echo "🔧 Deploying backend to Vercel..."
cd backend
vercel --prod
cd ..

echo "✅ Deployment complete!"
echo ""
echo "🔗 Frontend URL: https://paypost.vercel.app"
echo "🔗 Backend URL: https://paypost-backend.vercel.app"
echo ""
echo "📝 Next steps:"
echo "1. Update VITE_API_BASE_URL in Vercel environment variables"
echo "2. Test the deployed application"
echo "3. Monitor for any issues"