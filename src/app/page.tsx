"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/lib/constants";
import { 
  BookOpen, 
  Monitor, 
  Award, 
  ShieldCheck, 
  ChevronRight, 
  LogIn, 
  Sparkles, 
  ArrowRight, 
  GraduationCap,
  Lock
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, signInWithGoogle, enterDemoMode } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleDemoEntry = () => {
    enterDemoMode();
    router.push("/dashboard");
  };

  const handleLaunchClick = () => {
    if (user) {
      router.push("/simulator");
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Brand Notification Bar */}
      <div className="bg-[#E4002B] text-white py-2 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide">
        NATIONAL BOOK STORE • EMPLOYEE POS CASHIER TRAINING & SIMULATOR
      </div>

      {/* Main Navigation Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#E4002B] text-white px-3 py-1 font-extrabold text-xl sm:text-2xl tracking-tighter">
              NBS
            </div>
            <div>
              <div className="font-bold text-gray-900 tracking-tight text-base sm:text-lg uppercase">
                National Book Store
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Cashier Academy • POS Simulator
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="font-bold flex items-center space-x-2">
                  <span>Go to Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDemoEntry}
                  className="hidden sm:inline-flex border-gray-400 font-semibold"
                >
                  Local Demo Mode
                </Button>
                <Button
                  size="sm"
                  onClick={signInWithGoogle}
                  className="font-bold flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign in with Google</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Safety Alert Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm text-amber-900">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <span className="font-medium">
              <strong>Training Sandbox:</strong> {APP_CONFIG.safetyDisclaimer}
            </span>
          </div>
          <Badge variant="warning" className="hidden md:inline-flex items-center">
            Safe Environment
          </Badge>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-12 sm:py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Description */}
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="default" className="text-xs tracking-wider">
                Official Newbie Cashier Curriculum
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                Master the POS. <br />
                <span className="text-[#E4002B]">Zero Risk.</span> Real Confidence.
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                Step-by-step cashier procedures mirroring the 120-slide NBS Cashier Training Deck. Practice lookup, quantity multipliers, manager overrides, and tenders on a high-fidelity interactive terminal simulator.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  size="lg"
                  onClick={handleLaunchClick}
                  className="font-bold text-base px-8 py-4 flex items-center justify-center space-x-2 bg-[#E4002B] hover:bg-[#C10024] shadow-md"
                >
                  <span>Launch Training Simulator</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={signInWithGoogle}
                  className="border-gray-300 font-bold text-base px-6 py-4 flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-5 h-5 text-gray-700" />
                  <span>Sign in with Google</span>
                </Button>
              </div>

              <div className="pt-2 flex items-center space-x-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#E4002B]" />
                  <span>9 Structured Modules</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Monitor className="w-4 h-4 text-[#E4002B]" />
                  <span>5-Screen POS Terminal</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-[#E4002B]" />
                  <span>Automated Grading</span>
                </div>
              </div>
            </div>

            {/* Right Hero: POS SCREEN DETAILS  */}
            <div className="lg:col-span-6 flex justify-center">
              <div
                onClick={handleLaunchClick}
                className="w-full max-w-[560px] bg-[#B0B8C0] border-4 border-[#7A8A99] shadow-2xl flex flex-col font-sans overflow-hidden hover:ring-4 hover:ring-[#E4002B]/40 transition-all cursor-pointer group"
              >
                {/* 1. Header Bar */}
                <div className="bg-[#B0B8C0] border-b border-gray-500 px-2 py-0.5 flex items-center justify-between text-[10px] font-bold text-gray-900 font-mono">
                  <span>Trx.: 0212202629990003000592</span>
                  <span>Clerk: Jan Angela</span>
                  <span>Str No.: 2999</span>
                  <span>Reg No.: 0003</span>
                </div>

                {/* 2. Main Terminal Body */}
                <div className="grid grid-cols-12 bg-white min-h-[290px]">
                  
                  {/* Left 10 Columns: Scanner, Display, Top Keys, Line Item Table */}
                  <div className="col-span-10 flex flex-col border-r-2 border-gray-400">
                    
                    {/* Top Row: Yellow UPC Input + Black LED Display */}
                    <div className="grid grid-cols-12 border-b-2 border-gray-400">
                      
                      {/* Yellow Barcode Box */}
                      <div className="col-span-6 bg-[#FFF275] border-r border-gray-400 p-1.5 flex flex-col justify-center">
                        <div className="text-center font-bold text-[10px] text-gray-900 mb-0.5">
                          Scan or Enter UPC
                        </div>
                        <div className="w-full bg-white border border-gray-500 px-1 py-0.5 text-xs font-mono font-bold text-gray-800 shadow-inner h-6 flex items-center">
                          <span className="inline-block w-1 h-4 bg-gray-900"></span>
                        </div>
                      </div>

                      {/* Black LED Display */}
                      <div className="col-span-6 bg-black text-white p-1.5 font-mono flex flex-col justify-between">
                        <div className="grid grid-cols-2 text-[10px] leading-tight">
                          <div>
                            <div className="text-[#38BDF8] font-bold">SubTotal:</div>
                            <div className="text-gray-300">Quantity:</div>
                            <div className="text-[#4ADE80] font-bold">Unit Price:</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#38BDF8] font-bold">0.00</div>
                            <div className="text-gray-300">0</div>
                            <div className="text-[#4ADE80] font-bold">0.00</div>
                          </div>
                        </div>

                        {/* Big Green 0.00 */}
                        <div className="text-right text-2xl font-mono font-bold text-[#00FF66] tracking-wider pt-0.5">
                          0.00
                        </div>
                      </div>
                    </div>

                    {/* Top 4 Horizontal Function Keys */}
                    <div className="grid grid-cols-4 bg-[#C2CAD0] border-b-2 border-gray-400 text-center">
                      <div className="p-1 border-r border-gray-400 flex flex-col items-center justify-center">
                        <div className="w-0 h-0 border-x-4 border-x-transparent border-b-[8px] border-b-[#16A34A] mb-0.5"></div>
                        <span className="text-[9px] font-bold text-gray-800">F11</span>
                      </div>
                      <div className="p-1 border-r border-gray-400 flex flex-col items-center justify-center">
                        <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[8px] border-t-[#16A34A] mb-0.5"></div>
                        <span className="text-[9px] font-bold text-gray-800">F12</span>
                      </div>
                      <div className="p-1 border-r border-gray-400 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-gray-900 leading-none">CSA ON/OFF</span>
                        <span className="text-[8px] font-bold text-[#1D4ED8]">F10</span>
                      </div>
                      <div className="p-1 flex flex-col items-center justify-center bg-gray-200">
                        <span className="text-[9px] font-bold text-gray-900 leading-none">Lookup</span>
                        <span className="text-[8px] font-bold text-[#1D4ED8]">F2</span>
                      </div>
                    </div>

                    {/* Table Headers */}
                    <div className="bg-[#B8C2CC] border-b border-gray-400 px-1 py-0.5 text-[9px] font-bold text-gray-800 grid grid-cols-12 text-center uppercase tracking-tight">
                      <span className="col-span-1 text-left">LN</span>
                      <span className="col-span-3 text-left">UPC</span>
                      <span className="col-span-4 text-left">Description</span>
                      <span className="col-span-1">Qty</span>
                      <span className="col-span-1 text-right">SRP</span>
                      <span className="col-span-1 text-right">Amount</span>
                      <span className="col-span-1 text-right">Type</span>
                    </div>

                    {/* Line Item Screen Page (Empty Grid Canvas) */}
                    <div className="flex-1 bg-white p-2 flex items-center justify-center text-gray-400 italic text-[11px] font-mono">
                      Line item screen page
                    </div>
                  </div>

                  {/* Right 2 Columns: Red and Silver Function Buttons Column */}
                  <div className="col-span-2 bg-[#9AA5B1] p-1 flex flex-col justify-between space-y-1">
                    <div className="bg-[#D2D7DF] p-1 text-center border border-gray-400 shadow-sm">
                      <div className="text-[9px] font-bold text-gray-900 leading-none">Quantity</div>
                      <div className="text-[9px] font-bold text-[#1D4ED8]">F3</div>
                    </div>

                    <div className="bg-[#E4002B] p-1 text-center border border-red-700 shadow-sm text-white">
                      <div className="text-[9px] font-bold leading-none">Payment</div>
                      <div className="text-[9px] font-bold text-yellow-300">F4</div>
                    </div>

                    <div className="bg-[#D2D7DF] p-1 text-center border border-gray-400 shadow-sm">
                      <div className="text-[9px] font-bold text-gray-900 leading-none">Option</div>
                      <div className="text-[9px] font-bold text-[#1D4ED8]">F5</div>
                    </div>

                    <div className="bg-[#D2D7DF] p-1 text-center border border-gray-400 shadow-sm">
                      <div className="text-[9px] font-bold text-gray-900 leading-none">Non Mdse</div>
                      <div className="text-[9px] font-bold text-[#1D4ED8]">F6</div>
                    </div>

                    <div className="bg-[#E4002B] p-1 text-center border border-red-700 shadow-sm text-white">
                      <div className="text-[9px] font-bold leading-none">Item Void</div>
                      <div className="text-[9px] font-bold text-yellow-300">F7</div>
                    </div>

                    <div className="bg-[#E4002B] p-1 text-center border border-red-700 shadow-sm text-white">
                      <div className="text-[9px] font-bold leading-none">Trx Void</div>
                      <div className="text-[9px] font-bold text-yellow-300">F8</div>
                    </div>

                    <div className="bg-[#E4002B] p-1 text-center border border-red-700 shadow-sm text-white">
                      <div className="text-[9px] font-bold leading-none">Suspend</div>
                      <div className="text-[9px] font-bold text-yellow-300">F9</div>
                    </div>

                    <div className="text-center font-mono text-[8px] text-gray-700 pt-0.5">
                      Page: 0/0
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Footer Bar */}
                <div className="bg-[#B0B8C0] border-t-2 border-gray-500 grid grid-cols-12 text-[10px] font-sans items-stretch">
                  <div className="col-span-4 bg-[#FFF275] border-r border-gray-500 px-2 py-1 flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total Qty</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 border border-gray-400 text-gray-900">
                      0
                    </span>
                  </div>

                  <div className="col-span-4 bg-[#16A34A] border-r border-gray-500 px-2 py-1 flex items-center justify-between text-white">
                    <span className="font-bold">Total Sales:</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 border border-gray-400 text-gray-900">
                      0.00
                    </span>
                  </div>

                  <div className="col-span-2 bg-[#C2CAD0] border-r border-gray-500 px-1 py-1 flex items-center justify-center font-bold text-gray-800 text-[9px]">
                    2026-Feb-12
                  </div>

                  <div className="col-span-2 bg-[#C2CAD0] px-1 py-1 flex items-center justify-center font-bold text-gray-800 text-[9px]">
                    09:04:03 AM
                  </div>
                </div>

                {/* Overlay Prompt on Hover */}
                <div className="bg-gray-900 text-white py-2 px-4 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 group-hover:bg-[#E4002B] transition-colors">
                  {user ? (
                    <>
                      <Monitor className="w-4 h-4" />
                      <span>Click to Open Interactive POS Simulator</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Cashier Login Required to Open Terminal</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
              Three-Step Employee Mastery Path
            </h2>
            <p className="mt-2 text-gray-600">
              Designed specifically for fast onboarding of branch cashiers without risking live inventory or financial records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-200 p-6 space-y-4 hover:border-[#E4002B] transition-colors">
              <div className="w-12 h-12 bg-red-50 text-[#E4002B] flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase">1. Study Lessons</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Learn official procedures from the 120-slide cashier curriculum. Step-by-step instructions, slide references, and exact keyboard callouts.
              </p>
            </div>

            <div className="border border-gray-200 p-6 space-y-4 hover:border-[#E4002B] transition-colors">
              <div className="w-12 h-12 bg-red-50 text-[#E4002B] flex items-center justify-center font-bold">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase">2. Practice Simulator</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Interact with the full POS keyboard and on-screen function buttons across Main, 2nd, 3rd, 4th, and Payment screens with synthetic products.
              </p>
            </div>

            <div className="border border-gray-200 p-6 space-y-4 hover:border-[#E4002B] transition-colors">
              <div className="w-12 h-12 bg-red-50 text-[#E4002B] flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase">3. Practical Assessment</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Complete realistic retail transactions against automated step checks. Track mistakes, view instant feedback, and certify cashier readiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-white text-base">NATIONAL BOOK STORE</span>
            <span>• Employee Training Portal</span>
          </div>
          <div>
            Isolated Synthetic Sandbox • For Training & Onboarding Purposes Only
          </div>
        </div>
      </footer>

      {/* Cashier Authentication Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border-4 border-gray-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-[#E4002B]">
              <Lock className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                Cashier Login Required
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Access to the interactive POS Terminal Simulator is restricted to authenticated NBS cashiers and trainees. Please sign in with your Google account or continue using Local Demo Mode.
            </p>

            <div className="space-y-3 pt-2">
              <Button
                onClick={signInWithGoogle}
                className="w-full py-3 bg-[#E4002B] hover:bg-[#C10024] text-white font-bold flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  enterDemoMode();
                  setShowAuthModal(false);
                  router.push("/simulator");
                }}
                className="w-full py-3 border-gray-400 text-gray-800 font-bold flex items-center justify-center space-x-2"
              >
                <span>Continue in Local Demo Mode</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowAuthModal(false)}
                className="w-full text-xs text-gray-500 hover:text-gray-900 font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
