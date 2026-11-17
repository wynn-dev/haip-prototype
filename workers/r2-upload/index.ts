/**
 * Minimal signed-upload endpoint for R2.
 * The Next.js app signs `PUT /<key>?exp=<unix>&ct=<type>&sig=<hmac>` with UPLOAD_SECRET;
 * this worker verifies it and writes the body to the bucket. No S3 keys needed.
 */
interface Env {
  BUCKET: R2Bucket;
  UPLOAD_SECRET: string;
}

const MAX_BYTES = 8 * 1024 * 1024;
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "PUT, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "3600",
};

async function hmac(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "PUT") return new Response("Method not allowed", { status: 405, headers: cors });

    const url = new URL(req.url);
    const key = decodeURIComponent(url.pathname.slice(1));
    const exp = Number(url.searchParams.get("exp"));
    const ct = url.searchParams.get("ct") ?? "";
    const sig = url.searchParams.get("sig") ?? "";
    if (!key || !/^(avatars|listings)\//.test(key)) return new Response("Bad key", { status: 400, headers: cors });
    if (!exp || exp < Date.now() / 1000) return new Response("Expired", { status: 403, headers: cors });
    if (!safeEqual(sig, await hmac(env.UPLOAD_SECRET, `${key}:${exp}:${ct}`)))
      return new Response("Bad signature", { status: 403, headers: cors });
    if (req.headers.get("content-type") !== ct) return new Response("Content-type mismatch", { status: 400, headers: cors });
    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) return new Response("Too large", { status: 413, headers: cors });

    await env.BUCKET.put(key, req.body, { httpMetadata: { contentType: ct, cacheControl: "public, max-age=31536000, immutable" } });
    return new Response(JSON.stringify({ ok: true, key }), { headers: { ...cors, "content-type": "application/json" } });
  },
};
