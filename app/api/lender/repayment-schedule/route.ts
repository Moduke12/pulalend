import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const investmentIdRaw = searchParams.get("investmentId");

    if (!investmentIdRaw) {
      return NextResponse.json({ error: "investmentId is required" }, { status: 400 });
    }

    const investmentId = Number(investmentIdRaw);
    if (!Number.isFinite(investmentId)) {
      return NextResponse.json({ error: "Invalid investmentId" }, { status: 400 });
    }

    // Get investment details
    const [invRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        inv.id,
        inv.lender_id AS lenderId,
        inv.loan_id AS loanId,
        inv.amount AS investmentAmount,
        inv.expected_return AS expectedReturn,
        inv.actual_return AS actualReturn,
        inv.platform_commission AS platformCommission,
        inv.status,
        inv.invested_at AS investedAt,
        lr.loan_number AS loanNumber,
        lr.amount AS totalLoanAmount,
        lr.interest_rate AS interestRate,
        lr.duration_months AS durationMonths,
        lr.status AS loanStatus,
        u.first_name AS borrowerFirstName,
        u.last_name AS borrowerLastName,
        u.email AS borrowerEmail
       FROM investments inv
       INNER JOIN loan_requests lr ON lr.id = inv.loan_id
       INNER JOIN users u ON u.id = lr.borrower_id
       WHERE inv.id = ?`,
      [investmentId]
    );

    if (invRows.length === 0) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }

    const investment = invRows[0];

    // Get repayment schedule for this loan
    const [scheduleRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        id,
        installment_number AS installmentNumber,
        due_date AS dueDate,
        principal_amount AS principalAmount,
        interest_amount AS interestAmount,
        total_amount AS totalAmount,
        paid_amount AS paidAmount,
        status,
        paid_at AS paidAt,
        created_at AS createdAt
       FROM repayment_schedules
       WHERE loan_id = ?
       ORDER BY installment_number ASC`,
      [investment.loanId]
    );

    // Calculate lender's share of each payment
    // Lender gets a proportional share based on their investment
    const lenderShare = Number(investment.investmentAmount) / Number(investment.totalLoanAmount);

    const scheduleWithLenderShare = scheduleRows.map((row) => {
      const totalAmount = Number(row.totalAmount);
      const paidAmount = Number(row.paidAmount);
      const principalAmount = Number(row.principalAmount);
      const interestAmount = Number(row.interestAmount);
      
      return {
        id: row.id,
        installmentNumber: row.installmentNumber,
        dueDate: row.dueDate,
        // Original loan amounts
        totalAmount,
        principalAmount,
        interestAmount,
        paidAmount,
        // Lender's proportional share
        lenderExpectedAmount: totalAmount * lenderShare,
        lenderPrincipalShare: principalAmount * lenderShare,
        lenderInterestShare: interestAmount * lenderShare,
        lenderReceivedAmount: paidAmount * lenderShare,
        status: row.status,
        paidAt: row.paidAt,
        createdAt: row.createdAt,
        // Calculate days overdue if applicable
        daysOverdue: row.status === 'pending' && new Date(row.dueDate) < new Date()
          ? Math.floor((Date.now() - new Date(row.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      };
    });

    // Calculate summary statistics
    const totalExpected = scheduleWithLenderShare.reduce((sum, s) => sum + s.lenderExpectedAmount, 0);
    const totalReceived = scheduleWithLenderShare.reduce((sum, s) => sum + s.lenderReceivedAmount, 0);
    const totalPending = totalExpected - totalReceived;
    const completedPayments = scheduleWithLenderShare.filter(s => s.status === 'paid').length;
    const overduePayments = scheduleWithLenderShare.filter(s => s.status === 'pending' && s.daysOverdue > 0).length;
    const upcomingPayments = scheduleWithLenderShare.filter(s => s.status === 'pending' && s.daysOverdue === 0).length;

    return NextResponse.json({
      investment: {
        id: investment.id,
        loanId: investment.loanId,
        loanNumber: investment.loanNumber,
        investmentAmount: Number(investment.investmentAmount),
        expectedReturn: Number(investment.expectedReturn),
        actualReturn: Number(investment.actualReturn),
        platformCommission: Number(investment.platformCommission),
        lenderShare: lenderShare * 100, // as percentage
        status: investment.status,
        investedAt: investment.investedAt,
        loanStatus: investment.loanStatus,
        borrowerName: `${investment.borrowerFirstName} ${investment.borrowerLastName}`,
        totalLoanAmount: Number(investment.totalLoanAmount),
        interestRate: Number(investment.interestRate),
        durationMonths: investment.durationMonths,
      },
      schedule: scheduleWithLenderShare,
      summary: {
        totalPayments: scheduleWithLenderShare.length,
        completedPayments,
        overduePayments,
        upcomingPayments,
        totalExpected,
        totalReceived,
        totalPending,
        completionPercentage: Math.round((completedPayments / scheduleWithLenderShare.length) * 100)
      }
    });
  } catch (error) {
    console.error("Repayment schedule error:", error);
    return NextResponse.json(
      { error: "Failed to load repayment schedule" },
      { status: 500 }
    );
  }
}
