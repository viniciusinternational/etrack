import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
}

export async function PUT() {
  return NextResponse.json({ ok: true, message: "Dashboard update not supported" });
}

export async function DELETE() {
  return NextResponse.json({ ok: true, message: "Dashboard deletion not supported" });
}
