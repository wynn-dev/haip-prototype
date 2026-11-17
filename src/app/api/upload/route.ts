import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/session";
import { presignUpload, r2Configured } from "@/lib/r2";

const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

/** Returns a presigned R2 PUT url, or tells the client to use the local dev fallback. */
export async function POST(req: Request) {
  const s = await getSession();
  if (!s || s.stage !== "full") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { contentType, kind } = (await req.json()) as { contentType: string; kind: "avatar" | "listing" };
  const ext = ALLOWED[contentType as keyof typeof ALLOWED];
  if (!ext) return NextResponse.json({ error: "Only JPG, PNG or WebP" }, { status: 400 });
  if (!r2Configured) return NextResponse.json({ mode: "local" });
  const key = `${kind === "listing" ? "listings" : "avatars"}/${s.uid}/${randomUUID()}.${ext}`;
  return NextResponse.json({ mode: "r2", ...(await presignUpload(key, contentType)) });
}
