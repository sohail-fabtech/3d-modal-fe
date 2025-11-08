/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "three-d-modal-fe",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const sst = await import("sst");
    
    return {
      site: new sst.aws.NextjsSite("Site", {
        path: ".", // project root
        // Add environment variables here
        // environment: {
        //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
        //   DATABASE_URL: process.env.DATABASE_URL || "",
        // },
      }),
    };
  },
});
