import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const minioUrl = process.env.MINIO_URL;
const minioBucket = process.env.MINIO_BUCKET;
const minioUser = process.env.MINIO_USER;
const minioPass = process.env.MINIO_PASS;

if (!minioUrl || !minioBucket || !minioUser || !minioPass) {
  // Keep module import safe; route handler will return a descriptive error.
  console.warn("MinIO environment variables are missing.");
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildObjectKey(filename: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const safe = sanitizeFilename(filename);
  const id = crypto.randomUUID();

  return `uploads/${yyyy}/${mm}/${dd}/${id}-${safe}`;
}

function getPublicUrl(objectKey: string): string {
  const base = (minioUrl || "").replace(/\/+$/, "");
  return `${base}/${minioBucket}/${objectKey}`;
}

export async function uploadToMinio(file: File): Promise<{
  url: string;
  filename: string;
  key: string;
}> {
  if (!minioUrl || !minioBucket || !minioUser || !minioPass) {
    throw new Error(
      "Storage is not configured. Set MINIO_URL, MINIO_BUCKET, MINIO_USER and MINIO_PASS."
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const key = buildObjectKey(file.name);

  const client = new S3Client({
    endpoint: minioUrl,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: minioUser,
      secretAccessKey: minioPass,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: minioBucket,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return {
    url: getPublicUrl(key),
    filename: file.name,
    key,
  };
}
