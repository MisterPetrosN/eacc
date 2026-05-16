"use client";

import { useCallback, useState, useEffect } from "react";
import {
  speak,
  stopSpeaking,
  isSpeaking as checkIsSpeaking,
  speakKigaliAverage,
  speakCommodityPrice,
  type SupportedLanguage,
} from "@/lib/voiceUtils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { language } = useLanguage();

  // Poll speaking state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(checkIsSpeaking());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const speakText = useCallback(async (text: string, lang?: SupportedLanguage) => {
    try {
      setIsSpeaking(true);
      await speak(text, lang || language);
    } catch (error) {
      console.error('[useSpeech] Error:', error);
    }
  }, [language]);

  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // Speak a single commodity price at a specific spot
  const speakPrice = useCallback(
    async (
      spotName: string,
      commodity: string,
      price: number | null,
      currency: string,
      unit: 'kg' | 'L' = 'kg'
    ) => {
      try {
        setIsSpeaking(true);
        await speakCommodityPrice(
          spotName,
          commodity,
          price,
          currency,
          unit,
          language
        );
      } catch (error) {
        console.error('[useSpeech] Error:', error);
      }
    },
    [language]
  );

  // Speak Kigali city average (for HeroCard)
  const speakAverage = useCallback(
    async (
      commodityId: string,
      price: number | null,
      unit: 'kg' | 'L' = 'kg'
    ) => {
      try {
        setIsSpeaking(true);
        await speakKigaliAverage(
          commodityId,
          price,
          unit,
          language
        );
      } catch (error) {
        console.error('[useSpeech] Error:', error);
      }
    },
    [language]
  );

  return {
    speak: speakText,
    stop,
    speakPrice,
    speakAverage,
    isSpeaking,
  };
}
