"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function DeleteAccount() {
  const [v, setV] = useState("");
  const [err, setErr] = useState<string>();
  const [pending, start] = useTransition();
  return (
    <Dialog>
      <DialogTrigger render={<button className="flex min-h-11 w-full items-center px-4 text-danger active:bg-fill" />}>
        Delete account
      </DialogTrigger>
      <DialogContent className="max-w-[300px] gap-3 rounded-[14px] border-0 bg-surface/95 p-5 text-center backdrop-blur-xl" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-[17px] font-semibold">Delete your account?</DialogTitle>
          <DialogDescription className="text-[13px] leading-snug">
            Your profile, photos, swipes, matches and messages will be permanently deleted. You can{" "}
            <a href="/api/me/export" download className="text-tint">export your data</a> first.
          </DialogDescription>
        </DialogHeader>
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="Type DELETE"
          className="h-9 rounded-[8px] border-[0.5px] border-separator bg-bg px-2.5 text-[15px] outline-none"
        />
        {err && <p className="text-[13px] text-danger">{err}</p>}
        <Button variant="danger" size="xl" className="h-11 text-[17px]" disabled={pending || v.trim().toUpperCase() !== "DELETE"} onClick={() => start(async () => { const r = await deleteAccount(v); if (r?.error) setErr(r.error); })}>
          Delete everything
        </Button>
      </DialogContent>
    </Dialog>
  );
}
