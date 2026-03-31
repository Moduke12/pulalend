"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Loan Requests",
    href: "/admin/loans",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "KYC Review",
    href: "/admin/kyc",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.866-3.582 7-8 7a9.985 9.985 0 01-1.515-.115 5.972 5.972 0 001.515-4.385c0-3.866 3.582-7 8-7s8 3.134 8 7a5.972 5.972 0 01-1.515 4.385A9.985 9.985 0 0120 18c-4.418 0-8-3.134-8-7z" />
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.userType !== "admin") {
      router.push("/login");
      return;
    }
    setUser(parsed);
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/loans?status=pending");
      const data = await res.json();
      if (res.ok) setPending(data.loans || []);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="admin" navItems={navItems} title="Admin Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-deep">Welcome, {user.firstName}!</h2>
        <p className="text-gray-600">Monitor and control platform activity</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/admin/loans">
          <div className="bg-navy-deep text-white rounded-xl p-6 cursor-pointer hover:bg-slate-900 transition">
            <div className="text-sm text-white/80">Pending loan requests</div>
            <div className="text-4xl font-bold mt-2">{loading ? "…" : pending.length}</div>
            <div className="text-white/80 mt-2">Review and approve/reject</div>
          </div>
        </Link>

        <Link href="/admin/kyc">
          <div className="bg-primary-blue text-white rounded-xl p-6 cursor-pointer hover:bg-blue-700 transition">
            <div className="text-sm text-white/80">KYC verification</div>
            <div className="text-4xl font-bold mt-2">—</div>
            <div className="text-white/80 mt-2">Review identity submissions</div>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-deep">Latest Pending Loans</h3>
          <Link href="/admin/loans" className="text-primary-blue hover:text-accent-orange font-semibold">
            View all →
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : pending.length === 0 ? (
            <p className="text-gray-600">No pending loans right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3">Loan</th>
                    <th className="pb-3">Borrower</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3">Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.slice(0, 5).map((l: any) => (
                    <tr key={l.id} className="border-t border-gray-50">
                      <td className="py-3 font-medium">#{l.id}</td>
                      <td className="py-3">
                        {l.borrower.firstName} {l.borrower.lastName}
                      </td>
                      <td className="py-3">${Number(l.amount).toLocaleString()}</td>
                      <td className="py-3">{l.durationMonths} mo</td>
                      <td className="py-3 text-gray-500">
                        {new Date(l.requestedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
