-- Migration to add lending preferences to lender_profiles
-- Run this if your database already exists

USE pulalend;

-- Add preferred_interest_rate column if it doesn't exist
ALTER TABLE lender_profiles 
ADD COLUMN IF NOT EXISTS preferred_interest_rate DECIMAL(5, 2) DEFAULT 12.00 AFTER total_earned;

-- Add min_loan_amount column if it doesn't exist
ALTER TABLE lender_profiles 
ADD COLUMN IF NOT EXISTS min_loan_amount DECIMAL(15, 2) DEFAULT 1000.00 AFTER preferred_interest_rate;

-- Add max_loan_amount column if it doesn't exist
ALTER TABLE lender_profiles 
ADD COLUMN IF NOT EXISTS max_loan_amount DECIMAL(15, 2) DEFAULT 50000.00 AFTER min_loan_amount;
