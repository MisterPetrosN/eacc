"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LanguageToggle() {
  const { language, cycleLanguage } = useLanguage();

  return (
    <button
      onClick={cycleLanguage}
      className="px-3 py-1.5 rounded-full text-[13px] font-bold transition-all
        bg-[#FAF6EE] border border-[#E8DCC4] text-[#4A1B0C]
        hover:bg-[#F5EDE0] hover:border-[#D4C4A8] active:scale-95"
      aria-label={`Current language: ${language}. Click to change.`}
    >
      {language}
    </button>
  );
}
