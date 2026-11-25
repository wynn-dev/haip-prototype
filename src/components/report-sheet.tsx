"use client";

import { useState, useTransition } from "react";
import { Ban, Flag } from "lucide-react";
import { toast } from "sonner";
import { blockUser, reportUser } from "@/app/actions/safety";
import { CheckList, Row, Section } from "@/components/ios";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { REPORT_REASONS } from "@/lib/options";

/** Report + block in one place, two taps from any card or chat. */
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
  const [reason, setReason] = useState<string>();
  const [details, setDetails] = useState("");
  const [pending, start] = useTransition();

  const close = () => {
    onOpenChange(false);
    setTimeout(() => { setMode("menu"); setReason(undefined); setDetails(""); }, 300);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DrawerContent className="mx-auto max-h-[90dvh] max-w-[430px] bg-bg">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-[17px] font-semibold">{mode === "menu" ? name : `Report ${name}`}</DrawerTitle>
          <DrawerDescription className="text-[13px]">
            {mode === "menu" ? "They won't know it was you." : "A person on our team reviews every report. Reporting also blocks them; your chat is kept so we can read it."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-5 overflow-y-auto pb-8">
          {mode === "menu" ? (
            <Section>
              <Row icon={Flag} iconBg="bg-danger-fill" label="Report" chevron onClick={() => setMode("report")} />
              <Row
                icon={Ban}
                iconBg="bg-tile"
                label="Block"
                onClick={() =>
                  start(async () => {
                    await blockUser(targetId);
                    toast(`${name} is blocked`, { description: "You won't see each other again." });
                    close();
                    onDone?.();
                  })
                }
              />
            </Section>
          ) : (
            <>
              <div className="px-4">
                <CheckList options={REPORT_REASONS} value={reason} onChange={setReason} />
              </div>
              <Section>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="What happened? (optional)"
                  className="block w-full resize-none bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-label-3"
                />
              </Section>
              <div className="px-4">
                <Button
                  variant="filled"
                  size="xl"
                  className="w-full bg-danger-fill text-white"
                  disabled={!reason || pending}
                  onClick={() =>
                    start(async () => {
                      const r = await reportUser({ targetId, reason: reason as "other", details });
                      if (r.error) return void toast.error(r.error);
                      toast.success("Report sent", { description: "Thanks. We'll take a look." });
                      close();
                      onDone?.();
                    })
                  }
                >
                  Send report
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
