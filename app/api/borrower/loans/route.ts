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
      `SELECT id, amount, interest_rate AS interestRate, duration_months AS durationMonths,
              purpose, status, risk_grade AS riskGrade, requested_at AS requestedAt
       FROM loan_requests
       WHERE borrower_id = ?
       ORDER BY requested_at DESC`,
      [userId]
    );

    return NextResponse.json({
      loans: rows.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        interestRate: Number(r.interestRate),
        durationMonths: Number(r.durationMonths),
        purpose: r.purpose,
        status: r.status,
        riskGrade: r.riskGrade,
        requestedAt: r.requestedAt,
      })),
    });
  } catch (error) {
    console.error("Borrower loans GET error:", error);
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, durationMonths, purpose, notes, lenderIds } = body;

    if (!userId || !amount || !durationMonths || !purpose) {
      return NextResponse.json(
        { error: "userId, amount, durationMonths and purpose are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(lenderIds) || lenderIds.length === 0) {
      return NextResponse.json(
        { error: "Select at least one lender" },
        { status: 400 }
      );
    }

    const borrowerId = Number(userId);
    const loanAmount = Number(amount);
    const duration = Number(durationMonths);

    if (!Number.isFinite(borrowerId) || !Number.isFinite(loanAmount) || !Number.isFinite(duration)) {
      return NextResponse.json({ error: "Invalid numeric input" }, { status: 400 });
    }

    const selectedLenders = lenderIds
      .map((id: any) => Number(id))
      .filter((id: number) => Number.isFinite(id));

    if (selectedLenders.length === 0) {
      return NextResponse.json({ error: "Invalid lender selection" }, { status: 400 });
    }

    const placeholders = selectedLenders.map(() => "?").join(",");
    const [lenderRows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id
       FROM users u
       INNER JOIN lender_profiles lp ON lp.user_id = u.id
       WHERE u.user_type = 'lender'
         AND lp.verified = TRUE
         AND lp.available_balance > 0
         AND u.id IN (${placeholders})`,
      selectedLenders
    );

    if (lenderRows.length !== selectedLenders.length) {
      return NextResponse.json(
        { error: "One or more lenders are not available" },
        { status: 400 }
      );
    }

    // Default interest rate/risk grade for v1 (admin can adjust later)
    const interestRate = 12.0;
    const riskGrade = "C";

    const fullPurpose = notes ? `${purpose}\n\nNotes: ${notes}` : purpose;

    const [result] = await pool.execute(
      `INSERT INTO loan_requests (borrower_id, amount, interest_rate, duration_months, purpose, status, risk_grade)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [borrowerId, loanAmount, interestRate, duration, fullPurpose, riskGrade]
    );

    const loanId = (result as any).insertId;

    const lenderValues = selectedLenders.map((lenderId: number) => [loanId, lenderId]);
    await pool.query(
      "INSERT INTO loan_lender_selections (loan_id, lender_id) VALUES ?",
      [lenderValues]
    );

    return NextResponse.json({
      success: true,
      loanId,
    });
  } catch (error) {
    console.error("Borrower loans POST error:", error);
    return NextResponse.json({ error: "Failed to submit loan" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, loanId, action } = body;

    if (!userId || !loanId || action !== "cancel") {
      return NextResponse.json(
        { error: "userId, loanId and action=cancel are required" },
        { status: 400 }
      );
    }

    const borrowerId = Number(userId);
    const id = Number(loanId);

    if (!Number.isFinite(borrowerId) || !Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid numeric input" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, status FROM loan_requests WHERE id = ? AND borrower_id = ?",
      [id, borrowerId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (rows[0].status !== "pending") {
      return NextResponse.json(
        { error: "Only pending loans can be cancelled" },
        { status: 400 }
      );
    }

    await pool.execute(
      "UPDATE loan_requests SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Borrower loans PUT error:", error);
    return NextResponse.json({ error: "Failed to cancel loan" }, { status: 500 });
  }
}
