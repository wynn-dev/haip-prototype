"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function DeleteAccount() {
  const [v, setV] = useState("");
  const [err, setErr] = useState<string>();
  const [pending, start] = useTransition();
  return (
    <Dialog>
      <DialogTrigger render={<button className="py-2 text-sm font-semibold text-brick underline underline-offset-4" />}>
        Delete my account
      </DialogTrigger>
      <DialogContent className="border-2 border-ink bg-paper">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold">Doei for good?</DialogTitle>
          <DialogDescription>
            This permanently deletes your profile, photos, swipes, matches and messages. It can&apos;t be undone.
            Want a copy first? <a href="/api/me/export" download className="font-semibold underline">Export your data</a>.
          </DialogDescription>
        </DialogHeader>
        <Input value={v} onChange={(e) => setV(e.target.value)} placeholder='Type "DELETE"' />
        {err && <p className="text-sm text-brick">{err}</p>}
        <Button
          variant="destructive"
          size="xl"
          className="border-2 border-brick"
          disabled={pending}
          onClick={() => start(async () => { const r = await deleteAccount(v); if (r?.error) setErr(r.error); })}
        >
          Delete everything
        </Button>
      </DialogContent>
    </Dialog>
  );
}
