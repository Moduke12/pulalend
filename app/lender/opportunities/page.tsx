"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

const navItems = [
  {
    label: "Dashboard",
    href: "/lender/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Opportunities",
    href: "/lender/opportunities",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    href: "/lender/portfolio",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 10H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Transactions",
    href: "/lender/transactions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/lender/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function LenderOpportunitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loans, setLoans] = useState<any[]>([]);
  const [funding, setFunding] = useState<Record<number, string>>({});

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.userType !== "lender") {
      router.push("/login");
      return;
    }
    setUser(parsed);
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/lender/opportunities");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load opportunities");
        return;
      }
      setLoans(data.loans || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fundLoan = async (loanId: number) => {
    const amountStr = funding[loanId];
    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid funding amount");
      return;
    }

    setError("");
    try {
      const res = await fetch("/api/lender/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, loanId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Funding failed");
        return;
      }
      setFunding((f) => ({ ...f, [loanId]: "" }));
      await load();
    } catch {
      setError("Network error");
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="lender" navItems={navItems} title="Loan Opportunities">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-deep">Approved Loans Open for Funding</h2>
          <p className="text-gray-600 text-sm mt-1">Fund full or partial amounts</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : loans.length === 0 ? (
            <p className="text-gray-600">No approved loans available right now.</p>
          ) : (
            <div className="space-y-4">
              {loans.map((l) => (
                <div key={l.id} className="border border-gray-100 rounded-xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Loan #{l.id} • Risk {l.riskGrade}</div>
                      <div className="text-xl font-bold text-navy-deep mt-1">
                        ${Number(l.amount).toLocaleString()} at {l.interestRate}% for {l.durationMonths} months
                      </div>
                      <div className="text-gray-600 mt-2 line-clamp-2">{l.purpose}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        Funded: ${Number(l.fundedAmount).toLocaleString()} • Remaining: ${Number(l.remainingAmount).toLocaleString()}
                      </div>
                    </div>

                    <div className="w-full md:w-72">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={funding[l.id] || ""}
                          onChange={(e) => setFunding((f) => ({ ...f, [l.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                          placeholder="Amount"
                        />
                        <button
                          onClick={() => fundLoan(l.id)}
                          className="px-4 py-2 bg-growth-green text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Fund
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        You can fund up to the remaining amount.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
