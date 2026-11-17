import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { emptyProfile, type ProfileInput } from "@/lib/profile-schema";
import type { User } from "@/db/schema";

/** The current user's profile as an editable draft. */
export async function loadDraft(user: User): Promise<ProfileInput> {
  const [p] = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, user.id));
  const [l] = await db.select().from(schema.listings).where(eq(schema.listings.userId, user.id));
  if (!p) return { ...emptyProfile, role: user.role ?? emptyProfile.role };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId, updatedAt, ...rest } = p;
  return {
    ...rest,
    role: user.role!,
    listing: l ? (({ userId: _u, ...x }) => x)(l) : null,
  } as ProfileInput;
}
