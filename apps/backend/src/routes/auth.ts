import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "@repo/database";

const router = Router();
type OAuthUser = {
  id: string;
  email: string;
  name: string | null;
};

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/?error=oauth_failed`,
  }),
  (req, res) => {
    const user = req.user as OAuthUser | undefined;
    if (!user) {
      return res.status(401).json({ error: "No authenticated user" });
    }
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
      },
      env.JWT_SECRET,
      {
        expiresIn: "15m",
        issuer: "api",
        subject: user.id,
      },
    );
    res.redirect(
      `${env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`,
    );
  },
);

router.get("/me", async (req, res) => {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: "api",
    }) as jwt.JwtPayload;

    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token subject" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    return res.json({ user });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.get("/failure", (_, res) => {
  res.status(401).json({ error: "OAuth failed" });
});

export default router;
