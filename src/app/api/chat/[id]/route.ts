import { NextResponse } from "next/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import { activeUser } from "@/lib/auth";
import { openMatchFor } from "@/lib/chat";

/** Poll for new messages: GET /api/chat/:matchId?after=<lastId> */
export async function GET(req: Request, ctx: RouteContext<"/api/chat/[id]">) {
  const user = await activeUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const raw = new URL(req.url).searchParams.get("after") ?? "0";
  const after = Number(raw);
  if (!/^\d{1,12}$/.test(raw) || !Number.isSafeInteger(after)) return NextResponse.json({ error: "bad cursor" }, { status: 400 });
  const m = await openMatchFor(user.id, id);
  if (!m) return NextResponse.json({ gone: true }, { status: 404 });
  const msgs = await db
    .select({ id: schema.messages.id, senderId: schema.messages.senderId, body: schema.messages.body, createdAt: schema.messages.createdAt })
    .from(schema.messages)
    .where(and(eq(schema.messages.matchId, m.id), gt(schema.messages.id, after)))
    .orderBy(asc(schema.messages.id))
    .limit(200);
  return NextResponse.json({ messages: msgs });
}
