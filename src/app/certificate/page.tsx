"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Certificate } from "@/components/certificates/certificate";
import { TRAINING_MODULES } from "@/data/modules";
import { Button } from "@/components/ui/button";
import {
  getLocalProgress,
  UserProgress,
} from "@/lib/progress/progress-store";
import { ArrowLeft, Download, Award, AlertCircle } from "lucide-react";

export default function CertificatePage() {
  const { user, isLoading } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  if (isLoading || progress === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-mono text-sm text-gray-500">
          Loading certificate...
        </div>
      </div>
    );
  }

  const totalLessons = TRAINING_MODULES.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const isCertified =
    totalLessons > 0 && progress.completedLessons.length >= totalLessons;

  if (!isCertified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 mx-auto max-w-3xl w-full p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Certificate Unavailable
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
            You must complete all {totalLessons} training lessons across the curriculum to unlock your official National Book Store Cashier Training Certificate.
          </p>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const completionDate = new Date(
    progress.certificationCompletedAt || Date.now()
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const downloadCertificate = async () => {
    if (!certificateRef.current) {
      setDownloadError("The certificate is not ready to download. Please try again.");
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDocument) => {
          const date = clonedDocument.querySelector<HTMLElement>(
            "[data-certificate-date]"
          );
          if (date) {
            date.style.top = "59%";
          }
        },
      });
      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageRatio = canvas.width / canvas.height;
      const pdfImageWidth = Math.min(pageWidth, pageHeight * imageRatio);
      const pdfImageHeight = pdfImageWidth / imageRatio;
      const left = (pageWidth - pdfImageWidth) / 2;
      const top = (pageHeight - pdfImageHeight) / 2;

      pdf.addImage(image, "PNG", left, top, pdfImageWidth, pdfImageHeight);
      pdf.save("cashier-training-certificate.pdf");
    } catch (error) {
      console.error("Failed to generate certificate PDF", error);
      setDownloadError("Unable to create the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      <main className="flex-1 mx-auto max-w-6xl w-full space-y-6 p-4 sm:p-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-50 text-[#E4002B] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Official Completion Certificate
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Awarded for completing all National Book Store POS Cashier Newbie Training modules.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={downloadCertificate}
            disabled={isDownloading}
            variant="primary"
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Generating PDF..." : "Download Certificate (PDF)"}
          </Button>
        </div>

        {downloadError && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        <div ref={certificateRef} className="border border-gray-300 shadow-md">
          <Certificate
            name={user?.name || "Maria Santos"}
            completionDate={completionDate}
          />
        </div>
      </main>
    </div>
  );
}
