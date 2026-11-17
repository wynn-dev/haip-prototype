import { notFound } from "next/navigation";
import { and, asc, eq, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { loadRow, toCard, toPerson } from "@/lib/deck";
import { Chat } from "./chat";

export default async function ChatPage({ params }: PageProps<"/app/chat/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const [m] = await db
    .select()
    .from(schema.matches)
    .where(and(eq(schema.matches.id, id), or(eq(schema.matches.userA, user.id), eq(schema.matches.userB, user.id))));
  if (!m) notFound();
  const otherId = m.userA === user.id ? m.userB : m.userA;
  const [meRow, otherRow, msgs] = await Promise.all([
    loadRow(user.id),
    loadRow(otherId),
    db.select().from(schema.messages).where(eq(schema.messages.matchId, id)).orderBy(asc(schema.messages.id)),
  ]);
  if (!otherRow || otherRow.user.status !== "active") notFound();
  // matched: the exact address is now revealed
  const card = toCard(otherRow, meRow ? toPerson(meRow) : null, true);
  return <Chat matchId={id} meId={user.id} other={card} kind={m.kind} initial={msgs} />;
}
