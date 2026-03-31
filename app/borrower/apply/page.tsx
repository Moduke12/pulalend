"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

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

export default function BorrowerApplyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lenders, setLenders] = useState<any[]>([]);
  const [lenderLoading, setLenderLoading] = useState(true);
  const [form, setForm] = useState({
    amount: "",
    durationMonths: "6",
    purpose: "",
    notes: "",
    lenderIds: [] as number[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.userType !== "borrower") {
      router.push("/login");
      return;
    }
    setUser(parsed);
    loadLenders();
  }, [router]);

  const loadLenders = async () => {
    setLenderLoading(true);
    try {
      const res = await fetch("/api/borrower/lenders");
      const data = await res.json();
      if (res.ok) {
        setLenders(data.lenders || []);
      }
    } catch {
      // Best-effort load
    } finally {
      setLenderLoading(false);
    }
  };

  const toggleLender = (lenderId: number) => {
    setForm((f) => {
      const exists = f.lenderIds.includes(lenderId);
      return {
        ...f,
        lenderIds: exists
          ? f.lenderIds.filter((id) => id !== lenderId)
          : [...f.lenderIds, lenderId],
      };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amount = Number(form.amount);
    const durationMonths = Number(form.durationMonths);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (!Number.isFinite(durationMonths) || durationMonths <= 0) {
      setError("Enter a valid duration");
      return;
    }

    if (!form.purpose.trim()) {
      setError("Purpose is required");
      return;
    }

    if (form.lenderIds.length === 0) {
      setError("Select at least one lender");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/borrower/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          durationMonths,
          purpose: form.purpose.trim(),
          notes: form.notes.trim() || undefined,
          lenderIds: form.lenderIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        return;
      }
      setSuccess(`Loan request submitted (ID: #${data.loanId}).`);
      setForm({ amount: "", durationMonths: "6", purpose: "", notes: "" });
      setTimeout(() => router.push("/borrower/loans"), 900);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="borrower" navItems={navItems} title="Apply for a Loan">
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-deep mb-4">Loan Request</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                min={1}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                placeholder="e.g. 500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Repayment Duration (months)</label>
              <select
                value={form.durationMonths}
                onChange={(e) => setForm((f) => ({ ...f, durationMonths: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none bg-white"
              >
                {[3, 6, 9, 12, 18, 24].map((m) => (
                  <option key={m} value={m}>
                    {m} months
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason / Purpose</label>
              <textarea
                value={form.purpose}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                placeholder="Describe what the loan will be used for"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Lender(s)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Only verified lenders with available balance are shown.
              </p>
              {lenderLoading ? (
                <div className="text-sm text-gray-500">Loading lenders...</div>
              ) : lenders.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No lenders available right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {lenders.map((lender) => {
                    const loanAmount = Number(form.amount || 0);
                    const duration = Number(form.durationMonths || 0);
                    const interestRate = 12;
                    const interestFactor = 1 + (interestRate / 100) * (duration / 12 || 1);
                    const totalReturn = loanAmount ? loanAmount * interestFactor : 0;

                    return (
                      <label
                        key={lender.id}
                        className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition ${
                          form.lenderIds.includes(lender.id)
                            ? "border-primary-blue bg-blue-50"
                            : "border-gray-200 hover:border-primary-blue"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={form.lenderIds.includes(lender.id)}
                            onChange={() => toggleLender(lender.id)}
                            className="h-4 w-4 text-primary-blue"
                          />
                          <div>
                            <div className="font-medium text-navy-deep">
                              {lender.firstName} {lender.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Available: P{lender.availableBalance.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>Rate: {interestRate}%</div>
                          <div>
                            Est. return: P{Math.round(totalReturn).toLocaleString()}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                placeholder="Any extra context (optional)"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Loan Request"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
