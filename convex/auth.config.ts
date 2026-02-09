import { AuthConfig } from "convex/server";
// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });
// import "dotenv/config"



export default {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: "https://fond-shad-60.clerk.accounts.dev/",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;