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

export default function BorrowerKycPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"not_submitted" | "pending" | "approved" | "rejected">(
    "not_submitted"
  );
  const [form, setForm] = useState({
    idType: "",
    idNumber: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
  });
  const [files, setFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    fetchStatus(parsed.id);
  }, [router]);

  const fetchStatus = async (userId: number) => {
    try {
      const res = await fetch(`/api/borrower/kyc?userId=${userId}`);
      const data = await res.json();
      if (res.ok && data.status) {
        setStatus(data.status);
      }
    } catch {
      // Best-effort status lookup
    }
  };

  const steps = [
    { title: "Identity", description: "Provide your ID details" },
    { title: "Address", description: "Confirm your residence" },
    { title: "Documents", description: "Upload ID and selfie" },
  ];

  const validateStep = (currentStep: number) => {
    if (currentStep === 0) {
      if (!form.idType || !form.idNumber.trim()) {
        setError("Select an ID type and enter the ID number.");
        return false;
      }
    }

    if (currentStep === 1) {
      if (!form.address1.trim() || !form.city.trim() || !form.country.trim()) {
        setError("Address line 1, city, and country are required.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!files.idFront || !files.selfie) {
        setError("Upload the front of your ID and a selfie.");
        return false;
      }
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submitKyc = async () => {
    if (!validateStep(step)) return;
    if (!user) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("userId", String(user.id));
      payload.append("idType", form.idType);
      payload.append("idNumber", form.idNumber.trim());
      payload.append("address1", form.address1.trim());
      payload.append("address2", form.address2.trim());
      payload.append("city", form.city.trim());
      payload.append("country", form.country.trim());

      if (files.idFront) payload.append("idFront", files.idFront);
      if (files.idBack) payload.append("idBack", files.idBack);
      if (files.selfie) payload.append("selfie", files.selfie);

      const res = await fetch("/api/borrower/kyc", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit KYC");
        return;
      }

      setStatus(data.status || "pending");
      setSuccess("KYC submitted successfully. We will review your documents.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const isLocked = status === "pending" || status === "approved";

  return (
    <DashboardLayout userType="borrower" navItems={navItems} title="KYC">
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-navy-deep">Verify your identity</h2>
              <p className="text-gray-600">
                Complete KYC to unlock higher limits and faster approvals.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === "approved"
                  ? "bg-green-100 text-green-700"
                  : status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {status === "not_submitted" ? "Not submitted" : status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {steps.map((item, index) => (
              <div
                key={item.title}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  index <= step
                    ? "border-primary-blue bg-blue-50 text-primary-blue"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                <div className="font-semibold">{item.title}</div>
                <div className="text-xs mt-1">{item.description}</div>
              </div>
            ))}
          </div>

          {status === "pending" && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              Your KYC is under review. You will be notified when it is approved.
            </div>
          )}
          {status === "approved" && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Your KYC is approved. You have full access to borrower features.
            </div>
          )}
          {status === "rejected" && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Your KYC was rejected. Please correct your details and resubmit.
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Type
                  </label>
                  <select
                    value={form.idType}
                    onChange={(e) => setForm((f) => ({ ...f, idType: e.target.value }))}
                    disabled={isLocked}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Select</option>
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Number
                  </label>
                  <input
                    value={form.idNumber}
                    onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
                    disabled={isLocked}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                    placeholder="Enter your ID number"
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <input
                    value={form.address1}
                    onChange={(e) => setForm((f) => ({ ...f, address1: e.target.value }))}
                    disabled={isLocked}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2 (optional)
                  </label>
                  <input
                    value={form.address2}
                    onChange={(e) => setForm((f) => ({ ...f, address2: e.target.value }))}
                    disabled={isLocked}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      disabled={isLocked}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      disabled={isLocked}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID (front)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isLocked}
                    onChange={(e) =>
                      setFiles((f) => ({
                        ...f,
                        idFront: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full"
                  />
                  {files.idFront && (
                    <p className="text-xs text-gray-500 mt-1">{files.idFront.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID (back, optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isLocked}
                    onChange={(e) =>
                      setFiles((f) => ({
                        ...f,
                        idBack: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full"
                  />
                  {files.idBack && (
                    <p className="text-xs text-gray-500 mt-1">{files.idBack.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selfie
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isLocked}
                    onChange={(e) =>
                      setFiles((f) => ({
                        ...f,
                        selfie: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full"
                  />
                  {files.selfie && (
                    <p className="text-xs text-gray-500 mt-1">{files.selfie.name}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0 || isLocked}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isLocked}
                className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submitKyc}
                disabled={submitting || isLocked}
                className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit KYC"}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
