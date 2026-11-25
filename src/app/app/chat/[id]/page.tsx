import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { openMatchFor } from "@/lib/chat";
import { loadRow, toCard, toPerson } from "@/lib/deck";
import { Chat } from "./chat";

export default async function ChatPage({ params }: PageProps<"/app/chat/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const m = await openMatchFor(user.id, id);
  if (!m) notFound();
  const [meRow, otherRow, msgs] = await Promise.all([
    loadRow(user.id),
    loadRow(m.otherId),
    db
      .select({ id: schema.messages.id, senderId: schema.messages.senderId, body: schema.messages.body, createdAt: schema.messages.createdAt })
      .from(schema.messages)
      .where(eq(schema.messages.matchId, m.id))
      .orderBy(asc(schema.messages.id)),
  ]);
  if (!otherRow) notFound();
  // matched: the exact address is now revealed
  const card = toCard(otherRow, meRow ? toPerson(meRow) : null, true);
  return <Chat matchId={m.id} meId={user.id} myRole={user.role ?? "tenant"} other={card} kind={m.kind} initial={msgs} />;
}
