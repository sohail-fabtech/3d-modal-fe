#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NextjsStack } from './nextjs-stack';

const app = new cdk.App();

new NextjsStack(app, 'ThreeDModalFeStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: '3D Modal Frontend - Next.js Serverless Stack',
});

