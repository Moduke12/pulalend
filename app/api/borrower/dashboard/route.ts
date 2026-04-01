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

    // Recent loans
    const [recentLoanRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, amount, status, requested_at AS requestedAt
       FROM loan_requests
       WHERE borrower_id = ?
       ORDER BY requested_at DESC
       LIMIT 5`,
      [userId]
    );

    // Upcoming repayments
    const [upcomingRepaymentsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT rs.id, rs.loan_id, rs.due_date, rs.total_amount, rs.status, lr.loan_number
       FROM repayment_schedules rs
       INNER JOIN loan_requests lr ON lr.id = rs.loan_id
       WHERE lr.borrower_id = ? AND rs.status IN ('pending','partial')
       ORDER BY rs.due_date ASC
       LIMIT 5`,
      [userId]
    );

    // KYC status
    const [kycStatusRows] = await pool.execute<RowDataPacket[]>(
      `SELECT status, submitted_at, reviewed_at, rejection_reason
       FROM kyc_requests
       WHERE user_id = ?
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [userId]
    );

    // Recent notifications
    const [notificationsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, message, type, read_status, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    return NextResponse.json({
      stats: {
        activeLoans: Number(activeLoanRows?.[0]?.count ?? 0),
        totalBorrowed: Number(totalBorrowedRows?.[0]?.total ?? 0),
        nextPayment: Number(nextPaymentRows?.[0]?.next_payment ?? 0),
      },
      recentLoans: recentLoanRows.map((l) => ({
        id: l.id,
        amount: Number(l.amount),
        status: l.status,
        requestedAt: l.requestedAt,
      })),
      upcomingRepayments: upcomingRepaymentsRows.map((r) => ({
        id: r.id,
        loanId: r.loan_id,
        loanNumber: r.loan_number,
        dueDate: r.due_date,
        amount: Number(r.total_amount),
        status: r.status,
      })),
      kycStatus: kycStatusRows.length > 0 ? {
        status: kycStatusRows[0].status,
        submittedAt: kycStatusRows[0].submitted_at,
        reviewedAt: kycStatusRows[0].reviewed_at,
        rejectionReason: kycStatusRows[0].rejection_reason,
      } : null,
      notifications: notificationsRows.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: Boolean(n.read_status),
        createdAt: n.created_at,
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
