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

    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, user_type FROM users WHERE id = ?",
      [lenderId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userRows[0].user_type !== "lender") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [availableRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count
       FROM (
          SELECT lr.id, (lr.amount - COALESCE(SUM(inv.amount),0)) AS remaining
          FROM loan_requests lr
          LEFT JOIN investments inv ON inv.loan_id = lr.id
          WHERE lr.status = 'approved'
          GROUP BY lr.id
          HAVING remaining > 0
       ) t`
    );

    const [fundedRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT loan_id) AS count FROM investments WHERE lender_id = ?",
      [lenderId]
    );

    const [expectedRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COALESCE(SUM(expected_return),0) AS expectedReturn FROM investments WHERE lender_id = ?",
      [lenderId]
    );

    // Get lender profile balance info
    const [profileRows] = await pool.execute<RowDataPacket[]>(
      "SELECT available_balance, total_invested, total_earned FROM lender_profiles WHERE user_id = ?",
      [lenderId]
    );

    // Get total commission paid to Pulalend
    const [commissionRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COALESCE(SUM(platform_commission), 0) AS totalCommission FROM investments WHERE lender_id = ?",
      [lenderId]
    );

    // Get active investments with loan and borrower details
    const [investmentsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        inv.id,
        inv.amount,
        inv.expected_return,
        inv.invested_at AS investedAt,
        lr.loan_number,
        lr.amount AS loanAmount,
        lr.status AS loanStatus,
        u.first_name AS borrowerFirstName,
        u.last_name AS borrowerLastName,
        COALESCE(SUM(rs.total_amount), 0) AS totalRepayments,
        COALESCE(SUM(CASE WHEN rs.status IN ('pending','partial') AND rs.due_date < NOW() THEN 1 ELSE 0 END), 0) AS overdueCount
       FROM investments inv
       INNER JOIN loan_requests lr ON lr.id = inv.loan_id
       INNER JOIN users u ON u.id = lr.borrower_id
       LEFT JOIN repayment_schedules rs ON rs.loan_id = lr.id
       WHERE inv.lender_id = ?
       GROUP BY inv.id, inv.amount, inv.expected_return, inv.invested_at, lr.loan_number, lr.amount, lr.status, u.first_name, u.last_name
       ORDER BY inv.invested_at DESC
       LIMIT 5`,
      [lenderId]
    );

    // Get recent loan opportunities (approved loans not fully funded)
    const [opportunitiesRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        lr.id,
        lr.loan_number,
        lr.amount,
        lr.interest_rate,
        lr.duration_months,
        lr.purpose,
        lr.requested_at,
        u.first_name AS borrowerFirstName,
        u.last_name AS borrowerLastName,
        COALESCE(SUM(inv.amount), 0) AS fundedAmount,
        (lr.amount - COALESCE(SUM(inv.amount), 0)) AS remaining
       FROM loan_requests lr
       INNER JOIN users u ON u.id = lr.borrower_id
       LEFT JOIN investments inv ON inv.loan_id = lr.id
       WHERE lr.status = 'approved'
       GROUP BY lr.id, lr.loan_number, lr.amount, lr.interest_rate, lr.duration_months, lr.purpose, lr.requested_at, u.first_name, u.last_name
       HAVING remaining > 0
       ORDER BY lr.requested_at DESC
       LIMIT 5`
    );

    // Get notifications
    const [notificationsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, message, type, read_status, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [lenderId]
    );

    const [txRows] = await pool.execute<RowDataPacket[]>(
      `SELECT transaction_type AS transactionType, amount, status, created_at AS createdAt, description
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [lenderId]
    );

    const profile = profileRows[0] || { available_balance: 0, total_invested: 0, total_earned: 0 };

    return NextResponse.json({
      stats: {
        availableLoans: Number(availableRows?.[0]?.count ?? 0),
        fundedLoans: Number(fundedRows?.[0]?.count ?? 0),
        expectedReturn: Number(expectedRows?.[0]?.expectedReturn ?? 0),
      },
      portfolio: {
        availableBalance: Number(profile.available_balance),
        totalInvested: Number(profile.total_invested),
        totalEarned: Number(profile.total_earned),
        totalCommission: Number(commissionRows?.[0]?.totalCommission ?? 0),
      },
      activeInvestments: investmentsRows.map((inv) => ({
        id: inv.id,
        amount: Number(inv.amount),
        expectedReturn: Number(inv.expected_return),
        investedAt: inv.investedAt,
        loanNumber: inv.loan_number,
        loanAmount: Number(inv.loanAmount),
        loanStatus: inv.loanStatus,
        borrowerName: `${inv.borrowerFirstName} ${inv.borrowerLastName}`,
        totalRepayments: Number(inv.totalRepayments),
        overdueCount: Number(inv.overdueCount),
      })),
      opportunities: opportunitiesRows.map((opp) => ({
        id: opp.id,
        loanNumber: opp.loan_number,
        amount: Number(opp.amount),
        interestRate: Number(opp.interest_rate),
        duration: opp.duration_months,
        purpose: opp.purpose,
        createdAt: opp.requested_at,
        borrowerName: `${opp.borrowerFirstName} ${opp.borrowerLastName}`,
        fundedAmount: Number(opp.fundedAmount),
        remaining: Number(opp.remaining),
      })),
      notifications: notificationsRows.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        readStatus: n.read_status,
        createdAt: n.created_at,
      })),
      transactions: txRows.map((t) => ({
        transactionType: t.transactionType,
        amount: Number(t.amount),
        status: t.status,
        createdAt: t.createdAt,
        description: t.description,
      })),
    });
  } catch (error) {
    console.error("Lender dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load lender dashboard" },
      { status: 500 }
    );
  }
}
