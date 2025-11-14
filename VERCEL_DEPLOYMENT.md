# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

## Environment Variables

Add these in Vercel Dashboard > Settings > Environment Variables:

```
NODE_ENV=production
VITE_API_BASE_URL=https://your-project.vercel.app/api
```

## Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

## Automatic Deployments

- **Production**: Pushes to `master` branch
- **Preview**: Pull requests and other branches

## Project Structure

```
├── backend/          # Express backend (serverless functions)
├── src/             # React frontend
├── public/          # Static assets
├── vercel.json      # Vercel configuration
└── package.json     # Dependencies
```

## Vercel Functions (Backend)

Backend routes are automatically deployed as serverless functions:
- `/api/weather` → backend/routes/weather.js
- `/api/risk` → backend/routes/risk.js
- `/api/locations` → backend/routes/locations.js

## Monitoring

- View logs: `vercel logs`
- Analytics: Available in Vercel Dashboard
- Performance monitoring built-in

## Rollback

```bash
vercel rollback
```

## Local Development

```bash
npm run dev        # Frontend (port 5173)
npm run server     # Backend (port 3000)
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Routes Not Working
- Check `vercel.json` configuration
- Ensure backend routes are in `/api/*` format
- Verify CORS settings in backend

### Environment Variables
- Must be added in Vercel Dashboard
- Restart deployment after adding variables

## Cost

- **Free Tier**: 100 GB bandwidth, unlimited deployments
- **Pro**: $20/month per user
- **Enterprise**: Custom pricing
