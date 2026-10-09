import { NextResponse } from "next/server";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import { getSessionUser } from "@/lib/firebase/session.ts";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getClientChecklist(sessionUser.uid));
}
