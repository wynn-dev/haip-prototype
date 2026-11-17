import "server-only";
import { createHmac } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_URL,
  R2_UPLOAD_WORKER_URL,
  R2_UPLOAD_SECRET,
} = process.env;

/**
 * Two ways to put files in R2, both handing the browser a short-lived PUT URL:
 *  - S3 presigned URL (needs R2 S3 API keys)
 *  - our signed-upload Worker (workers/r2-upload, bound to the bucket; needs a shared secret)
 */
const s3 =
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
      })
    : null;
const worker = R2_UPLOAD_WORKER_URL && R2_UPLOAD_SECRET ? R2_UPLOAD_WORKER_URL.replace(/\/$/, "") : null;

export const r2Configured = Boolean(R2_PUBLIC_URL && R2_BUCKET && (s3 || worker));

export async function presignUpload(key: string, contentType: string) {
  const publicUrl = `${R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
  if (s3) {
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 300 },
    );
    return { uploadUrl, publicUrl };
  }
  if (worker) {
    const exp = Math.floor(Date.now() / 1000) + 300;
    const sig = createHmac("sha256", R2_UPLOAD_SECRET!).update(`${key}:${exp}:${contentType}`).digest("hex");
    const qs = new URLSearchParams({ exp: String(exp), ct: contentType, sig });
    return { uploadUrl: `${worker}/${key}?${qs}`, publicUrl };
  }
  throw new Error("R2 not configured");
}
