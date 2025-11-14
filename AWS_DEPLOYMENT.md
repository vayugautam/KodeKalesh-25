# AWS Deployment Guide for KodeKalesh25

This project can be deployed to AWS using multiple services. Below are the deployment options:

## Option 1: AWS Amplify (Recommended for Frontend + Backend)

### Prerequisites
- AWS Account
- AWS Amplify CLI installed: `npm install -g @aws-amplify/cli`

### Steps
1. **Initialize Amplify**
   ```bash
   amplify init
   ```

2. **Add Hosting**
   ```bash
   amplify add hosting
   ```
   - Choose: Hosting with Amplify Console
   - Choose: Manual deployment

3. **Deploy**
   ```bash
   amplify publish
   ```

## Option 2: AWS Elastic Beanstalk (Full Stack)

### Prerequisites
- AWS EB CLI: `pip install awsebcli`

### Steps
1. **Initialize EB**
   ```bash
   eb init -p node.js kodekalesh25
   ```

2. **Create Environment**
   ```bash
   eb create kodekalesh25-env
   ```

3. **Deploy**
   ```bash
   eb deploy
   ```

## Option 3: AWS S3 + CloudFront (Frontend) + Lambda (Backend)

### Frontend Deployment
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://kodekalesh25-frontend
   ```

3. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://kodekalesh25-frontend --acl public-read
   ```

4. **Enable Static Website Hosting**
   ```bash
   aws s3 website s3://kodekalesh25-frontend --index-document index.html --error-document index.html
   ```

### Backend Deployment (Lambda)
1. **Install Serverless Framework**
   ```bash
   npm install -g serverless
   ```

2. **Create serverless.yml** (already included)

3. **Deploy Backend**
   ```bash
   cd backend
   serverless deploy
   ```

## Environment Variables

Create a `.env` file in the root:
```
VITE_API_BASE_URL=your-backend-url
VITE_FIREBASE_API_KEY=your-firebase-key
```

For AWS, set environment variables in:
- Amplify: Console > App Settings > Environment Variables
- Elastic Beanstalk: Configuration > Software > Environment Properties
- Lambda: Function > Configuration > Environment Variables

## Custom Domain Setup

### Route 53
1. Register or transfer domain to Route 53
2. Create hosted zone
3. Update nameservers

### CloudFront Distribution
1. Create distribution
2. Point to S3 bucket
3. Add custom SSL certificate (AWS Certificate Manager)
4. Update Route 53 to point to CloudFront

## CI/CD Pipeline

### AWS CodePipeline
1. Create pipeline in AWS CodePipeline
2. Connect to GitHub repository
3. Configure build stage (CodeBuild)
4. Configure deploy stage (Amplify/EB/S3)

### GitHub Actions (Alternative)
See `.github/workflows/aws-deploy.yml` for automated deployment

## Monitoring

- **CloudWatch**: Logs and metrics
- **X-Ray**: Request tracing
- **AWS Health Dashboard**: Service status

## Cost Optimization

- Use AWS Free Tier for initial deployment
- Enable CloudFront caching
- Use S3 Intelligent-Tiering
- Set up billing alerts

## Support

For detailed AWS deployment guide, visit:
https://nsb.dev/aws-workshop-guide
