import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "auto",
  // Leave undefined for standard AWS; set for R2 or other S3-compatible endpoints
  ...(process.env.AWS_ENDPOINT_URL_S3
    ? { endpoint: process.env.AWS_ENDPOINT_URL_S3 }
    : {}),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Required for Cloudflare R2 and other path-style endpoints
  forcePathStyle: false,
});

const bucket = process.env.S3_BUCKET_NAME!;

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteFromS3(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

/**
 * Returns a presigned URL valid for 1 hour.
 * The download route redirects to this URL — no proxying needed.
 */
export async function getPresignedDownloadUrl(
  key: string,
  filename: string,
  expiresIn = 3600,
) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Returns a presigned URL valid for 1 hour for inline viewing in the browser.
 */
export async function getPresignedViewUrl(
  key: string,
  expiresIn = 3600,
) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: "inline",
  });
  return getSignedUrl(s3, command, { expiresIn });
}
