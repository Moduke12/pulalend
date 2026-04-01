import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import path from "path";
import fs from "fs/promises";
import { RowDataPacket } from "mysql2";

const uploadsRoot = path.join(process.cwd(), "uploads", "kyc");

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

const saveFile = async (file: File, userId: number, label: string) => {
  const userDir = path.join(uploadsRoot, String(userId));
  await fs.mkdir(userDir, { recursive: true });

  const safeName = sanitizeFilename(file.name || `${label}.bin`);
  const ext = path.extname(safeName) || ".bin";
  const fileName = `${label}_${Date.now()}${ext}`;
  const absPath = path.join(userDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(absPath, buffer);

  return path.join("uploads", "kyc", String(userId), fileName).replace(/\\/g, "/");
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, status, submitted_at, reviewed_at, notes FROM kyc_requests WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ status: "not_submitted" });
    }

    const latest = rows[0];
    return NextResponse.json({
      status: latest.status,
      submittedAt: latest.submitted_at,
      reviewedAt: latest.reviewed_at,
      notes: latest.notes || null,
    });
  } catch (error) {
    console.error("KYC status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    const userId = Number(form.get("userId"));
    const idType = String(form.get("idType") || "").trim();
    const idNumber = String(form.get("idNumber") || "").trim();
    const address1 = String(form.get("address1") || "").trim();
    const address2 = String(form.get("address2") || "").trim();
    const city = String(form.get("city") || "").trim();
    const country = String(form.get("country") || "").trim();

    const idFront = form.get("idFront");
    const idBack = form.get("idBack");
    const selfie = form.get("selfie");
    const omangCopy = form.get("omangCopy");
    const payslip = form.get("payslip");

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    if (!idType || !idNumber || !address1 || !city || !country) {
      return NextResponse.json(
        { error: "Missing required KYC fields" },
        { status: 400 }
      );
    }

    if (!(idFront instanceof File) || !(selfie instanceof File)) {
      return NextResponse.json(
        { error: "ID front and selfie are required" },
        { status: 400 }
      );
    }

    const idFrontPath = await saveFile(idFront, userId, "id_front");
    const idBackPath = idBack instanceof File ? await saveFile(idBack, userId, "id_back") : null;
    const selfiePath = await saveFile(selfie, userId, "selfie");
    const omangCopyPath = omangCopy instanceof File ? await saveFile(omangCopy, userId, "omang_copy") : null;
    const payslipPath = payslip instanceof File ? await saveFile(payslip, userId, "payslip") : null;

    const [result] = await pool.execute(
      `INSERT INTO kyc_requests (
        user_id,
        id_type,
        id_number,
        address1,
        address2,
        city,
        country,
        id_front_path,
        id_back_path,
        selfie_path,
        omang_copy_path,
        payslip_path,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        idType,
        idNumber,
        address1,
        address2 || null,
        city,
        country,
        idFrontPath,
        idBackPath,
        selfiePath,
        omangCopyPath,
        payslipPath,
      ]
    );

    return NextResponse.json({
      status: "pending",
      submittedAt: new Date().toISOString(),
      kycId: (result as any).insertId,
    });
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit KYC" },
      { status: 500 }
    );
  }
}
