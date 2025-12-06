import { NextResponse } from "next/server";

export async function POST() {
  // In a real app, handle FormData and upload to S3/Cloudinary
  // const formData = await request.formData();
  
  // Mock response
  return NextResponse.json({
    ok: true,
    data: {
      url: "https://example.com/mock-file.pdf",
      filename: "mock-file.pdf",
    },
  });
}
