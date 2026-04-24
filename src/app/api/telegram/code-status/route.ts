import { NextResponse } from "next/server";
import { getPendingCode } from "@/lib/pending-codes";

/**
 * Check the approval status of a pending code
 * Client polls this endpoint to see if an admin has approved/declined
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const codeId = url.searchParams.get("codeId");

    if (!codeId) {
      return NextResponse.json(
        { ok: false, error: "missing_codeId" },
        { status: 400 },
      );
    }

    let pendingCode;
    try {
      pendingCode = await getPendingCode(codeId);
    } catch (kvError) {
      console.error(
        `[CODE-STATUS ERROR] KV retrieval failed for ${codeId}:`,
        kvError,
      );
      return NextResponse.json(
        { ok: false, error: "storage_error", details: String(kvError) },
        { status: 503 },
      );
    }

    if (!pendingCode) {
      return NextResponse.json(
        { ok: false, error: "code_not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        status: pendingCode.status,
        code: pendingCode.code,
        expiresAt: pendingCode.expiresAt,
        approvedBy: pendingCode.approvedBy,
        approvedAt: pendingCode.approvedAt,
        declinedBy: pendingCode.declinedBy,
        declinedAt: pendingCode.declinedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[CODE-STATUS UNHANDLED ERROR]:", errorMsg);
    return NextResponse.json(
      { ok: false, error: "internal_server_error", details: errorMsg },
      { status: 500 },
    );
  }
}
