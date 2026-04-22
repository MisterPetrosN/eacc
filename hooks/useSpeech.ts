"use client";

import { useCallback, useRef, useState } from "react";

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (voice) => voice.lang.startsWith("en-") && voice.name.includes("Female")
    ) || voices.find((voice) => voice.lang.startsWith("en-"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speakPrice = useCallback(
    (spotName: string, commodity: string, price: number | null, currency: string) => {
      if (!price) {
        speak(`No ${commodity} price available for ${spotName}`);
        return;
      }

      const formattedPrice =
        currency === "USD"
          ? `${price.toFixed(2)} US dollars`
          : `${Math.round(price)} ${currency}`;

      speak(`${commodity} price at ${spotName} is ${formattedPrice}`);
    },
    [speak]
  );

  return { speak, stop, speakPrice, isSpeaking };
}
