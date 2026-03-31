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
      `SELECT transaction_type AS transactionType, amount, status, description, created_at AS createdAt
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );

    return NextResponse.json({
      transactions: rows.map((t) => ({
        transactionType: t.transactionType,
        amount: Number(t.amount),
        status: t.status,
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Lender transactions error:", error);
    return NextResponse.json(
      { error: "Failed to load transactions" },
      { status: 500 }
    );
  }
}
