"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Configuration Error",
      description: "There is a problem with the server configuration. Please contact support.",
    },
    AccessDenied: {
      title: "Access Denied",
      description: "Your email is not authorized to access the admin dashboard. Contact an administrator if you believe this is an error.",
    },
    Verification: {
      title: "Verification Error",
      description: "The verification link may have expired or already been used.",
    },
    Default: {
      title: "Authentication Error",
      description: "An error occurred during authentication. Please try again.",
    },
  };

  const errorInfo = errorMessages[error || ""] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#FCEBEB] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-[#A32D2D]" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-[var(--ink)] font-outfit mb-2">
          {errorInfo.title}
        </h1>
        <p className="text-sm text-gray-500 mb-8">{errorInfo.description}</p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full px-4 py-3 rounded-xl bg-[var(--green)] text-white text-sm font-medium hover:bg-[var(--green-mid)] transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="block w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.08)] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
