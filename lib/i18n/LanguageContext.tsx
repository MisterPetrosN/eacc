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
  t: (key: string, params?: Record<string, string>) => string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "eacc-language";
const IP_CACHE_KEY = "eacc-detected-country";
const LANGUAGES: Language[] = ["EN", "RW", "FR", "SW"];

// Native language names for display
export const LANGUAGE_NAMES: Record<Language, string> = {
  EN: "English",
  RW: "Kinyarwanda",
  FR: "Français",
  SW: "Kiswahili",
};

// Country to default language mapping
const COUNTRY_LANGUAGE_MAP: Record<string, Language> = {
  RW: "RW", // Rwanda → Kinyarwanda
  CD: "FR", // DRC → Français
  TZ: "SW", // Tanzania → Kiswahili
  KE: "SW", // Kenya → Kiswahili
  UG: "EN", // Uganda → English
};

const translations: Record<Language, Translations> = {
  EN: en,
  RW: rw,
  FR: fr,
  SW: sw,
};

// ============================================================================
// IP DETECTION
// ============================================================================

async function detectCountryFromIP(): Promise<string | null> {
  // Check cache first
  const cached = localStorage.getItem(IP_CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    // Use ipapi.co free tier (no API key needed, 1000 req/day)
    const response = await fetch("https://ipapi.co/country/", {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!response.ok) {
      return null;
    }

    const country = await response.text();

    // Cache the result
    if (country && country.length === 2) {
      localStorage.setItem(IP_CACHE_KEY, country);
      return country;
    }

    return null;
  } catch {
    // Silently fail - IP detection is a nice-to-have
    return null;
  }
}

function getDefaultLanguageForCountry(country: string | null): Language {
  if (!country) return "EN";
  return COUNTRY_LANGUAGE_MAP[country] || "EN";
}

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

  // Load language from localStorage on mount, or detect from IP
  useEffect(() => {
    const initLanguage = async () => {
      // Check if user has manually set a preference
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && LANGUAGES.includes(saved)) {
        setLanguageState(saved);
        setMounted(true);
        return;
      }

      // No saved preference - detect from IP
      const country = await detectCountryFromIP();
      const detectedLanguage = getDefaultLanguageForCountry(country);
      setLanguageState(detectedLanguage);
      setMounted(true);
    };

    initLanguage();
  }, []);

  // Save language to localStorage when user manually changes it
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
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
        value={{ language: "EN", setLanguage, t }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
