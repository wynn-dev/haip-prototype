import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "rm_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-secret-change-me-dev-only-secret",
);

/** `v` must equal users.session_version, so bumping it revokes every outstanding token. */
export type Session = { uid: string; stage: "2fa" | "full"; v: number };

export async function setSession(s: Session) {
  const token = await new SignJWT(s)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(s.stage === "2fa" ? "15m" : "30d")
    .sign(secret);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: s.stage === "2fa" ? 15 * 60 : 30 * 24 * 3600,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { uid: payload.uid as string, stage: payload.stage as Session["stage"], v: Number(payload.v ?? -1) };
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
