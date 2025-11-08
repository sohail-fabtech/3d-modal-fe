import { SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";

export default {
  config() {
    return {
      name: "nextjs-lambda-app",
      region: "us-east-1", // or your preferred AWS region
    };
  },
  stacks(app) {
    app.stack(function SiteStack({ stack }) {
      new NextjsSite(stack, "NextApp", {
        path: ".", // path to your Next.js app
      });
    });
  },
} satisfies SSTConfig;
