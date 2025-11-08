# AWS Lambda Serverless Deployment Guide

This guide will help you deploy your Next.js application to AWS Lambda using OpenNext and AWS CDK.

## Prerequisites

Before deploying, you need to set up AWS credentials and install required tools:

### 1. Install AWS CLI

**macOS:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Windows:**
Download and install from: https://aws.amazon.com/cli/

### 2. Configure AWS Credentials

You need AWS credentials with appropriate permissions. You can configure them in two ways:

#### Option A: AWS CLI Configuration (Recommended)

```bash
aws configure
```

You'll be prompted for:
- **AWS Access Key ID**: Your AWS access key
- **AWS Secret Access Key**: Your AWS secret key
- **Default region name**: e.g., `us-east-1`
- **Default output format**: `json`

This creates credentials at `~/.aws/credentials` and config at `~/.aws/config`.

#### Option B: Environment Variables

```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. Required AWS Permissions

Your AWS user/role needs the following permissions:
- CloudFormation (full access)
- Lambda (full access)
- API Gateway (full access)
- CloudFront (full access)
- S3 (full access)
- IAM (create roles and policies)
- CloudWatch Logs (full access)

You can use the `AdministratorAccess` policy for development, or create a custom policy with the above permissions.

### 4. Bootstrap AWS CDK (First Time Only)

If this is your first time using AWS CDK in this account/region, you need to bootstrap:

```bash
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

Replace:
- `ACCOUNT-ID` with your AWS account ID
- `REGION` with your preferred region (e.g., `us-east-1`)

You can find your account ID by running:
```bash
aws sts get-caller-identity
```

## Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=your-api-url
   DATABASE_URL=your-database-url
   # Add other environment variables as needed
   ```

## Deployment Steps

### 1. Build for Serverless

First, build your Next.js application for serverless deployment:

```bash
pnpm build:serverless
# or
npm run build:serverless
```

This will create a `.open-next` directory with the optimized serverless build.

### 2. Deploy to AWS

Deploy using AWS CDK:

```bash
# Deploy to default stage
pnpm deploy

# Deploy to specific stage
pnpm deploy:dev
pnpm deploy:prod
```

The deployment process will:
1. Create S3 buckets for static assets and cache
2. Create Lambda functions for your Next.js application
3. Set up API Gateway HTTP API
4. Create CloudFront distribution
5. Configure all necessary IAM roles and permissions

### 3. View Deployment Outputs

After deployment, CDK will output:
- **ApiUrl**: API Gateway URL
- **CloudFrontUrl**: CloudFront Distribution URL (use this for production)
- **StaticAssetsBucketName**: S3 bucket for static assets
- **CacheBucketName**: S3 bucket for cache

You can also view these in the AWS Console under CloudFormation > Stacks > 3d-modal-fe-stack.

## Environment Variables

To set environment variables for your Lambda functions, edit `infra/nextjs-stack.ts` and add them to the `environment` object:

```typescript
environment: {
  NODE_ENV: 'production',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  // Add more variables here
},
```

For sensitive values, consider using AWS Secrets Manager or Parameter Store instead of hardcoding them.

## Updating Deployment

After making changes to your code:

1. **Rebuild:**
   ```bash
   pnpm build:serverless
   ```

2. **Redeploy:**
   ```bash
   pnpm deploy
   ```

## Viewing Logs

View Lambda function logs:

```bash
aws logs tail /aws/lambda/3d-modal-fe-stack-ServerHandler --follow
```

Or view in AWS Console: CloudWatch > Log groups > `/aws/lambda/3d-modal-fe-stack-ServerHandler`

## Destroying Deployment

To remove all AWS resources:

```bash
pnpm destroy
```

**Warning:** This will delete all resources including S3 buckets and their contents.

## Troubleshooting

### Issue: "OpenNext build not found"
**Solution:** Run `pnpm build:serverless` before deploying.

### Issue: "CDK bootstrap required"
**Solution:** Run `npx cdk bootstrap aws://ACCOUNT-ID/REGION` first.

### Issue: "Access Denied" errors
**Solution:** Check your AWS credentials and permissions. Ensure you have the required IAM permissions.

### Issue: "Bucket name already exists"
**Solution:** S3 bucket names must be globally unique. Edit `infra/nextjs-stack.ts` to change the bucket name.

### Issue: Lambda timeout errors
**Solution:** Increase the timeout in `infra/nextjs-stack.ts`:
```typescript
timeout: cdk.Duration.seconds(60), // Increase from 30
```

### Issue: Memory errors
**Solution:** Increase memory allocation in `infra/nextjs-stack.ts`:
```typescript
memorySize: 2048, // Increase from 1024
```

## Custom Domain Setup (Optional)

To use a custom domain:

1. Request a certificate in AWS Certificate Manager (ACM)
2. Update `infra/nextjs-stack.ts` to add domain configuration
3. Create a Route53 hosted zone
4. Update CloudFront distribution with the domain

## Cost Optimization

- Use CloudFront caching to reduce Lambda invocations
- Consider using Lambda@Edge for static assets
- Monitor Lambda cold starts and optimize accordingly
- Use S3 lifecycle policies for cache bucket

## Security Best Practices

1. **Environment Variables:** Use AWS Secrets Manager for sensitive data
2. **IAM Roles:** Follow principle of least privilege
3. **HTTPS Only:** CloudFront is configured to redirect HTTP to HTTPS
4. **CORS:** Configure CORS properly in `infra/nextjs-stack.ts`
5. **S3 Buckets:** Buckets are private by default (no public access)

## Support

For issues or questions:
1. Check AWS CloudWatch logs
2. Review CloudFormation stack events
3. Check Lambda function logs
4. Review this documentation

---

**Note:** Make sure to review and adjust the configuration in `infra/nextjs-stack.ts` according to your specific requirements before deploying to production.

