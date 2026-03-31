import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const allowed = [
      "pending",
      "approved",
      "rejected",
      "funded",
      "active",
      "completed",
      "defaulted",
      "under review",
    ];

    // Keep it simple for v1: only known statuses
    if (!allowed.includes(status) && !["pending", "approved", "rejected", "funded", "active", "completed", "defaulted"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
          lr.id,
          lr.amount,
          lr.interest_rate AS interestRate,
          lr.duration_months AS durationMonths,
          lr.purpose,
          lr.status,
          lr.risk_grade AS riskGrade,
          lr.requested_at AS requestedAt,
          lr.approved_at AS approvedAt,
          u.id AS borrowerId,
          u.first_name AS borrowerFirstName,
          u.last_name AS borrowerLastName,
          u.email AS borrowerEmail
        FROM loan_requests lr
        INNER JOIN users u ON u.id = lr.borrower_id
        WHERE lr.status = ?
        ORDER BY lr.requested_at DESC`,
      [status]
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
        approvedAt: r.approvedAt,
        borrower: {
          id: r.borrowerId,
          firstName: r.borrowerFirstName,
          lastName: r.borrowerLastName,
          email: r.borrowerEmail,
        },
      })),
    });
  } catch (error) {
    console.error("Admin loans GET error:", error);
    return NextResponse.json({ error: "Failed to load loans" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId, action, interestRate, riskGrade } = body;

    if (!loanId || !action) {
      return NextResponse.json(
        { error: "loanId and action are required" },
        { status: 400 }
      );
    }

    const id = Number(loanId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid loanId" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Only allow approve/reject from pending
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT status FROM loan_requests WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (existing[0].status !== "pending") {
      return NextResponse.json(
        { error: "Only pending loans can be approved/rejected" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const rate = interestRate != null ? Number(interestRate) : null;
      const grade = riskGrade != null ? String(riskGrade) : null;

      await pool.execute(
        `UPDATE loan_requests
         SET status = 'approved',
             approved_at = NOW(),
             interest_rate = COALESCE(?, interest_rate),
             risk_grade = COALESCE(?, risk_grade),
             updated_at = NOW()
         WHERE id = ?`,
        [rate, grade, id]
      );
    } else {
      await pool.execute(
        "UPDATE loan_requests SET status='rejected', updated_at=NOW() WHERE id = ?",
        [id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin loans PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update loan" },
      { status: 500 }
    );
  }
}
