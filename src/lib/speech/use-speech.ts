"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function normalizePosSpeechText(raw: string): string {
  return raw
    .replace(/₱\s*/g, "pesos ")
    .replace(/->|→/g, " then ")
    .replace(/\bNon[-\s]?Mdse\b/gi, "Non Merchandise")
    .replace(/\bTrx\b/gi, "Transaction")
    .replace(/\bQty\b/gi, "Quantity")
    .replace(/\bSKU\b/g, "S K U")
    .replace(/\bSRP\b/g, "S R P")
    .replace(/\s+/g, " ")
    .trim();
}

export function useSpeech() {
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        typeof SpeechSynthesisUtterance !== "undefined"
    );
    return () => {
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, lang: "en-US" | "fil-PH" = "en-US") => {
      if (!speechSupported || !text.trim()) return;

      const normalized = normalizePosSpeechText(text);
      if (!normalized) return;

      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }

      window.speechSynthesis.cancel();

      // Defer speak slightly after cancel() to avoid iOS Safari / mobile Chrome dropping the utterance
      speakTimerRef.current = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(normalized);
        utterance.lang = lang;
        utterance.rate = 0.98;

        const voices = window.speechSynthesis.getVoices?.() || [];
        if (lang === "fil-PH") {
          const filVoice = voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith("fil") ||
              v.lang.toLowerCase().startsWith("tl")
          );
          if (filVoice) utterance.voice = filVoice;
        }

        utterance.onend = () => {
          utteranceRef.current = null;
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          utteranceRef.current = null;
          setIsSpeaking(false);
        };

        utteranceRef.current = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }, 30);
    },
    [speechSupported]
  );

  return { speechSupported, isSpeaking, speak, stop };
}
