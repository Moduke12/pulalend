import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const allowed = ["pending", "approved", "rejected", "verified"];

    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
          kr.id,
          kr.user_id,
          kr.id_type,
          kr.id_number,
          kr.address1,
          kr.address2,
          kr.city,
          kr.country,
          kr.id_front_path,
          kr.id_back_path,
          kr.selfie_path,
          kr.omang_copy_path,
          kr.payslip_path,
          kr.status,
          kr.rejection_reason,
          kr.submitted_at,
          kr.reviewed_at,
          kr.notes,
          u.first_name,
          u.last_name,
          u.email,
          u.user_type,
          u.phone
        FROM kyc_requests kr
        INNER JOIN users u ON u.id = kr.user_id
        WHERE kr.status = ?
        ORDER BY kr.submitted_at DESC`,
      [status]
    );

    return NextResponse.json({
      kycRequests: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        idType: r.id_type,
        idNumber: r.id_number,
        address1: r.address1,
        address2: r.address2,
        city: r.city,
        country: r.country,
        idFrontPath: r.id_front_path,
        idBackPath: r.id_back_path,
        selfiePath: r.selfie_path,
        omangCopyPath: r.omang_copy_path,
        payslipPath: r.payslip_path,
        status: r.status,
        rejectionReason: r.rejection_reason,
        submittedAt: r.submitted_at,
        reviewedAt: r.reviewed_at,
        notes: r.notes,
        user: {
          firstName: r.first_name,
          lastName: r.last_name,
          email: r.email,
          userType: r.user_type,
          phone: r.phone,
        },
      })),
    });
  } catch (error) {
    console.error("Admin KYC GET error:", error);
    return NextResponse.json({ error: "Failed to load KYC requests" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { kycId, action, notes, reviewerId } = body;

    if (!kycId || !action) {
      return NextResponse.json(
        { error: "kycId and action are required" },
        { status: 400 }
      );
    }

    const id = Number(kycId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid kycId" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Only allow approve/reject from pending
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT status, user_id FROM kyc_requests WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "KYC request not found" }, { status: 404 });
    }

    const currentStatus = existing[0].status;
    const userId = existing[0].user_id;

    if (currentStatus !== "pending") {
      return NextResponse.json(
        { error: "Can only approve/reject pending KYC requests" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const rejectionReason = action === "reject" ? (notes || "KYC rejected by admin") : null;

    await pool.execute(
      `UPDATE kyc_requests 
       SET status = ?, 
           reviewed_at = NOW(), 
           reviewer_id = ?,
           rejection_reason = ?,
           notes = ?
       WHERE id = ?`,
      [newStatus, reviewerId || null, rejectionReason, notes || null, id]
    );

    // Update borrower/lender profile verification status if approved
    if (action === "approve") {
      // Check user type and update appropriate profile
      const [userRows] = await pool.execute<RowDataPacket[]>(
        "SELECT user_type FROM users WHERE id = ?",
        [userId]
      );

      if (userRows.length > 0) {
        const userType = userRows[0].user_type;
        
        if (userType === "borrower") {
          await pool.execute(
            "UPDATE borrower_profiles SET verified = TRUE WHERE user_id = ?",
            [userId]
          );
        } else if (userType === "lender") {
          await pool.execute(
            "UPDATE lender_profiles SET verified = TRUE WHERE user_id = ?",
            [userId]
          );
        }
      }
    }

    // Create notification
    const notificationTitle = action === "approve" ? "KYC Approved" : "KYC Rejected";
    const notificationMessage = action === "approve"
      ? "Your KYC verification has been approved. You can now access all platform features."
      : `Your KYC verification has been rejected. Reason: ${rejectionReason}`;

    await pool.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [userId, notificationTitle, notificationMessage, action === "approve" ? "success" : "error"]
    );

    return NextResponse.json({
      success: true,
      status: newStatus,
    });
  } catch (error) {
    console.error("Admin KYC PUT error:", error);
    return NextResponse.json({ error: "Failed to update KYC request" }, { status: 500 });
  }
}
