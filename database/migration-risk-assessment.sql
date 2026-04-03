-- Add risk assessment fields to borrower profiles and loan requests

-- Add risk assessment fields to borrower_profiles
ALTER TABLE borrower_profiles
ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Monthly income for debt-to-income calculation',
ADD COLUMN IF NOT EXISTS monthly_debt DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Monthly debt obligations',
ADD COLUMN IF NOT EXISTS total_loans INT DEFAULT 0 COMMENT 'Total number of loans taken',
ADD COLUMN IF NOT EXISTS completed_loans INT DEFAULT 0 COMMENT 'Successfully completed loans',
ADD COLUMN IF NOT EXISTS defaulted_loans INT DEFAULT 0 COMMENT 'Defaulted loans',
ADD COLUMN IF NOT EXISTS on_time_payments INT DEFAULT 0 COMMENT 'Number of on-time payments',
ADD COLUMN IF NOT EXISTS late_payments INT DEFAULT 0 COMMENT 'Number of late payments',
ADD COLUMN IF NOT EXISTS default_probability DECIMAL(5, 2) DEFAULT 5.00 COMMENT 'Default probability percentage';

-- Add risk assessment fields to loan_requests
ALTER TABLE loan_requests
ADD COLUMN IF NOT EXISTS debt_to_income_ratio DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Debt-to-income ratio percentage',
ADD COLUMN IF NOT EXISTS loan_to_income_ratio DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Loan amount to monthly income ratio';

-- Update existing records with calculated default probability
UPDATE borrower_profiles bp
SET default_probability = CASE
    WHEN bp.credit_score >= 750 THEN 2.0
    WHEN bp.credit_score >= 700 THEN 5.0
    WHEN bp.credit_score >= 650 THEN 10.0
    WHEN bp.credit_score >= 600 THEN 20.0
    ELSE 35.0
END
WHERE bp.credit_score IS NOT NULL;

-- Update existing loan requests with risk grades based on credit scores
UPDATE loan_requests lr
INNER JOIN borrower_profiles bp ON bp.user_id = lr.borrower_id
SET lr.risk_grade = CASE
    WHEN bp.credit_score >= 750 THEN 'A'
    WHEN bp.credit_score >= 700 THEN 'B'
    WHEN bp.credit_score >= 650 THEN 'C'
    WHEN bp.credit_score >= 600 THEN 'D'
    ELSE 'E'
END
WHERE bp.credit_score IS NOT NULL;
