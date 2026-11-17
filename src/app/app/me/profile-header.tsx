"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PersonAvatar } from "@/components/person-avatar";
import { ProfileCard } from "@/components/profile-card";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import type { CardData } from "@/lib/deck";

export function ProfileHeader({ card }: { card: CardData }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="px-4">
        <div className="group-list">
          <button onClick={() => setOpen(true)} className="flex w-full items-center gap-4 px-4 py-3 text-left active:bg-fill">
            <PersonAvatar name={card.username} src={card.photoUrl} className="size-[60px] text-2xl" />
            <span className="min-w-0 flex-1">
              <span className="block text-[22px] leading-tight font-semibold tracking-[-0.02em]">{card.username}</span>
              <span className="block text-[15px] text-label-2">Preview your profile</span>
            </span>
            <ChevronRight className="size-[18px] text-label-3" strokeWidth={2.5} />
          </button>
          <Link href="/app/me/edit" className="flex min-h-11 items-center px-4 text-tint active:bg-fill">Edit profile & preferences</Link>
        </div>
      </section>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="mx-auto h-[94dvh] max-w-[430px] bg-bg">
          <DrawerTitle className="py-2 text-center text-[13px] font-normal text-label-2">How others see you</DrawerTitle>
          <div className="overflow-y-auto px-3 pb-8">
            <ProfileCard c={card} showScore={false} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
