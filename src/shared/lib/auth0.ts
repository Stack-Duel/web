import { env } from "@/env";
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  domain: env.AUTH0_DOMAIN,
  clientId: env.AUTH0_CLIENT_ID,
  secret: env.AUTH0_SECRET,
  clientSecret: env.AUTH0_CLIENT_SECRET,
  noContentProfileResponseWhenUnauthenticated: true,
  authorizationParameters: {
    redirect_uri: env.AUTH0_CALLBACK_URL,
    audience: env.AUTH0_AUDIENCE,
    scope: "openid profile email offline_access",
  },
});
