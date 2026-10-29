"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Certificate } from "@/components/certificates/certificate";
import { TRAINING_MODULES } from "@/data/modules";
import {
  getLocalProgress,
  UserProgress,
} from "@/lib/progress/progress-store";

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
        Loading certificate...
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
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="mx-auto max-w-3xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Certificate unavailable
          </h1>
          <p className="mt-2 text-gray-600">
            Complete all training lessons to access your certificate.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block font-bold text-emerald-700 hover:underline"
          >
            Return to Dashboard
          </Link>
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="mx-auto max-w-6xl space-y-4 p-4 sm:p-8">
        <Link
          href="/dashboard"
          className="inline-block font-bold text-emerald-700 hover:underline"
        >
          Back to Dashboard
        </Link>

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Your Certificate</h1>
          <button
            type="button"
            onClick={downloadCertificate}
            disabled={isDownloading}
            className="rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? "Creating PDF..." : "Download PDF"}
          </button>
        </div>
        {downloadError && (
          <p role="alert" className="text-sm text-red-700">
            {downloadError}
          </p>
        )}
        <div ref={certificateRef}>
          <Certificate
            name={user?.name || "Maria Santos"}
            completionDate={completionDate}
          />
        </div>
      </main>
    </div>
  );
}