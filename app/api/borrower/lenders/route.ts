import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(_request: NextRequest) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.first_name AS firstName, u.last_name AS lastName,
              lp.available_balance AS availableBalance, lp.verified AS verified
       FROM users u
       INNER JOIN lender_profiles lp ON lp.user_id = u.id
       WHERE u.user_type = 'lender' AND lp.verified = TRUE AND lp.available_balance > 0
       ORDER BY lp.available_balance DESC`
    );

    return NextResponse.json({
      lenders: rows.map((row) => ({
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        availableBalance: Number(row.availableBalance || 0),
        verified: Boolean(row.verified),
      })),
    });
  } catch (error) {
    console.error("Borrower lenders GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lenders" },
      { status: 500 }
    );
  }
}
