"use client";

/** Upload an image to R2 (presigned PUT) or to the local dev fallback. */
export async function uploadImage(file: File, kind: "avatar" | "listing"): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentType: file.type, kind }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  if (data.mode === "r2") {
    const put = await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "content-type": file.type } });
    if (!put.ok) throw new Error("Upload to storage failed");
    return data.publicUrl;
  }
  const fd = new FormData();
  fd.set("file", file);
  const local = await fetch("/api/upload/local", { method: "POST", body: fd });
  const ld = await local.json();
  if (!local.ok) throw new Error(ld.error ?? "Upload failed");
  return ld.publicUrl;
}
