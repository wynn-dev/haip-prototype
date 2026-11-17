"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload-client";
import { PersonAvatar } from "@/components/person-avatar";

export function AvatarPicker({ name, value, onChange }: { name: string; value: string | null; onChange: (url: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => ref.current?.click()} className="relative" aria-label="Upload profile photo">
        <PersonAvatar name={name || "?"} src={value} className="size-24 text-3xl" />
        <span className="absolute -right-1 -bottom-1 grid size-9 place-items-center rounded-full border-2 border-ink bg-oranje">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        </span>
      </button>
      <p className="text-xs text-muted-foreground">
        A clear photo of your face gets way more matches. Stored on our image storage. You can delete it anytime.
      </p>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            onChange(await uploadImage(f, "avatar"));
          } catch (err) {
            toast.error((err as Error).message);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

export function ListingPhotos({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {value.map((src) => (
        <div key={src} className="relative size-24 shrink-0 overflow-hidden rounded-xl border-2 border-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="size-full object-cover" />
          <button type="button" onClick={() => onChange(value.filter((v) => v !== src))} className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-ink text-paper" aria-label="Remove photo">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      {value.length < 6 && (
        <button type="button" onClick={() => ref.current?.click()} className="grid size-24 shrink-0 place-items-center rounded-xl border-2 border-dashed border-ink/50 bg-card text-xs font-semibold">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <span className="flex flex-col items-center gap-1"><Camera className="size-5" />Add photo</span>}
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []).slice(0, 6 - value.length);
          setBusy(true);
          try {
            const urls: string[] = [];
            for (const f of files) urls.push(await uploadImage(f, "listing"));
            onChange([...value, ...urls]);
          } catch (err) {
            toast.error((err as Error).message);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
