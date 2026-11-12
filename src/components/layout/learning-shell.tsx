"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LearningSidebar } from "@/components/layout/learning-sidebar";

interface LearningShellProps {
  children: React.ReactNode;
  currentModuleId?: string;
  currentLessonId?: string;
}

export function LearningShell({
  children,
  currentModuleId,
  currentLessonId,
}: LearningShellProps) {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsSidebarCollapsedDesktop((prev) => !prev);
    } else {
      setIsSidebarOpenMobile((prev) => !prev);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <DashboardHeader
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={!isSidebarCollapsedDesktop}
        isMobileMenuOpen={isSidebarOpenMobile}
      />

      <div className="flex-1 flex min-h-0 relative overflow-hidden transition-all duration-300 ease-in-out">
        <LearningSidebar
          currentModuleId={currentModuleId}
          currentLessonId={currentLessonId}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          isCollapsedDesktop={isSidebarCollapsedDesktop}
          onToggleDesktop={() => setIsSidebarCollapsedDesktop(true)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
