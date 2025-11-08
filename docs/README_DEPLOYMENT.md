# Quick Start: AWS Lambda Deployment

## ⚠️ AWS Configuration Required

**AWS is NOT currently configured on your system.** 

Please follow the steps in **`AWS_SETUP_REQUIRED.md`** first to configure AWS credentials.

## Quick Deployment Steps

Once AWS is configured:

```bash
# 1. Install dependencies
pnpm install

# 2. Build for serverless
pnpm build:serverless

# 3. Deploy to AWS
pnpm deploy
```

## What Was Set Up

✅ **AWS CDK Infrastructure** (`infra/` directory)
- CloudFormation stack definition
- Lambda function configuration
- API Gateway setup
- CloudFront distribution
- S3 buckets for static assets and cache

✅ **OpenNext Configuration** (`opennext.config.ts`)
- Serverless build configuration
- Lambda wrapper settings
- Cache configuration

✅ **Next.js Configuration** (`next.config.ts`)
- Standalone output mode for serverless

✅ **Package Scripts**
- `build:serverless` - Build for AWS Lambda
- `deploy` - Deploy to AWS
- `deploy:dev` - Deploy to dev stage
- `deploy:prod` - Deploy to prod stage
- `destroy` - Remove all AWS resources

## Files Created

- `infra/index.ts` - CDK app entry point
- `infra/nextjs-stack.ts` - Main CDK stack definition
- `infra/tsconfig.json` - TypeScript config for CDK
- `cdk.json` - CDK configuration
- `opennext.config.ts` - OpenNext configuration
- `DEPLOYMENT.md` - Complete deployment guide
- `AWS_SETUP_REQUIRED.md` - AWS setup checklist

## Next Steps

1. **Read `AWS_SETUP_REQUIRED.md`** - Configure AWS credentials
2. **Read `DEPLOYMENT.md`** - Full deployment instructions
3. **Deploy** - Run `pnpm deploy` after AWS is configured

---

For detailed information, see `DEPLOYMENT.md`.

