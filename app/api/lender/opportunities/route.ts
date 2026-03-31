import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
          lr.id,
          lr.amount,
          lr.interest_rate AS interestRate,
          lr.duration_months AS durationMonths,
          lr.purpose,
          lr.risk_grade AS riskGrade,
          lr.status,
          COALESCE(SUM(inv.amount), 0) AS fundedAmount
        FROM loan_requests lr
        LEFT JOIN investments inv ON inv.loan_id = lr.id
        WHERE lr.status = 'approved'
        GROUP BY lr.id
        HAVING (lr.amount - COALESCE(SUM(inv.amount), 0)) > 0
        ORDER BY lr.approved_at DESC, lr.requested_at DESC`
    );

    return NextResponse.json({
      loans: rows.map((r) => {
        const amount = Number(r.amount);
        const fundedAmount = Number(r.fundedAmount);
        return {
          id: r.id,
          amount,
          fundedAmount,
          remainingAmount: Math.max(0, amount - fundedAmount),
          interestRate: Number(r.interestRate),
          durationMonths: Number(r.durationMonths),
          purpose: r.purpose,
          riskGrade: r.riskGrade,
          status: r.status,
        };
      }),
    });
  } catch (error) {
    console.error("Lender opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to load opportunities" },
      { status: 500 }
    );
  }
}
