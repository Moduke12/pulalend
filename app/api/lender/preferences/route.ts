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

    // Get lender preferences
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        available_balance,
        total_invested,
        total_earned,
        preferred_interest_rate,
        min_loan_amount,
        max_loan_amount,
        verified
      FROM lender_profiles 
      WHERE user_id = ?`,
      [lenderId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Lender profile not found" }, { status: 404 });
    }

    const profile = rows[0];

    return NextResponse.json({
      preferences: {
        availableBalance: Number(profile.available_balance),
        totalInvested: Number(profile.total_invested),
        totalEarned: Number(profile.total_earned),
        preferredInterestRate: Number(profile.preferred_interest_rate),
        minLoanAmount: Number(profile.min_loan_amount),
        maxLoanAmount: Number(profile.max_loan_amount),
        verified: Boolean(profile.verified),
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferredInterestRate, minLoanAmount, maxLoanAmount } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const lenderId = Number(userId);
    if (!Number.isFinite(lenderId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Validate inputs
    const updates: any = {};
    const errors: string[] = [];

    if (preferredInterestRate !== undefined) {
      const rate = Number(preferredInterestRate);
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
        errors.push("Interest rate must be between 0 and 100");
      } else {
        updates.preferred_interest_rate = rate;
      }
    }

    if (minLoanAmount !== undefined) {
      const min = Number(minLoanAmount);
      if (!Number.isFinite(min) || min < 0) {
        errors.push("Minimum loan amount must be positive");
      } else {
        updates.min_loan_amount = min;
      }
    }

    if (maxLoanAmount !== undefined) {
      const max = Number(maxLoanAmount);
      if (!Number.isFinite(max) || max < 0) {
        errors.push("Maximum loan amount must be positive");
      } else {
        updates.max_loan_amount = max;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    // Validate min < max
    if (updates.min_loan_amount && updates.max_loan_amount) {
      if (updates.min_loan_amount > updates.max_loan_amount) {
        return NextResponse.json(
          { error: "Minimum loan amount cannot exceed maximum loan amount" },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    // Build update query
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updates), lenderId];

    await pool.execute(
      `UPDATE lender_profiles SET ${setClause} WHERE user_id = ?`,
      values
    );

    // Create notification
    await pool.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [
        lenderId,
        "Lending Preferences Updated",
        "Your lending preferences have been updated successfully.",
        "info"
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
