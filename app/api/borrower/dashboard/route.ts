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

    const userId = Number(userIdRaw);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Ensure user is a borrower
    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, user_type FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userRows[0].user_type !== "borrower") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Stats
    const [activeLoanRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM loan_requests WHERE borrower_id = ? AND status IN ('pending','approved','funded','active')",
      [userId]
    );

    const [totalBorrowedRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM loan_requests WHERE borrower_id = ? AND status IN ('funded','active','completed')",
      [userId]
    );

    const [nextPaymentRows] = await pool.execute<RowDataPacket[]>(
      `SELECT rs.total_amount AS next_payment
       FROM repayment_schedules rs
       INNER JOIN loan_requests lr ON lr.id = rs.loan_id
       WHERE lr.borrower_id = ? AND rs.status IN ('pending','partial')
       ORDER BY rs.due_date ASC
       LIMIT 1`,
      [userId]
    );

    const [creditScoreRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COALESCE(credit_score, 650) AS credit_score FROM borrower_profiles WHERE user_id = ? LIMIT 1",
      [userId]
    );

    // Recent loans
    const [recentLoanRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, amount, status, requested_at AS requestedAt
       FROM loan_requests
       WHERE borrower_id = ?
       ORDER BY requested_at DESC
       LIMIT 5`,
      [userId]
    );

    return NextResponse.json({
      stats: {
        activeLoans: Number(activeLoanRows?.[0]?.count ?? 0),
        totalBorrowed: Number(totalBorrowedRows?.[0]?.total ?? 0),
        nextPayment: Number(nextPaymentRows?.[0]?.next_payment ?? 0),
        creditScore: Number(creditScoreRows?.[0]?.credit_score ?? 650),
      },
      recentLoans: recentLoanRows.map((l) => ({
        id: l.id,
        amount: Number(l.amount),
        status: l.status,
        requestedAt: l.requestedAt,
      })),
    });
  } catch (error) {
    console.error("Borrower dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
