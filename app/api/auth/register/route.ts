import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, userType, permanentAddress, currentAddress } = body;

    // Validation
    if (!email || !password || !firstName || !lastName || !userType || !permanentAddress || !currentAddress) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    if (!["borrower", "lender"].includes(userType)) {
      return NextResponse.json(
        { error: "Invalid user type" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, permanent_address, current_address, status, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', FALSE)`,
      [email, hashedPassword, firstName, lastName, phone || null, userType, permanentAddress, currentAddress]
    );

    const userId = (result as any).insertId;

    // Create profile based on user type
    if (userType === "borrower") {
      await pool.execute(
        "INSERT INTO borrower_profiles (user_id) VALUES (?)",
        [userId]
      );
    } else if (userType === "lender") {
      await pool.execute(
        "INSERT INTO lender_profiles (user_id, available_balance, total_invested, total_earned) VALUES (?, 0, 0, 0)",
        [userId]
      );
    }

    // Return user data
    const userData = {
      id: userId,
      email,
      firstName,
      lastName,
      phone,
      permanentAddress,
      currentAddress,
      userType,
      status: "active",
      emailVerified: false,
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
