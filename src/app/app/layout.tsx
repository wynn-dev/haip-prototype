import { requireUser } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import { TabBar } from "./tab-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const convos = await getConversations(user.id);
  return (
    <div className="flex h-dvh flex-col sm:h-full">
      <div id="scroller" className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain scrollbar-none">
        {children}
      </div>
      <TabBar unread={convos.filter((c) => c.needsReply).length} />
    </div>
  );
}
