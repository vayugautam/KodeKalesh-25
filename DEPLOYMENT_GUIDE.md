# 🔥 Forest Fire Prediction System - Deployment Guide

## 📋 Quick Deployment Steps

### 1️⃣ Deploy to Vercel (Fastest - 2 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Or use Vercel Dashboard:**
1. Visit [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `vayugautam/KodeKalesh-25`
3. Click "Deploy" (No configuration needed!)

✅ Your app will be live at: `https://your-project.vercel.app`

---

### 2️⃣ Deploy to AWS

#### AWS Amplify (Recommended)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js kodekalesh25

# Create environment
eb create kodekalesh25-env

# Deploy
eb deploy
```

#### AWS S3 + CloudFront
```bash
# Build project
npm run build

# Create S3 bucket
aws s3 mb s3://kodekalesh25-app

# Upload files
aws s3 sync dist/ s3://kodekalesh25-app --acl public-read

# Enable static hosting
aws s3 website s3://kodekalesh25-app --index-document index.html
```

---

## 🌐 Environment Variables

Add these in your deployment platform:

```env
NODE_ENV=production
VITE_API_BASE_URL=https://your-domain.com/api
```

**Vercel:** Project Settings → Environment Variables  
**AWS Amplify:** App Settings → Environment Variables  
**AWS EB:** Configuration → Software → Environment Properties

---

## 📂 Project Structure

```
kodekalesh25/
├── backend/                 # Express.js backend
│   ├── routes/             # API routes
│   ├── data/               # Static data
│   └── index.js            # Server entry
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/              # Page components
│   └── utils/              # Utilities
├── public/                 # Static assets
├── vercel.json             # Vercel config
└── AWS_DEPLOYMENT.md       # Detailed AWS guide
```

---

## 🚀 Features

✅ **Real-time Fire Risk Prediction**  
✅ **Interactive Map with Heat Layers**  
✅ **Weather Data Integration**  
✅ **ML Model Predictions**  
✅ **User Authentication**  
✅ **Responsive Design**  
✅ **PDF Report Export**

---

## 🛠️ Tech Stack

**Frontend:**
- React 18.3
- Material-UI 6
- Leaflet Maps
- Vite

**Backend:**
- Express.js
- Open-Meteo API
- CORS enabled

**Deployment:**
- Vercel (Recommended)
- AWS Amplify/EB/S3

---

## 📖 Detailed Guides

- **Vercel Deployment:** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **AWS Deployment:** See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)
- **AWS Workshop Guide:** [nsb.dev/aws-workshop-guide](https://nsb.dev/aws-workshop-guide)

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Run frontend (port 5173)
npm run dev

# Run backend (port 3000)
npm run server
```

Open: http://localhost:5173

---

## 📱 Live Demo

**Frontend:** Click on the map to get fire risk predictions  
**Backend API:** `/api/weather`, `/api/risk`, `/api/locations`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 👥 Team

Created for **KodeKalesh 2025** Hackathon

**Repository:** [github.com/vayugautam/KodeKalesh-25](https://github.com/vayugautam/KodeKalesh-25)

---

## 🆘 Troubleshooting

### Vercel Build Fails
```bash
# Check logs
vercel logs

# Redeploy
vercel --prod --force
```

### AWS Connection Issues
```bash
# Configure AWS credentials
aws configure

# Test connection
aws s3 ls
```

### Backend API Not Working
- Check CORS settings in `backend/index.js`
- Verify API routes in `vercel.json`
- Check environment variables

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/vayugautam/KodeKalesh-25/issues)
- **Discussions:** [GitHub Discussions](https://github.com/vayugautam/KodeKalesh-25/discussions)

---

**🎉 Happy Deploying!**
