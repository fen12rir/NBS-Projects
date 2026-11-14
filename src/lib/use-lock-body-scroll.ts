"use client";

import { useEffect } from "react";

let activeLockCount = 0;
let savedBodyOverflow = "";
let savedHtmlOverflow = "";
let savedBodyOverscroll = "";
let savedMainOverflows: Array<{ el: HTMLElement; overflowY: string }> = [];

export function useLockBodyScroll(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked || typeof document === "undefined") return;

    if (activeLockCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      savedHtmlOverflow = document.documentElement.style.overflow;
      savedBodyOverscroll = document.body.style.overscrollBehavior;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";

      const mains = Array.from(document.querySelectorAll("main")) as HTMLElement[];
      savedMainOverflows = mains.map((el) => ({
        el,
        overflowY: el.style.overflowY,
      }));
      mains.forEach((el) => {
        el.style.overflowY = "hidden";
      });
    }

    activeLockCount += 1;

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);
      if (activeLockCount === 0 && typeof document !== "undefined") {
        document.body.style.overflow = savedBodyOverflow;
        document.documentElement.style.overflow = savedHtmlOverflow;
        document.body.style.overscrollBehavior = savedBodyOverscroll;
        savedMainOverflows.forEach(({ el, overflowY }) => {
          el.style.overflowY = overflowY;
        });
        savedMainOverflows = [];
      }
    };
  }, [isLocked]);
}
