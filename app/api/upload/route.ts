import { NextResponse } from "next/server";
import { uploadToMinio } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const uploaded = await uploadToMinio(file);
    return NextResponse.json({
      ok: true,
      data: {
        url: uploaded.url,
        filename: uploaded.filename,
      },
      message: "Upload successful",
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload file to storage",
      },
      { status: 500 }
    );
  }
}
