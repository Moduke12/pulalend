export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'borrower' | 'lender' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  createdAt: Date;
}

export interface BorrowerProfile {
  id: number;
  userId: number;
  businessName?: string;
  businessType?: string;
  businessRegistrationNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  creditScore?: number;
  verified: boolean;
}

export interface LenderProfile {
  id: number;
  userId: number;
  availableBalance: number;
  totalInvested: number;
  totalEarned: number;
  verified: boolean;
}

export interface LoanRequest {
  id: number;
  borrowerId: number;
  amount: number;
  interestRate: number;
  durationMonths: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'funded' | 'active' | 'completed' | 'defaulted';
  riskGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  requestedAt: Date;
  approvedAt?: Date;
  fundedAt?: Date;
}

export interface Investment {
  id: number;
  lenderId: number;
  loanId: number;
  amount: number;
  expectedReturn: number;
  actualReturn: number;
  status: 'active' | 'completed' | 'defaulted';
  investedAt: Date;
  completedAt?: Date;
}

export interface Transaction {
  id: number;
  userId: number;
  transactionType: 'deposit' | 'withdrawal' | 'investment' | 'repayment' | 'return';
  amount: number;
  referenceId?: number;
  referenceType?: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}
