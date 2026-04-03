import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
          lr.id,
          lr.loan_number AS loanNumber,
          lr.amount,
          lr.interest_rate AS interestRate,
          lr.duration_months AS durationMonths,
          lr.purpose,
          lr.risk_grade AS riskGrade,
          lr.debt_to_income_ratio AS debtToIncomeRatio,
          lr.loan_to_income_ratio AS loanToIncomeRatio,
          lr.status,
          lr.requested_at AS requestedAt,
          u.first_name AS borrowerFirstName,
          u.last_name AS borrowerLastName,
          bp.credit_score AS creditScore,
          bp.default_probability AS defaultProbability,
          bp.total_loans AS totalLoans,
          bp.completed_loans AS completedLoans,
          bp.defaulted_loans AS defaultedLoans,
          bp.on_time_payments AS onTimePayments,
          bp.late_payments AS latePayments,
          COALESCE(SUM(inv.amount), 0) AS fundedAmount
        FROM loan_requests lr
        INNER JOIN users u ON u.id = lr.borrower_id
        INNER JOIN borrower_profiles bp ON bp.user_id = lr.borrower_id
        LEFT JOIN investments inv ON inv.loan_id = lr.id
        WHERE lr.status = 'approved'
        GROUP BY lr.id, lr.loan_number, lr.amount, lr.interest_rate, lr.duration_months, lr.purpose, lr.risk_grade,
                 lr.debt_to_income_ratio, lr.loan_to_income_ratio, lr.status, lr.requested_at,
                 u.first_name, u.last_name, bp.credit_score, bp.default_probability,
                 bp.total_loans, bp.completed_loans, bp.defaulted_loans, bp.on_time_payments, bp.late_payments
        HAVING (lr.amount - COALESCE(SUM(inv.amount), 0)) > 0
        ORDER BY lr.approved_at DESC, lr.requested_at DESC`
    );

    return NextResponse.json({
      loans: rows.map((r) => {
        const amount = Number(r.amount);
        const fundedAmount = Number(r.fundedAmount);
        const completedLoans = Number(r.completedLoans || 0);
        const totalLoans = Number(r.totalLoans || 0);
        const onTimePayments = Number(r.onTimePayments || 0);
        const latePayments = Number(r.latePayments || 0);
        const totalPayments = onTimePayments + latePayments;
        
        return {
          id: r.id,
          loanNumber: r.loanNumber,
          amount,
          fundedAmount,
          remainingAmount: Math.max(0, amount - fundedAmount),
          interestRate: Number(r.interestRate),
          durationMonths: Number(r.durationMonths),
          purpose: r.purpose,
          riskGrade: r.riskGrade,
          status: r.status,
          requestedAt: r.requestedAt,
          borrowerName: `${r.borrowerFirstName} ${r.borrowerLastName}`,
          borrowerInitials: `${r.borrowerFirstName?.[0] || ''}${r.borrowerLastName?.[0] || ''}`,
          // Risk assessment data
          creditScore: Number(r.creditScore || 0),
          defaultProbability: Number(r.defaultProbability || 0),
          debtToIncomeRatio: Number(r.debtToIncomeRatio || 0),
          loanToIncomeRatio: Number(r.loanToIncomeRatio || 0),
          totalLoans,
          completedLoans,
          defaultedLoans: Number(r.defaultedLoans || 0),
          repaymentHistory: totalPayments > 0 ? {
            onTime: onTimePayments,
            late: latePayments,
            onTimePercentage: Math.round((onTimePayments / totalPayments) * 100)
          } : null,
          completionRate: totalLoans > 0 ? Math.round((completedLoans / totalLoans) * 100) : 0
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
