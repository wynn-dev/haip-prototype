import { requireUser } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import { TabBar } from "./tab-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const convos = await getConversations(user.id);
  return (
    <div className="flex min-h-dvh flex-1 flex-col sm:min-h-0">
      <div className="flex flex-1 flex-col">{children}</div>
      <TabBar unread={convos.filter((c) => c.needsReply).length} />
    </div>
  );
}
