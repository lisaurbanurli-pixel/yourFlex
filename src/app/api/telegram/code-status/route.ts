import { NextResponse } from "next/server";
import { z } from "zod";
import { getPendingCode } from "@/lib/pending-codes";

const querySchema = z.object({
  codeId: z.string(),
});

/**
 * Check the approval status of a pending code
 * Client polls this endpoint to see if an admin has approved/declined
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const codeId = url.searchParams.get("codeId");

  if (!codeId) {
    return NextResponse.json(
      { ok: false, error: "missing_codeId" },
      { status: 400 },
    );
  }

  const pendingCode = getPendingCode(codeId);

  if (!pendingCode) {
    return NextResponse.json(
      { ok: false, error: "code_not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    status: pendingCode.status,
    code: pendingCode.code,
    expiresAt: pendingCode.expiresAt,
    approvedBy: pendingCode.approvedBy,
    approvedAt: pendingCode.approvedAt,
    declinedBy: pendingCode.declinedBy,
    declinedAt: pendingCode.declinedAt,
  });
}
