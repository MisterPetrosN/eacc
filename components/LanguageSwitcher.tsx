"use client";

import { useLanguage, Language, LANGUAGE_NAMES } from "@/lib/i18n/LanguageContext";

// ============================================================================
// CONSTANTS
// ============================================================================

const LANGUAGES: Language[] = ["EN", "RW", "FR", "SW"];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="Select language"
    >
      {LANGUAGES.map((lang) => {
        const isActive = language === lang;
        const name = LANGUAGE_NAMES[lang];

        return (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            role="radio"
            aria-checked={isActive}
            className={`
              px-4 py-2 rounded-full text-[14px] font-normal
              transition-all duration-150 ease-out
              min-h-[44px] min-w-[44px]
              ${
                isActive
                  ? "bg-[#EF9F27] text-[#4A1B0C]"
                  : "bg-[#FAF6EE] border border-[#E8DCC4] text-gray-600 hover:border-[#D4C4A8] hover:bg-[#F5EDE0]"
              }
            `}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
