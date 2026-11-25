import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { activeUser } from "@/lib/auth";
import { presignUpload, r2Configured } from "@/lib/r2";

const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

/** Returns a short-lived signed R2 upload URL, or tells the client to use the local dev fallback. */
export async function POST(req: Request) {
  const user = await activeUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: { contentType?: unknown; kind?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const ext = ALLOWED[String(body.contentType) as keyof typeof ALLOWED];
  if (!ext) return NextResponse.json({ error: "Only JPG, PNG or WebP" }, { status: 400 });
  if (!r2Configured) return NextResponse.json({ mode: "local" });
  const key = `${body.kind === "listing" ? "listings" : "avatars"}/${user.id}/${randomUUID()}.${ext}`;
  return NextResponse.json({ mode: "r2", ...(await presignUpload(key, String(body.contentType))) });
}
