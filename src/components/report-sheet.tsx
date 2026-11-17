"use client";

import { useState, useTransition } from "react";
import { Ban, Flag } from "lucide-react";
import { toast } from "sonner";
import { blockUser, reportUser } from "@/app/actions/safety";
import { Pills } from "@/components/pills";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASONS } from "@/lib/options";

/** Report + block in one place: two taps from any card or chat. */
export function SafetyDrawer({
  open,
  onOpenChange,
  targetId,
  name,
  onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  targetId: string;
  name: string;
  onDone?: () => void;
}) {
  const [mode, setMode] = useState<"menu" | "report">("menu");
  const [reason, setReason] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [pending, start] = useTransition();

  const close = () => {
    onOpenChange(false);
    setTimeout(() => { setMode("menu"); setReason([]); setDetails(""); }, 300);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DrawerContent className="mx-auto max-w-[440px] border-2 border-ink bg-paper">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-display text-2xl font-extrabold">
            {mode === "menu" ? `Something off with ${name}?` : `Report ${name}`}
          </DrawerTitle>
          <DrawerDescription>
            {mode === "menu"
              ? "They won't be told it was you."
              : "A human on our team reviews every report. Reporting also blocks them."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4 pb-6">
          {mode === "menu" ? (
            <>
              <Button variant="paper" size="xl" className="justify-start" onClick={() => setMode("report")}>
                <Flag className="size-5 text-brick" /> Report
              </Button>
              <Button
                variant="paper"
                size="xl"
                className="justify-start"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await blockUser(targetId);
                    toast(`${name} is blocked. You won't see each other again.`);
                    close();
                    onDone?.();
                  })
                }
              >
                <Ban className="size-5" /> Block only
              </Button>
            </>
          ) : (
            <>
              <Pills tone="brick" options={REPORT_REASONS} value={reason} onChange={(v) => setReason(v.slice(-1))} />
              <Textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} placeholder="What happened? (optional)" />
              <Button
                variant="ink"
                size="xl"
                disabled={!reason.length || pending}
                onClick={() =>
                  start(async () => {
                    const r = await reportUser({ targetId, reason: reason[0] as "other", details });
                    if (r.error) return void toast.error(r.error);
                    toast.success("Thanks. Report sent to our team.");
                    close();
                    onDone?.();
                  })
                }
              >
                Send report
              </Button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
