// OpenNext configuration
const config = {
  default: {
    override: {
      wrapper: 'aws-lambda-streaming',
      converter: 'aws-apigw-v2',
      incrementalCache: 's3-lite',
      tagCache: 'dummy',
      queue: 'sqs-lite',
    },
  },
  // Custom domain configuration (optional)
  // domain: {
  //   domainName: 'your-domain.com',
  //   certificateArn: 'arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID',
  // },
  // CloudFront configuration (optional)
  // cloudFront: {
  //   distributionId: 'your-distribution-id',
  // },
};

export default config;

