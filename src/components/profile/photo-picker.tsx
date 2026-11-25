"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PersonAvatar } from "@/components/person-avatar";
import { uploadImage } from "@/lib/upload-client";

function useUpload(kind: "avatar" | "listing") {
  const [busy, setBusy] = useState(false);
  const run = async (files: File[], onDone: (urls: string[]) => void) => {
    if (!files.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadImage(f, kind));
      onDone(urls);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

export function AvatarPicker({ name, value, onChange }: { name: string; value: string | null; onChange: (url: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const { busy, run } = useUpload("avatar");
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <button type="button" onClick={() => ref.current?.click()} className="relative" aria-label="Choose profile photo">
        <PersonAvatar name={name || "?"} src={value} className="size-28 text-[3rem]" />
        {busy && <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40"><Loader2 className="size-6 animate-spin text-white" /></span>}
        {!value && !busy && (
          <span className="absolute right-0 bottom-0 grid size-9 place-items-center rounded-full border-[3px] border-bg bg-tint-fill text-white">
            <Camera className="size-4" />
          </span>
        )}
      </button>
      <button type="button" onClick={() => ref.current?.click()} className="text-[15px] text-tint">
        {value ? "Change photo" : "Add photo (optional)"}
      </button>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { void run(Array.from(e.target.files ?? []).slice(0, 1), ([u]) => onChange(u)); e.target.value = ""; }} />
    </div>
  );
}

export function ListingPhotos({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const { busy, run } = useUpload("listing");
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
      {value.map((src, i) => (
        <div key={src} className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-[10px] bg-fill">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="size-full object-cover" />
          {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">Cover</span>}
          <button type="button" onClick={() => onChange(value.filter((v) => v !== src))} className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-black/55 text-white backdrop-blur" aria-label="Remove photo">
            <X className="size-3.5" strokeWidth={3} />
          </button>
        </div>
      ))}
      {value.length < 6 && (
        <button type="button" aria-label="Add photo" onClick={() => ref.current?.click()} className="grid aspect-[3/4] w-28 shrink-0 place-items-center rounded-[10px] bg-fill text-label-2">
          {busy ? <Loader2 className="size-6 animate-spin" /> : <Plus className="size-7" strokeWidth={1.75} />}
        </button>
      )}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { void run(Array.from(e.target.files ?? []).slice(0, 6 - value.length), (urls) => onChange([...value, ...urls])); e.target.value = ""; }} />
    </div>
  );
}
