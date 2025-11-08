import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';

export class NextjsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Check if OpenNext build exists
    const openNextPath = path.join(__dirname, '..', '.open-next');
    if (!fs.existsSync(openNextPath)) {
      throw new Error(
        'OpenNext build not found. Please run "pnpm build:serverless" first.'
      );
    }

    // Create S3 bucket for static assets
    const staticAssetsBucket = new s3.Bucket(this, 'StaticAssetsBucket', {
      bucketName: `3d-modal-fe-static-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
      autoDeleteObjects: true,
      publicReadAccess: true, // Allow public read for static assets
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      websiteIndexDocument: 'index.html',
    });

    // Upload static assets to S3
    const assetsPath = path.join(openNextPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      new s3deploy.BucketDeployment(this, 'StaticAssetsDeployment', {
        sources: [s3deploy.Source.asset(assetsPath)],
        destinationBucket: staticAssetsBucket,
        destinationKeyPrefix: '', // Upload to root of bucket
      });
    }

    // Create S3 bucket for cache
    const cacheBucket = new s3.Bucket(this, 'CacheBucket', {
      bucketName: `3d-modal-fe-cache-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Check for OpenNext server function
    const serverFunctionPath = path.join(openNextPath, 'server-functions', 'default');
    const imageOptimizerPath = path.join(openNextPath, 'image-optimization-function');
    const revalidationPath = path.join(openNextPath, 'revalidation-function');
    
    // Create Lambda function for server handler
    // OpenNext already bundles everything, so we use the asset directly
    const serverHandler = new lambda.Function(this, 'ServerHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(serverFunctionPath, {
        // Don't exclude .pnpm - we need all dependencies
        // The OpenNext build should have resolved all dependencies
        followSymlinks: cdk.SymlinkFollowMode.ALWAYS,
      }),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
        CACHE_BUCKET_NAME: cacheBucket.bucketName,
        // OpenNext static assets configuration
        ASSETS_BUCKET_NAME: staticAssetsBucket.bucketName,
        ASSETS_BUCKET_REGION: this.region,
        // CloudFront URL for static assets - will be updated after distribution is created
        // Use CloudFront URL for better performance and caching
        // Note: This will be set to CloudFront URL after distribution is created
        ASSETS_BASE_URL: `https://${staticAssetsBucket.bucketName}.s3.${this.region}.amazonaws.com`,
        // Add your environment variables here
        // NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
        // DATABASE_URL: process.env.DATABASE_URL || '',
      },
    });

    // Grant permissions to cache bucket
    cacheBucket.grantReadWrite(serverHandler);
    
    // Grant permissions to static assets bucket
    staticAssetsBucket.grantRead(serverHandler);

    // Create API Gateway HTTP API
    const httpApi = new apigateway.HttpApi(this, 'HttpApi', {
      description: 'API Gateway for 3D Modal Frontend',
      corsPreflight: {
        allowOrigins: ['*'], // Configure this properly for production
        allowMethods: [apigateway.CorsHttpMethod.ANY],
        allowHeaders: ['*'],
        allowCredentials: false,
        maxAge: cdk.Duration.days(1),
      },
    });

    // Add Lambda integration
    const lambdaIntegration = new apigatewayIntegrations.HttpLambdaIntegration(
      'LambdaIntegration',
      serverHandler
    );

    // Add catch-all route
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [
        apigateway.HttpMethod.GET,
        apigateway.HttpMethod.POST,
        apigateway.HttpMethod.PUT,
        apigateway.HttpMethod.DELETE,
        apigateway.HttpMethod.PATCH,
        apigateway.HttpMethod.OPTIONS,
      ],
      integration: lambdaIntegration,
    });

    // Add root route
    httpApi.addRoutes({
      path: '/',
      methods: [
        apigateway.HttpMethod.GET,
        apigateway.HttpMethod.POST,
        apigateway.HttpMethod.PUT,
        apigateway.HttpMethod.DELETE,
        apigateway.HttpMethod.PATCH,
        apigateway.HttpMethod.OPTIONS,
      ],
      integration: lambdaIntegration,
    });

    // Create S3 origin for static assets
    const s3Origin = new cloudfrontOrigins.S3Origin(staticAssetsBucket);

    // Create API Gateway origin for dynamic routes
    const apiOrigin = new cloudfrontOrigins.HttpOrigin(
      `${httpApi.apiId}.execute-api.${this.region}.amazonaws.com`,
      {
        originPath: '',
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      }
    );

    // Create custom origin request policy to forward Host header
    const originRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'OriginRequestPolicy', {
      originRequestPolicyName: 'ForwardAllHeaders',
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.all(),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
    });

    // Create CloudFront distribution with multiple origins
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: apiOrigin, // Default to API Gateway for dynamic routes
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: originRequestPolicy,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      },
      additionalBehaviors: {
        // Serve static assets from S3
        '/_next/static/*': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
        },
        '/_next/static': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
        },
        // Serve other static files from S3
        '/favicon.ico': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        '/icons/*': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        '/images/*': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      comment: 'CloudFront distribution for 3D Modal Frontend',
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.url!,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'StaticAssetsBucketName', {
      value: staticAssetsBucket.bucketName,
      description: 'S3 Bucket for Static Assets',
    });

    new cdk.CfnOutput(this, 'CacheBucketName', {
      value: cacheBucket.bucketName,
      description: 'S3 Bucket for Cache',
    });
  }
}

