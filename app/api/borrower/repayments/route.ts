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

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
          rs.id,
          rs.loan_id AS loanId,
          rs.installment_number AS installmentNumber,
          rs.due_date AS dueDate,
          rs.principal_amount AS principalAmount,
          rs.interest_amount AS interestAmount,
          rs.total_amount AS totalAmount,
          rs.paid_amount AS paidAmount,
          rs.status
        FROM repayment_schedules rs
        INNER JOIN loan_requests lr ON lr.id = rs.loan_id
        WHERE lr.borrower_id = ?
        ORDER BY rs.due_date ASC, rs.installment_number ASC`,
      [userId]
    );

    return NextResponse.json({
      repayments: rows.map((r) => ({
        id: r.id,
        loanId: r.loanId,
        installmentNumber: r.installmentNumber,
        dueDate: r.dueDate,
        principalAmount: Number(r.principalAmount),
        interestAmount: Number(r.interestAmount),
        totalAmount: Number(r.totalAmount),
        paidAmount: Number(r.paidAmount),
        status: r.status,
      })),
    });
  } catch (error) {
    console.error("Borrower repayments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repayments" },
      { status: 500 }
    );
  }
}
