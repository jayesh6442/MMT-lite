import { env } from "../config/env";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "@repo/database";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.BACKEND_URL}/auth/google/callback`,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: {
        emails?: Array<{ value?: string }>;
        displayName: string;
      },
      done: (
        error: Error | null,
        user?: { id: string; email: string; name: string | null } | null,
      ) => void,
    ) => {
      try {
        // HARD RULE: never trust provider blindly
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email from Google"), null);
        }

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            name: profile.displayName,
            emailVerified: new Date(),
          },
          create: {
            email,
            name: profile.displayName,
            emailVerified: new Date(),
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        return done(null, {
          id: user.id,
          email,
          name: user.name,
        });
      } catch (error) {
        return done(error as Error, null);
      }
    },
  ),
);
