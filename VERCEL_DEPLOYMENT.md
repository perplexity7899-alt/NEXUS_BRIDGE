# Vercel Deployment Guide

## Overview
This project is a TanStack Start application configured for deployment on Vercel. The app features real-time content sharing with QR codes, powered by Supabase as the backend.

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository connected to Vercel
- Supabase project with database set up

## Environment Variables

Set these variables in your Vercel project settings:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Supabase Credentials:
1. Go to your Supabase project settings
2. Navigate to "API" section
3. Copy the "Project URL" and "anon public" key
4. Add them to Vercel's Environment Variables

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables from Supabase
5. Click "Deploy"
6. Vercel will automatically deploy on each push to main branch

### Option 2: Manual Deployment via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Build Process

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite + TanStack Start
- **Runtime**: Node.js

## Performance Tips

1. **Database Optimization**: Ensure Supabase indexes are set up on frequently queried columns
2. **Caching**: Vercel automatically caches static assets
3. **API Routes**: Server-side code runs on Vercel's Edge Network for fast responses

## Troubleshooting

### Build Fails
- Check Node.js version compatibility (needs Node 18+)
- Run `npm install` locally and verify no errors
- Check build logs in Vercel dashboard

### Environment Variables Not Loading
- Verify variable names match exactly (case-sensitive)
- Redeploy after adding/changing variables
- Check `.env.example` for required variables

### Supabase Connection Issues
- Verify credentials are correct in Vercel env vars
- Check Supabase project is accessible and not in maintenance
- Test connection locally with same credentials

## Custom Domain

1. Go to Vercel project settings → "Domains"
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. HTTPS is automatically configured via Let's Encrypt

## Monitoring & Analytics

Access your deployment metrics in Vercel dashboard:
- Page Performance
- Usage Analytics
- Error Tracking
- Function Logs

## Rollback

If a deployment causes issues:
1. Go to Vercel project → Deployments
2. Find the previous stable deployment
3. Click the three dots menu → "Promote to Production"

## Environment-Specific Builds

The app automatically uses production settings when deployed:
- Minified and optimized builds
- Server-side rendering enabled
- Error boundaries and logging active

## Local Testing Before Deploy

```bash
npm run build      # Build for production
npm run preview    # Preview the production build locally
```

This will help catch any issues before pushing to production.
