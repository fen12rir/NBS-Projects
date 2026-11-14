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
  return pickBestVoice(voices, "fil-PH");
}

// Robotic / novelty voices (mostly Apple "Eloquence" & effect voices) that should never be used
const ROBOTIC_VOICE_RE =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|pipe organ|ralph|superstar|trinoids|whisper|wobble|zarvox|fred|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley|espeak)\b/i;

// One consistent "character" across platforms: a warm US-English female voice
// (Edge: Aria/Jenny Natural, Apple: Ava/Zoe/Samantha, Chrome: Google US English, Android: Google en-US).
const PREFERRED_EN_NAMES = [
  "aria",
  "jenny",
  "ava",
  "zoe",
  "allison",
  "samantha",
  "susan",
  "emma",
  "michelle",
  "google us english",
];
const PREFERRED_FIL_NAMES = ["blessica", "rosa", "angelo"];
const MALE_NAME_RE = /\b(guy|davis|tony|jason|christopher|eric|roger|steffan|brian|andrew|aaron|evan|nathan|tom|alex|daniel|fred|ralph|male)\b/i;

function scoreVoice(v: SpeechSynthesisVoice, lang: "en-US" | "fil-PH"): number {
  const name = v.name.toLowerCase();
  const vLang = (v.lang || "").replace("_", "-").toLowerCase();
  if (ROBOTIC_VOICE_RE.test(name)) return -1000;

  let score = 0;
  if (lang === "fil-PH") {
    if (/^(fil|tl)\b/.test(vLang) || /filipino|tagalog/.test(name)) score += 200;
    else return -1000;
    PREFERRED_FIL_NAMES.forEach((n, i) => {
      if (name.includes(n)) score += 40 - i * 5;
    });
  } else {
    if (vLang === "en-us") score += 40;
    else if (vLang.startsWith("en")) score += 10;
    else return -1000;
    PREFERRED_EN_NAMES.forEach((n, i) => {
      if (name.includes(n)) score += 60 - i * 4;
    });
    if (MALE_NAME_RE.test(name)) score -= 30;
  }

  // Natural-sounding (neural / premium / cloud) voices first
  if (/natural|neural|premium|wavenet|studio/.test(name)) score += 120;
  if (/enhanced|online|network/.test(name)) score += 70;
  if (/google/.test(name)) score += 50;
  if (v.localService === false) score += 30;
  if (/compact|legacy/.test(name)) score -= 40;
  return score;
}

function pickBestVoice(voices: SpeechSynthesisVoice[], lang: "en-US" | "fil-PH"): SpeechSynthesisVoice | undefined {
  let best: SpeechSynthesisVoice | undefined;
  let bestScore = -Infinity;
  for (const v of voices) {
    const s = scoreVoice(v, lang);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return bestScore > -1000 ? best : undefined;
}

// Keep active utterance and timer at module scope so Chrome/Safari never garbage-collects it
// and input focus / layout transitions do not prematurely cancel ongoing speech.
let activeGlobalUtterance: SpeechSynthesisUtterance | null = null;
let globalSpeakTimer: ReturnType<typeof setTimeout> | null = null;

export function useSpeech() {
  const [speechSupported, setSpeechSupported] = useState(false);
  const [hasFilipinoVoice, setHasFilipinoVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    };
  }, []);

  const stop = useCallback(() => {
    if (globalSpeakTimer) {
      clearTimeout(globalSpeakTimer);
      globalSpeakTimer = null;
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

      if (globalSpeakTimer) {
        clearTimeout(globalSpeakTimer);
        globalSpeakTimer = null;
      }

      window.speechSynthesis.cancel();

      globalSpeakTimer = setTimeout(() => {
        globalSpeakTimer = null;
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        const utterance = new SpeechSynthesisUtterance(normalized);

        if (lang === "fil-PH" && filVoice) {
          utterance.voice = filVoice;
          utterance.lang = filVoice.lang;
          utterance.rate = 0.95;
        } else {
          const enVoice = pickBestVoice(window.speechSynthesis.getVoices?.() || [], "en-US");
          if (enVoice) {
            utterance.voice = enVoice;
            utterance.lang = enVoice.lang;
          } else {
            utterance.lang = "en-US";
          }
          utterance.rate = 1;
        }
        utterance.pitch = 1;

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
