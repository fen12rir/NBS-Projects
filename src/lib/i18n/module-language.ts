"use client";

import { useCallback, useEffect, useState } from "react";
import { Lesson, TrainingModule } from "@/data/modules";
import { LESSON_TRANSLATIONS_TL, MODULE_TRANSLATIONS_TL } from "@/data/modules-tl";

export type ModuleLanguage = "en" | "tl";

const STORAGE_KEY = "nbs_module_lang";
const EVENT_NAME = "nbs-module-lang-change";

export function useModuleLanguage() {
  const [lang, setLangState] = useState<ModuleLanguage>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "tl" || saved === "en") {
        setLangState(saved);
      }
    } catch {}

    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<ModuleLanguage>;
      if (custom.detail === "en" || custom.detail === "tl") {
        setLangState(custom.detail);
      }
    };
    window.addEventListener(EVENT_NAME, handleSync);
    return () => window.removeEventListener(EVENT_NAME, handleSync);
  }, []);

  const setLang = useCallback((next: ModuleLanguage) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    } catch {}
  }, []);

  return { lang, setLang };
}

export function getLocalizedModule(mod: TrainingModule, lang: ModuleLanguage): TrainingModule {
  if (lang !== "tl") return mod;
  const tl = MODULE_TRANSLATIONS_TL[mod.id];
  if (!tl) return mod;
  return {
    ...mod,
    title: tl.title,
    shortDesc: tl.shortDesc,
  };
}

export function getLocalizedLesson(lesson: Lesson, lang: ModuleLanguage): Lesson {
  if (lang !== "tl") return lesson;
  const tl = LESSON_TRANSLATIONS_TL[lesson.id];
  if (!tl) return lesson;

  return {
    ...lesson,
    title: tl.title,
    objective: tl.objective,
    instructions: tl.instructions,
    keyCallouts: tl.keyCallouts,
    visualAssets: lesson.visualAssets?.map((asset, idx) => ({
      ...asset,
      caption: tl.visualCaptions?.[idx] || asset.caption,
    })),
  };
}
