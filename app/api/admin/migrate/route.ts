import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // Check lender preference columns
    const [columns] = await connection.execute<RowDataPacket[]>(
      `SHOW COLUMNS FROM lender_profiles WHERE Field IN ('preferred_interest_rate', 'min_loan_amount', 'max_loan_amount')`
    );

    // Check investment commission column
    const [investmentColumns] = await connection.execute<RowDataPacket[]>(
      `SHOW COLUMNS FROM investments WHERE Field = 'platform_commission'`
    );
    
    if (columns.length === 3 && investmentColumns.length === 1) {
      return NextResponse.json(
        { message: "Migration already applied - columns exist" },
        { status: 200 }
      );
    }
    
    // Add preferred_interest_rate if it doesn't exist
    if (!columns.find((col: any) => col.Field === 'preferred_interest_rate')) {
      await connection.execute(
        `ALTER TABLE lender_profiles 
         ADD COLUMN preferred_interest_rate DECIMAL(5,2) DEFAULT 12.00 
         COMMENT 'Preferred annual interest rate percentage'`
      );
    }
    
    // Add min_loan_amount if it doesn't exist
    if (!columns.find((col: any) => col.Field === 'min_loan_amount')) {
      await connection.execute(
        `ALTER TABLE lender_profiles 
         ADD COLUMN min_loan_amount DECIMAL(15,2) DEFAULT 1000.00 
         COMMENT 'Minimum loan amount willing to fund'`
      );
    }
    
    // Add max_loan_amount if it doesn't exist
    if (!columns.find((col: any) => col.Field === 'max_loan_amount')) {
      await connection.execute(
        `ALTER TABLE lender_profiles 
         ADD COLUMN max_loan_amount DECIMAL(15,2) DEFAULT 50000.00 
         COMMENT 'Maximum loan amount willing to fund'`
      );
    }

    // Add platform_commission if it doesn't exist
    if (investmentColumns.length === 0) {
      await connection.execute(
        `ALTER TABLE investments 
         ADD COLUMN platform_commission DECIMAL(15,2) DEFAULT 0.00 
         COMMENT 'Platform commission (2% of investment)'`
      );
    }
    
    connection.release();
    
    return NextResponse.json(
      { 
        message: "Migration completed successfully",
        columnsAdded:
          (3 - columns.length) +
          (investmentColumns.length === 0 ? 1 : 0)
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed: " + error.message },
      { status: 500 }
    );
  }
}
