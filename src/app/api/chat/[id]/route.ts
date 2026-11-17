import { NextResponse } from "next/server";
import { and, asc, eq, gt, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";

/** Poll for new messages: GET /api/chat/:matchId?after=<lastId> */
export async function GET(req: Request, ctx: RouteContext<"/api/chat/[id]">) {
  const s = await getSession();
  if (!s || s.stage !== "full") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const after = Number(new URL(req.url).searchParams.get("after") ?? 0);
  const [m] = await db
    .select({ id: schema.matches.id })
    .from(schema.matches)
    .where(and(eq(schema.matches.id, id), or(eq(schema.matches.userA, s.uid), eq(schema.matches.userB, s.uid))));
  if (!m) return NextResponse.json({ gone: true }, { status: 404 });
  const msgs = await db
    .select()
    .from(schema.messages)
    .where(and(eq(schema.messages.matchId, id), gt(schema.messages.id, after)))
    .orderBy(asc(schema.messages.id));
  return NextResponse.json({ messages: msgs });
}
