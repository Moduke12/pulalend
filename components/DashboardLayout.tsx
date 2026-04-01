"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
}

export default function DashboardLayout({
  children,
  userType,
  navItems,
  title,
}: DashboardLayoutProps) {
  const router = useRouter();

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
      {/* Sidebar */}
      <aside className={`${headerColor} text-white w-64 min-h-screen flex flex-col`}>
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
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-navy-deep">{title}</h1>
          <div className="flex items-center gap-3">
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
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
