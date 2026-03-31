"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const navItems = [
  {
    label: "Dashboard",
    href: "/borrower/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "My Loans",
    href: "/borrower/loans",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Apply for Loan",
    href: "/borrower/apply",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: "Repayments",
    href: "/borrower/repayments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "KYC",
    href: "/borrower/kyc",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 4.418-2.686 7.708-7 10-4.314-2.292-7-5.582-7-10V6l7-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/borrower/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function BorrowerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    activeLoans: 0,
    totalBorrowed: 0,
    nextPayment: 0,
    creditScore: 650,
  });
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== "borrower") {
      router.push("/login");
      return;
    }
    setUser(parsedUser);
    fetchDashboardData(parsedUser.id);
  }, [router]);

  const fetchDashboardData = async (userId: number) => {
    try {
      const response = await fetch(`/api/borrower/dashboard?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setLoans(data.recentLoans || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="borrower" navItems={navItems} title="Borrower Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-deep">
          Welcome back, {user.firstName}!
        </h2>
        <p className="text-gray-600">Here is an overview of your account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Loans</p>
          <p className="text-3xl font-bold text-primary-blue">{stats.activeLoans}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Borrowed</p>
          <p className="text-3xl font-bold text-navy-deep">
            P{stats.totalBorrowed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Next Payment</p>
          <p className="text-3xl font-bold text-accent-orange">
            P{stats.nextPayment.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Credit Score</p>
          <p className="text-3xl font-bold text-growth-green">{stats.creditScore}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/borrower/apply">
          <div className="bg-primary-blue text-white rounded-xl p-6 cursor-pointer hover:bg-blue-700 transition">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Apply for a New Loan</h3>
                <p className="text-white/80 text-sm">Quick and easy application</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/borrower/repayments">
          <div className="bg-growth-green text-white rounded-xl p-6 cursor-pointer hover:bg-green-700 transition">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Make a Repayment</h3>
                <p className="text-white/80 text-sm">Stay on track with payments</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Loans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-navy-deep">Recent Loans</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading...</p>
          ) : loans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No loans yet</p>
              <Link
                href="/borrower/apply"
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply for Your First Loan
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-3">Loan ID</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-t border-gray-50">
                    <td className="py-3 font-medium">#{loan.id}</td>
                    <td className="py-3">P{loan.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        loan.status === "active" ? "bg-green-100 text-green-700" :
                        loan.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        loan.status === "completed" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(loan.requestedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
