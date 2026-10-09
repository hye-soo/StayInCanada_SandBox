import { NextResponse } from "next/server";
import { getCurrentClientChecklist } from "@/lib/get-current-client-checklist.ts";

export function GET() {
  return NextResponse.json(getCurrentClientChecklist());
}
