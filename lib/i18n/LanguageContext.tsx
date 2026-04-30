"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Import translation files
import en from "@/locales/en.json";
import rw from "@/locales/rw.json";
import fr from "@/locales/fr.json";
import sw from "@/locales/sw.json";

// ============================================================================
// TYPES
// ============================================================================

export type Language = "EN" | "RW" | "FR" | "SW";

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  cycleLanguage: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "eacc-language";
const LANGUAGES: Language[] = ["EN", "RW", "FR", "SW"];

const translations: Record<Language, Translations> = {
  EN: en,
  RW: rw,
  FR: fr,
  SW: sw,
};

// ============================================================================
// CONTEXT
// ============================================================================

const LanguageContext = createContext<LanguageContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("EN");
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && LANGUAGES.includes(saved)) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // Cycle to next language: EN → RW → FR → SW → EN
  const cycleLanguage = () => {
    const currentIndex = LANGUAGES.indexOf(language);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    setLanguage(LANGUAGES[nextIndex]);
  };

  // Get nested translation by dot-notation key
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split(".");
    let value: TranslationValue = translations[language];

    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.EN;
        for (const fallbackKey of keys) {
          if (typeof value === "object" && value !== null && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in any language
          }
        }
        break;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Replace {param} placeholders
    if (params) {
      let result = value;
      for (const [param, replacement] of Object.entries(params)) {
        result = result.replace(`{${param}}`, replacement);
      }
      return result;
    }

    return value;
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{ language: "EN", setLanguage, cycleLanguage, t }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, cycleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
