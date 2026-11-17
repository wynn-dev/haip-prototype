import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/session";
import { r2Configured } from "@/lib/r2";

/** Dev-only fallback when R2 env vars are missing: writes into public/uploads. */
export async function POST(req: Request) {
  if (r2Configured || process.env.VERCEL)
    return NextResponse.json({ error: "Local uploads disabled" }, { status: 400 });
  const s = await getSession();
  if (!s || s.stage !== "full") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size > 8 * 1024 * 1024)
    return NextResponse.json({ error: "Bad file" }, { status: 400 });
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  if (!ext) return NextResponse.json({ error: "Only JPG, PNG or WebP" }, { status: 400 });
  const dir = path.join(process.cwd(), "public", "uploads", s.uid);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ publicUrl: `/uploads/${s.uid}/${name}` });
}
