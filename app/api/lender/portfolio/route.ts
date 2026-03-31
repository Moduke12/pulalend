import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get("userId");

    if (!userIdRaw) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const lenderId = Number(userIdRaw);
    if (!Number.isFinite(lenderId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
          inv.id,
          inv.loan_id AS loanId,
          inv.amount,
          inv.expected_return AS expectedReturn,
          inv.actual_return AS actualReturn,
          inv.status,
          inv.invested_at AS investedAt,
          lr.status AS loanStatus,
          lr.interest_rate AS interestRate,
          lr.duration_months AS durationMonths
       FROM investments inv
       INNER JOIN loan_requests lr ON lr.id = inv.loan_id
       WHERE inv.lender_id = ?
       ORDER BY inv.invested_at DESC`,
      [lenderId]
    );

    return NextResponse.json({
      investments: rows.map((r) => ({
        id: r.id,
        loanId: r.loanId,
        amount: Number(r.amount),
        expectedReturn: Number(r.expectedReturn),
        actualReturn: Number(r.actualReturn),
        status: r.status,
        investedAt: r.investedAt,
        loanStatus: r.loanStatus,
        interestRate: Number(r.interestRate),
        durationMonths: Number(r.durationMonths),
      })),
    });
  } catch (error) {
    console.error("Lender portfolio error:", error);
    return NextResponse.json({ error: "Failed to load portfolio" }, { status: 500 });
  }
}
