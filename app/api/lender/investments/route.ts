import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get("userId");
    const status = searchParams.get("status") || "all";

    if (!userIdRaw) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const lenderId = Number(userIdRaw);
    if (!Number.isFinite(lenderId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Verify user is a lender
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

    // Build query based on status filter
    let query = `
      SELECT 
        inv.id,
        inv.amount AS investmentAmount,
        inv.expected_return AS expectedReturn,
        inv.actual_return AS actualReturn,
        inv.status AS investmentStatus,
        inv.invested_at AS investedAt,
        inv.completed_at AS completedAt,
        lr.id AS loanId,
        lr.loan_number AS loanNumber,
        lr.amount AS loanAmount,
        lr.interest_rate AS interestRate,
        lr.duration_months AS durationMonths,
        lr.purpose,
        lr.status AS loanStatus,
        lr.risk_grade AS riskGrade,
        u.id AS borrowerId,
        u.first_name AS borrowerFirstName,
        u.last_name AS borrowerLastName,
        u.email AS borrowerEmail,
        COALESCE(SUM(rs.paid_amount), 0) AS totalRepaid,
        COALESCE(SUM(rs.total_amount), 0) AS totalDue,
        COALESCE(SUM(CASE WHEN rs.status IN ('pending','partial') AND rs.due_date < NOW() THEN 1 ELSE 0 END), 0) AS overdueCount
      FROM investments inv
      INNER JOIN loan_requests lr ON lr.id = inv.loan_id
      INNER JOIN users u ON u.id = lr.borrower_id
      LEFT JOIN repayment_schedules rs ON rs.loan_id = lr.id
      WHERE inv.lender_id = ?
    `;

    const params: any[] = [lenderId];

    if (status !== "all") {
      query += " AND inv.status = ?";
      params.push(status);
    }

    query += `
      GROUP BY inv.id, inv.amount, inv.expected_return, inv.actual_return, inv.status, inv.invested_at, inv.completed_at,
               lr.id, lr.loan_number, lr.amount, lr.interest_rate, lr.duration_months, lr.purpose, lr.status, lr.risk_grade,
               u.id, u.first_name, u.last_name, u.email
      ORDER BY inv.invested_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    // Get summary statistics
    const [statsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalInvestments,
        SUM(amount) as totalInvested,
        SUM(expected_return) as totalExpectedReturn,
        SUM(actual_return) as totalActualReturn,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCount,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCount,
        SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) as defaultedCount
      FROM investments
      WHERE lender_id = ?`,
      [lenderId]
    );

    const stats = statsRows[0] || {
      totalInvestments: 0,
      totalInvested: 0,
      totalExpectedReturn: 0,
      totalActualReturn: 0,
      activeCount: 0,
      completedCount: 0,
      defaultedCount: 0,
    };

    return NextResponse.json({
      investments: rows.map((r) => ({
        id: r.id,
        investmentAmount: Number(r.investmentAmount),
        expectedReturn: Number(r.expectedReturn),
        actualReturn: Number(r.actualReturn),
        investmentStatus: r.investmentStatus,
        investedAt: r.investedAt,
        completedAt: r.completedAt,
        loan: {
          id: r.loanId,
          loanNumber: r.loanNumber,
          amount: Number(r.loanAmount),
          interestRate: Number(r.interestRate),
          durationMonths: Number(r.durationMonths),
          purpose: r.purpose,
          status: r.loanStatus,
          riskGrade: r.riskGrade,
        },
        borrower: {
          id: r.borrowerId,
          firstName: r.borrowerFirstName,
          lastName: r.borrowerLastName,
          email: r.borrowerEmail,
        },
        repaymentProgress: {
          totalRepaid: Number(r.totalRepaid),
          totalDue: Number(r.totalDue),
          overdueCount: Number(r.overdueCount),
          progressPercent: Number(r.totalDue) > 0 
            ? Math.round((Number(r.totalRepaid) / Number(r.totalDue)) * 100)
            : 0,
        },
      })),
      stats: {
        totalInvestments: Number(stats.totalInvestments),
        totalInvested: Number(stats.totalInvested),
        totalExpectedReturn: Number(stats.totalExpectedReturn),
        totalActualReturn: Number(stats.totalActualReturn),
        activeCount: Number(stats.activeCount),
        completedCount: Number(stats.completedCount),
        defaultedCount: Number(stats.defaultedCount),
      },
    });
  } catch (error) {
    console.error("Lender investments GET error:", error);
    return NextResponse.json({ error: "Failed to load investments" }, { status: 500 });
  }
}
