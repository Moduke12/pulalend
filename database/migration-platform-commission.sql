-- Add platform commission tracking to investments
ALTER TABLE investments 
ADD COLUMN platform_commission DECIMAL(15, 2) DEFAULT 0.00 
COMMENT 'Platform commission (2% of investment)' AFTER actual_return;

-- Create platform statistics table
CREATE TABLE IF NOT EXISTS platform_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_commission_earned DECIMAL(15, 2) DEFAULT 0.00,
    total_loans_funded DECIMAL(15, 2) DEFAULT 0.00,
    total_active_loans INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert initial record
INSERT INTO platform_stats (total_commission_earned, total_loans_funded, total_active_loans) 
VALUES (0.00, 0.00, 0) 
ON DUPLICATE KEY UPDATE last_updated = CURRENT_TIMESTAMP;
