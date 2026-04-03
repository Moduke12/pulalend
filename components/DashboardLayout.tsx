"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "borrower" | "lender" | "admin";
  navItems: NavItem[];
  title: string;
  commissionAmount?: number;
}

export default function DashboardLayout({
  children,
  userType,
  navItems,
  title,
  commissionAmount,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const headerColor =
    userType === "borrower"
      ? "bg-primary-blue"
      : userType === "lender"
      ? "bg-growth-green"
      : "bg-navy-deep";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${headerColor} text-white w-64 min-h-screen flex flex-col fixed lg:sticky top-0 z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/90 flex items-center justify-center">
              <Image
                src="/logo3.jpeg"
                alt="Pulalend logo"
                width={34}
                height={34}
                className="rounded-lg"
              />
            </div>
            <div>
              <div className="text-lg font-bold leading-tight">PULALEND</div>
              <div className="text-xs text-white/70">the smart lender</div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/20 transition"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Commission Display */}
        {commissionAmount !== undefined && (
          <div className="px-4 pb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-white/70">
                  {userType === "admin" ? "Commission Earned" : "Commission Paid"}
                </span>
              </div>
              <div className="text-2xl font-bold">
                P{Number(commissionAmount || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <div className="text-[10px] text-white/60 mt-1">
                {userType === "admin" ? "Platform earnings (2%)" : "Platform fee (2%)"}
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-white/20 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between gap-2 lg:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-navy-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-lg lg:text-2xl font-bold text-navy-deep truncate">{title}</h1>
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              type="button"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:text-navy-deep hover:border-navy-deep/30 transition"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold bg-accent-orange text-white rounded-full">
                3
              </span>
            </button>
            <button
              type="button"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:text-navy-deep hover:border-navy-deep/30 transition"
              aria-label="Messages"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h8m-8 4h5m9-6a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold bg-primary-blue text-white rounded-full">
                2
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-2">
              <div className="w-9 h-9 rounded-full bg-navy-deep/10 text-navy-deep flex items-center justify-center font-semibold">
                U
              </div>
              <div className="text-sm">
                <div className="font-semibold text-navy-deep capitalize">{userType}</div>
                <div className="text-xs text-gray-500">Account</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
