import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { EmailService } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, paymentMethod } = body;

    if (!userId || !amount) {
      return NextResponse.json(
        { error: "userId and amount are required" },
        { status: 400 }
      );
    }

    const lenderId = Number(userId);
    const depositAmount = Number(amount);

    if (!Number.isFinite(lenderId) || !Number.isFinite(depositAmount) || depositAmount <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Verify user is a lender
    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, user_type, email, first_name, last_name FROM users WHERE id = ?",
      [lenderId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userRows[0].user_type !== "lender") {
      return NextResponse.json({ error: "Only lenders can add funds" }, { status: 403 });
    }

    const user = userRows[0];

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update lender profile balance
      await connection.execute(
        "UPDATE lender_profiles SET available_balance = available_balance + ? WHERE user_id = ?",
        [depositAmount, lenderId]
      );

      // Record transaction
      await connection.execute(
        `INSERT INTO transactions (user_id, transaction_type, amount, description, status, reference_type) 
         VALUES (?, 'deposit', ?, ?, 'completed', 'fund_deposit')`,
        [lenderId, depositAmount, `Deposit via ${paymentMethod || 'bank transfer'}`]
      );

      // Create notification
      await connection.execute(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
        [
          lenderId,
          "Funds Added Successfully",
          `Your account has been credited with $${depositAmount.toLocaleString()}. You can now invest in loan opportunities.`,
          "success"
        ]
      );

      await connection.commit();

      // Get updated balance
      const [balanceRows] = await connection.execute<RowDataPacket[]>(
        "SELECT available_balance FROM lender_profiles WHERE user_id = ?",
        [lenderId]
      );

      connection.release();

      const newBalance = Number(balanceRows[0]?.available_balance || 0);

      // Send email notification (async, don't wait)
      EmailService.sendFundDepositConfirmation(
        user.email,
        `${user.first_name} ${user.last_name}`,
        depositAmount
      ).catch(err => console.error('Email send error:', err));

      return NextResponse.json({
        success: true,
        message: "Funds added successfully",
        newBalance,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Add funds error:", error);
    return NextResponse.json({ error: "Failed to add funds" }, { status: 500 });
  }
}
