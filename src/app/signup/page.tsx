"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableBranchSelect } from "@/components/ui/searchable-branch-select";
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Clock,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

// Hardcoded fallback branches in case database is loading
const FALLBACK_BRANCHES = [
  { code: "2438", name: "NBS SM North Edsa", region: "NCR - North" },
  { code: "2445", name: "NBS Robinsons Ortigas", region: "NCR - East" },
  { code: "2447", name: "NBS Shangrila", region: "NCR - Central" },
  { code: "2448", name: "NBS SM Megamall", region: "NCR - Central" },
  { code: "2211", name: "NBS SM Clark", region: "Region III - Central Luzon" },
  { code: "2213", name: "NBS SM Pampanga", region: "Region III - Central Luzon" },
  { code: "2206", name: "NBS SM Baguio", region: "CAR - Cordillera" },
  { code: "2201", name: "NBS Abanao Baguio", region: "CAR - Cordillera" },
  { code: "2208", name: "NBS SM Hypermarket Laoag", region: "Region I - Ilocos" },
  { code: "2360", name: "NBS Robinsons Ilocos Norte", region: "Region I - Ilocos" },
  { code: "2204", name: "NBS Vigan", region: "Region I - Ilocos" },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, user, enterDemoMode } = useAuth();

  const [branches, setBranches] = useState<Array<{ code: string; name: string }>>(FALLBACK_BRANCHES);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNo: "",
    branchCode: "2438",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; branchName: string } | null>(null);

  const isRedirectingRef = useRef(false);

  const handleDemoTraineeLogin = async () => {
    isRedirectingRef.current = true;
    setIsLoading(true);
    await enterDemoMode("trainee");
    window.location.href = "/dashboard";
  };

  const handleDemoAdminLogin = async () => {
    isRedirectingRef.current = true;
    setIsLoading(true);
    await enterDemoMode("admin");
    window.location.href = "/admin";
  };

  // If already logged in, redirect to role-appropriate portal
  useEffect(() => {
    if (isRedirectingRef.current) return;
    if (user && user.status === "active") {
      isRedirectingRef.current = true;
      const target =
        user.role === "super_admin" || user.role === "branch_admin"
          ? "/admin"
          : "/dashboard";
      router.replace(target);
    }
  }, [user, router]);

  // Fetch branches from API
  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data.branches && data.branches.length > 0) {
          setBranches(data.branches);
        }
      })
      .catch(() => {
        // Fallback already pre-set
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Front-end sanity checks
    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!formData.contactNo.trim()) {
      setErrorMessage("Please enter your Philippine mobile number.");
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Password and Confirm Password do not match.");
      return;
    }

    setIsLoading(true);

    const result = await signup(formData);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Registration failed. Please review your entries.");
    } else {
      const selectedBranch = branches.find((b) => b.code === formData.branchCode);
      setSuccessInfo({
        message: result.message || "Registration submitted successfully.",
        branchName: selectedBranch?.name || formData.branchCode,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-[#E4002B] text-white py-1.5 px-4 text-center text-xs font-semibold tracking-wide shrink-0">
        NATIONAL BOOK STORE • CASHIER ACADEMY REGISTRATION
      </div>

      <main className="flex-1 w-full flex justify-center items-start py-6 sm:py-10 px-4">
        <div className="w-full max-w-lg bg-white border border-gray-300 shadow-sm p-5 sm:p-8 my-auto">
          {/* Return to Landing Page */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#E4002B] transition-colors group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
              <span>Return to Landing Page</span>
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
            <div className="bg-[#E4002B] text-white px-2.5 py-1 font-extrabold text-xl tracking-tighter">
              NBS
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
                Trainee Registration
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                National Book Store POS Fidelity Training Platform
              </p>
            </div>
          </div>

          {/* Pending Approval Success State */}
          {successInfo ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                  Account Pending Approval
                </h2>
                <div className="mt-2 text-sm text-gray-600 space-y-2">
                  <p>
                    Your trainee account registration has been submitted successfully for{" "}
                    <strong className="text-gray-900">{formData.fullName}</strong>.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 text-left font-mono">
                    <div className="font-bold text-amber-950 uppercase mb-1 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Next Steps for Branch Approval</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Assigned Branch: <strong>{formData.branchCode} - {successInfo.branchName}</strong></li>
                      <li>Status: <strong>Pending Administrator Verification</strong></li>
                      <li>Your branch manager or training supervisor will review and approve your account.</li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500">
                    Once approved, you will be able to log in with your email (<strong>{formData.email}</strong>) and password.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full font-bold flex items-center justify-center space-x-2">
                    <span>Proceed to Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Full Name <span className="text-[#E4002B]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <Input
                    name="fullName"
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  E-mail Address <span className="text-[#E4002B]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. maria.santos@nbs.com.ph"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9 text-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Used for account sign in and certification records.
                </p>
              </div>

              {/* Contact No. */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Contact No. <span className="text-[#E4002B]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <Input
                    name="contactNo"
                    type="tel"
                    required
                    placeholder="09171234567 or +639171234567"
                    value={formData.contactNo}
                    onChange={handleChange}
                    className="pl-9 text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Philippine mobile number (11 digits e.g. 09XXXXXXXXX)
                </p>
              </div>

              {/* Branch Assigned */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Branch Assigned <span className="text-[#E4002B]">*</span>
                </label>
                <SearchableBranchSelect
                  branches={branches}
                  value={formData.branchCode}
                  onChange={(code) => setFormData((prev) => ({ ...prev, branchCode: code }))}
                  includeAllOption={false}
                  placeholder="Type to search branch (e.g. Clark, Megamall, 2438)..."
                  className="w-full sm:w-full"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Type store name or code to filter, or select your store from the 11 NBS branches.
                </p>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Password <span className="text-[#E4002B]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <Input
                      name="password"
                      type="password"
                      required
                      placeholder="Min. 8 chars"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Confirm Password <span className="text-[#E4002B]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <Input
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 border border-gray-200">
                Password must be at least 8 characters long and contain both letters and numbers.
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold uppercase tracking-wide py-2.5 mt-2 bg-[#E4002B] hover:bg-[#C30024] text-white"
              >
                {isLoading ? "Submitting Registration..." : "Register Trainee Account"}
              </Button>

              <div className="text-center pt-3 border-t border-gray-200 text-xs text-gray-600">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#E4002B] hover:underline"
                >
                  Log In Here
                </Link>
              </div>

              {/* Demo Mode Instant Access */}
              <div className="pt-4 border-t border-dashed border-gray-300 space-y-2.5">
                <div className="text-center">
                  <div className="text-[11px] font-black uppercase text-gray-700 tracking-wider">
                    Or Test Immediately in Demo Mode
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Skip registration and explore the system with simulated data:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDemoAdminLogin}
                    disabled={isLoading}
                    className="py-2 px-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-black"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Admin Demo &rarr;</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoTraineeLogin}
                    disabled={isLoading}
                    className="py-2 px-2.5 bg-[#E4002B] hover:bg-[#C30024] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-[#E4002B]"
                  >
                    <Building2 className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Trainee Demo &rarr;</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        National Book Store, Inc. • Internal Retail Training System
      </footer>
    </div>
  );
}
