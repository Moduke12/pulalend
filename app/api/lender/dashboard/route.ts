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

    const [txRows] = await pool.execute<RowDataPacket[]>(
      `SELECT transaction_type AS transactionType, amount, status, created_at AS createdAt, description
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [lenderId]
    );

    return NextResponse.json({
      stats: {
        availableLoans: Number(availableRows?.[0]?.count ?? 0),
        fundedLoans: Number(fundedRows?.[0]?.count ?? 0),
        expectedReturn: Number(expectedRows?.[0]?.expectedReturn ?? 0),
      },
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
