import { AuthConfig } from "convex/server";
// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });
// import "dotenv/config"



export default {
  providers: [
    {
      // Uses CLERK_JWT_ISSUER_DOMAIN env var set in Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;