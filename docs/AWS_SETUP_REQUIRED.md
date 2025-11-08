# AWS Setup Required - Quick Checklist

## ❌ Current Status: AWS Not Configured

Your system currently does not have AWS configured. Here's what you need to do:

## ✅ Required Steps

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
Download from: https://aws.amazon.com/cli/

**Verify installation:**
```bash
aws --version
```

### 2. Get AWS Credentials

You need:
- **AWS Access Key ID**
- **AWS Secret Access Key**

**How to get them:**
1. Log in to AWS Console: https://console.aws.amazon.com/
2. Go to IAM (Identity and Access Management)
3. Click on "Users" → Your username (or create a new user)
4. Go to "Security credentials" tab
5. Click "Create access key"
6. Choose "Command Line Interface (CLI)"
7. Download or copy the Access Key ID and Secret Access Key

**⚠️ Important:** Keep these credentials secure and never commit them to git!

### 3. Configure AWS Credentials

Run this command and enter your credentials when prompted:

```bash
aws configure
```

You'll be asked for:
- **AWS Access Key ID**: [Paste your access key]
- **AWS Secret Access Key**: [Paste your secret key]
- **Default region name**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

This creates:
- `~/.aws/credentials` (your credentials)
- `~/.aws/config` (your configuration)

### 4. Verify AWS Configuration

Test your configuration:

```bash
aws sts get-caller-identity
```

This should return your AWS account ID, user ARN, and user ID.

### 5. Required AWS Permissions

Your AWS user needs these permissions:
- CloudFormation (full access)
- Lambda (full access)
- API Gateway (full access)
- CloudFront (full access)
- S3 (full access)
- IAM (create roles and policies)
- CloudWatch Logs (full access)

**Easiest for development:** Attach the `AdministratorAccess` policy to your user.

**For production:** Create a custom IAM policy with only the required permissions.

### 6. Bootstrap AWS CDK (First Time Only)

If this is your first time using AWS CDK in your account/region:

```bash
# Get your account ID
aws sts get-caller-identity

# Bootstrap CDK (replace ACCOUNT-ID and REGION)
npx cdk bootstrap aws://ACCOUNT-ID/us-east-1
```

Example:
```bash
npx cdk bootstrap aws://123456789012/us-east-1
```

## 📦 Next Steps After AWS Setup

Once AWS is configured:

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build for serverless:**
   ```bash
   pnpm build:serverless
   ```

3. **Deploy:**
   ```bash
   pnpm deploy
   ```

## 📚 Full Documentation

See `DEPLOYMENT.md` for complete deployment instructions.

## 🔍 Quick Verification

Run these commands to verify everything is set up:

```bash
# Check AWS CLI
aws --version

# Check AWS credentials
aws sts get-caller-identity

# Check if credentials file exists
ls ~/.aws/credentials

# Check if config file exists
ls ~/.aws/config
```

All commands should succeed without errors.

## ❓ Need Help?

- **AWS Account:** Sign up at https://aws.amazon.com/
- **AWS Documentation:** https://docs.aws.amazon.com/
- **CDK Documentation:** https://docs.aws.amazon.com/cdk/
- **OpenNext Documentation:** https://opennext.js.org/

---

**Once you complete these steps, you'll be ready to deploy!** 🚀

