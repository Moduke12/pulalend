"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect based on user type
        switch (data.user.userType) {
          case "admin":
            router.push("/admin");
            break;
          case "borrower":
            router.push("/borrower/dashboard");
            break;
          case "lender":
            router.push("/lender/dashboard");
            break;
          default:
            router.push("/");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-atmosphere flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch">
        <div className="hidden lg:flex flex-col justify-between rounded-3xl bg-white/80 hero-surface p-8">
          <div className="flex items-center gap-3">
            <Image src="/logo3.jpeg" alt="Pulalend logo" width={54} height={54} className="rounded-2xl" />
            <div>
              <div className="font-display text-xl text-navy-deep">PULALEND</div>
              <div className="text-sm text-accent-orange">the smart lender</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-navy-deep/70">Trusted by growing founders and forward-looking lenders.</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-3 shadow-md">
                <Image src="/logo1.jpeg" alt="Pulalend horizontal logo" width={220} height={120} className="rounded-xl" />
              </div>
              <div className="bg-white rounded-2xl p-3 shadow-md">
                <Image src="/logo2.jpeg" alt="Pulalend icon" width={220} height={120} className="rounded-xl" />
              </div>
            </div>
          </div>
          <div className="text-sm text-navy-deep/60">
            Login to manage applications, approvals, and repayments.
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <Image src="/logo3.jpeg" alt="Pulalend logo" width={44} height={44} className="rounded-xl" />
            <div>
              <div className="font-display text-lg text-navy-deep">PULALEND</div>
              <div className="text-xs text-accent-orange">the smart lender</div>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-deep mb-2">Welcome Back</h1>
            <p className="text-gray-600">Log in to your Pulalend account</p>
          </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary-blue hover:text-accent-orange font-semibold">
              Register here
            </Link>
          </p>
        </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-primary-blue">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
