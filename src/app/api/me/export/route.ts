import { NextResponse } from "next/server";
import { eq, inArray, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";

/** GDPR art. 15/20: everything we hold about you, as JSON. */
export async function GET() {
  const s = await getSession();
  if (!s || s.stage !== "full") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = s.uid;
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { passwordHash: _omit, ...account } = user;

  const matches = await db
    .select()
    .from(schema.matches)
    .where(or(eq(schema.matches.userA, id), eq(schema.matches.userB, id)));
  const matchIds = matches.map((m) => m.id);

  const [profile, listing, swipes, messages, blocks, reportsFiled, appeals, contact] = await Promise.all([
    db.select().from(schema.profiles).where(eq(schema.profiles.userId, id)),
    db.select().from(schema.listings).where(eq(schema.listings.userId, id)),
    db.select().from(schema.swipes).where(eq(schema.swipes.swiperId, id)),
    matchIds.length ? db.select().from(schema.messages).where(inArray(schema.messages.matchId, matchIds)) : [],
    db.select().from(schema.blocks).where(eq(schema.blocks.blockerId, id)),
    db.select().from(schema.reports).where(eq(schema.reports.reporterId, id)),
    db.select().from(schema.appeals).where(eq(schema.appeals.userId, id)),
    db.select().from(schema.contactRequests).where(eq(schema.contactRequests.userId, id)),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    note: "Messages include both sides of your conversations. Other people's private details are not included.",
    account,
    profile: profile[0] ?? null,
    listing: listing[0] ?? null,
    swipes,
    matches,
    messages,
    blocks,
    reportsFiled,
    appeals,
    contactRequests: contact,
  };
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="my-data-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
