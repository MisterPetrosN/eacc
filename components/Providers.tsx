"use client";

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <WhatsAppButton />
    </LanguageProvider>
  );
}
