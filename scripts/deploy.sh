#!/bin/bash
set -e

echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Push your changes to GitHub"
echo "2. Go to https://vercel.com/new"
echo "3. Import your repository"
echo "4. Add these environment variables:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "5. Click Deploy!"
echo ""
echo "Alternatively, use Vercel CLI:"
echo "npm install -g vercel"
echo "vercel --prod"
