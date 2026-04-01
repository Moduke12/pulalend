import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType") || "all";
    const status = searchParams.get("status") || "all";

    let query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.user_type,
        u.status,
        u.email_verified,
        u.created_at,
        CASE 
          WHEN u.user_type = 'borrower' THEN bp.verified
          WHEN u.user_type = 'lender' THEN lp.verified
          ELSE NULL
        END as verified,
        CASE 
          WHEN u.user_type = 'lender' THEN lp.available_balance
          ELSE NULL
        END as available_balance,
        CASE 
          WHEN u.user_type = 'lender' THEN lp.total_invested
          ELSE NULL
        END as total_invested
      FROM users u
      LEFT JOIN borrower_profiles bp ON u.id = bp.user_id AND u.user_type = 'borrower'
      LEFT JOIN lender_profiles lp ON u.id = lp.user_id AND u.user_type = 'lender'
      WHERE u.user_type IN ('borrower', 'lender')
    `;

    const params: any[] = [];

    if (userType !== "all") {
      query += " AND u.user_type = ?";
      params.push(userType);
    }

    if (status !== "all") {
      query += " AND u.status = ?";
      params.push(status);
    }

    query += " ORDER BY u.created_at DESC";

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    return NextResponse.json({
      users: rows.map((r) => ({
        id: r.id,
        email: r.email,
        firstName: r.first_name,
        lastName: r.last_name,
        phone: r.phone,
        userType: r.user_type,
        status: r.status,
        emailVerified: Boolean(r.email_verified),
        verified: Boolean(r.verified),
        createdAt: r.created_at,
        availableBalance: r.available_balance !== null ? Number(r.available_balance) : null,
        totalInvested: r.total_invested !== null ? Number(r.total_invested) : null,
      })),
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId and action are required" },
        { status: 400 }
      );
    }

    const id = Number(userId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    if (!["activate", "suspend", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Check if user exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id, status, user_type FROM users WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userType = existing[0].user_type;

    if (userType === "admin") {
      return NextResponse.json({ error: "Cannot modify admin users" }, { status: 403 });
    }

    if (action === "activate") {
      await pool.execute("UPDATE users SET status = 'active' WHERE id = ?", [id]);
      return NextResponse.json({ success: true, status: "active" });
    } else if (action === "suspend") {
      await pool.execute("UPDATE users SET status = 'suspended' WHERE id = ?", [id]);
      return NextResponse.json({ success: true, status: "suspended" });
    } else if (action === "delete") {
      // Soft delete - mark as inactive
      await pool.execute("UPDATE users SET status = 'inactive' WHERE id = ?", [id]);
      return NextResponse.json({ success: true, status: "inactive" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Admin users PUT error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
