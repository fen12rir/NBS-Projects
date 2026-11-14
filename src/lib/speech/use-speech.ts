"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function normalizePosSpeechText(raw: string): string {
  return raw
    .replace(/₱\s*/g, "pesos ")
    .replace(/->|→/g, " then ")
    .replace(/\bNon[-\s]?Mdse\b/gi, "Non Merchandise")
    .replace(/\bTrx\b/gi, "Transaction")
    .replace(/\bQty\b/gi, "Quantity")
    .replace(/\bSKU\b/gi, "S K U")
    .replace(/\bSRP\b/gi, "S R P")
    .replace(/\s+/g, " ")
    .trim();
}

function findFilipinoVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find(
    (v) =>
      /^(fil|tl)\b/i.test(v.lang) ||
      /filipino|tagalog/i.test(v.name)
  );
}

// Keep active utterance at module scope so Chrome/Safari never garbage-collects it
// and input focus / layout transitions do not prematurely cancel ongoing speech.
let activeGlobalUtterance: SpeechSynthesisUtterance | null = null;

export function useSpeech() {
  const [speechSupported, setSpeechSupported] = useState(false);
  const [hasFilipinoVoice, setHasFilipinoVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined";

    setSpeechSupported(supported);
    if (!supported) return;

    const refreshVoices = () => {
      const voices = window.speechSynthesis.getVoices?.() || [];
      setHasFilipinoVoice(Boolean(findFilipinoVoice(voices)));
    };

    refreshVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", refreshVoices);
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
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
    activeGlobalUtterance = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, lang: "en-US" | "fil-PH" = "en-US") => {
      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        typeof SpeechSynthesisUtterance === "undefined" ||
        !text.trim()
      ) {
        return;
      }

      const normalized = normalizePosSpeechText(text);
      if (!normalized) return;

      const voices = window.speechSynthesis.getVoices?.() || [];
      const filVoice = lang === "fil-PH" ? findFilipinoVoice(voices) : undefined;
      if (lang === "fil-PH" && !filVoice) {
        return;
      }

      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }

      window.speechSynthesis.cancel();

      speakTimerRef.current = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(normalized);

        if (lang === "fil-PH" && filVoice) {
          utterance.voice = filVoice;
          utterance.lang = filVoice.lang;
          utterance.rate = 0.9;
        } else {
          utterance.lang = "en-US";
          utterance.rate = 0.98;
        }

        utterance.onend = () => {
          if (activeGlobalUtterance === utterance) {
            activeGlobalUtterance = null;
          }
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          if (activeGlobalUtterance === utterance) {
            activeGlobalUtterance = null;
          }
          setIsSpeaking(false);
        };

        activeGlobalUtterance = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }, 30);
    },
    []
  );

  return { speechSupported, hasFilipinoVoice, isSpeaking, speak, stop };
}
