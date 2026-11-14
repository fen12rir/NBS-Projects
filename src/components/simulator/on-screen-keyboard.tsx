"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ArrowBigUp, ArrowBigUpDash, ChevronDown, CornerDownLeft, Delete, Smartphone } from "lucide-react";

/**
 * In-app on-screen keyboard used on touch devices.
 *
 * Why: iPhones with Rotation Lock keep the native keyboard in portrait even when the
 * POS is CSS-rotated to landscape (web pages cannot override the OS orientation lock),
 * the native keyboard resizes the viewport (shrink/jump/cut-off) and iOS always shows
 * the AutoFill (password / card / location) bar. This keyboard renders inside the
 * (rotated) app layer, so it is always landscape when the POS is landscape, never
 * resizes the viewport, and never shows the AutoFill bar (inputs get inputmode="none").
 */

type EditableEl = HTMLInputElement | HTMLTextAreaElement;

const NON_TEXT_INPUT_TYPES = new Set([
  "checkbox",
  "radio",
  "range",
  "file",
  "button",
  "submit",
  "reset",
  "hidden",
  "color",
  "image",
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
]);

export function isTextEditable(el: Element | null): el is EditableEl {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    return !NON_TEXT_INPUT_TYPES.has((el.type || "text").toLowerCase()) && !el.readOnly && !el.disabled;
  }
  return false;
}

function getActiveEditable(): EditableEl | null {
  if (typeof document === "undefined") return null;
  const el = document.activeElement;
  return isTextEditable(el) ? el : null;
}

function setNativeValue(el: EditableEl, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
  // React listens to the native "input" event for onChange
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function getSelectionRange(el: EditableEl): [number, number] {
  try {
    const s = el.selectionStart;
    const e = el.selectionEnd;
    if (s === null || e === null) throw new Error("no selection");
    return [s, e];
  } catch {
    return [el.value.length, el.value.length];
  }
}

function setCaret(el: EditableEl, pos: number) {
  try {
    el.setSelectionRange(pos, pos);
  } catch {
    /* type=number etc. do not support selection */
  }
}

/** Fires a cancelable keydown on the element (bubbles to React + window handlers like a real key). */
function fireKeyDown(el: Element, key: string): boolean {
  const evt = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  el.dispatchEvent(evt);
  return !evt.defaultPrevented;
}

function insertText(text: string) {
  const el = getActiveEditable();
  if (!el) return;
  if (!fireKeyDown(el, text)) return;
  const [s, e] = getSelectionRange(el);
  const next = el.value.slice(0, s) + text + el.value.slice(e);
  if (el.maxLength > 0 && next.length > el.maxLength) return;
  if (el instanceof HTMLInputElement && el.type === "number" && !/^-?\d*\.?\d*$/.test(next)) return;
  setNativeValue(el, next);
  setCaret(el, s + text.length);
}

function backspace() {
  const el = getActiveEditable();
  if (!el) return;
  if (!fireKeyDown(el, "Backspace")) return;
  const [s, e] = getSelectionRange(el);
  if (s === 0 && e === 0) return;
  const from = s === e ? s - 1 : s;
  const next = el.value.slice(0, from) + el.value.slice(e);
  setNativeValue(el, next);
  setCaret(el, from);
}

function pressEnter() {
  const el = getActiveEditable();
  if (!el) return;
  if (!fireKeyDown(el, "Enter")) return;
  if (el instanceof HTMLTextAreaElement) {
    insertText("\n");
    return;
  }
  // Mimic native implicit form submission
  const form = el.form;
  if (form) {
    if (typeof form.requestSubmit === "function") form.requestSubmit();
    else form.submit();
  }
}

function focusNextField() {
  const el = getActiveEditable();
  if (!el) return;
  if (!fireKeyDown(el, "Tab")) return;
  const fields = Array.from(document.querySelectorAll<HTMLElement>("input, textarea")).filter(
    (f) => isTextEditable(f) && f.offsetParent !== null
  );
  const idx = fields.indexOf(el);
  const next = fields[idx + 1] || fields[0];
  if (next && next !== el) next.focus();
}

const LETTER_ROWS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
const SYMBOL_ROWS = ["1234567890", "@#₱&*()-+/", ".,:;'\"!?_=", "%$<>[]"];

export interface OnScreenKeyboardProps {
  compact?: boolean;
  onHide: () => void;
  onUseDeviceKeyboard: () => void;
}

export interface OnScreenKeyboardHandle {
  getHeight: () => number;
}

export const OnScreenKeyboard = forwardRef<OnScreenKeyboardHandle, OnScreenKeyboardProps>(function OnScreenKeyboard(
  { compact = false, onHide, onUseDeviceKeyboard },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<"letters" | "symbols">("letters");
  const [shift, setShift] = useState<"off" | "on" | "lock">("off");
  const shiftRef = useRef(shift);
  shiftRef.current = shift;
  const actionsRef = useRef({ onHide, onUseDeviceKeyboard });
  actionsRef.current = { onHide, onUseDeviceKeyboard };

  useImperativeHandle(ref, () => ({
    getHeight: () => rootRef.current?.offsetHeight ?? 0,
  }));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let repeatDelay: ReturnType<typeof setTimeout> | null = null;
    let repeatTimer: ReturnType<typeof setInterval> | null = null;

    const stopRepeat = () => {
      if (repeatDelay) clearTimeout(repeatDelay);
      if (repeatTimer) clearInterval(repeatTimer);
      repeatDelay = null;
      repeatTimer = null;
    };

    const runKey = (key: string) => {
      switch (key) {
        case "__shift":
          setShift((s) => (s === "off" ? "on" : s === "on" ? "lock" : "off"));
          return;
        case "__layer":
          setLayer((l) => (l === "letters" ? "symbols" : "letters"));
          return;
        case "__back":
          backspace();
          return;
        case "__enter":
          pressEnter();
          return;
        case "__tab":
          focusNextField();
          return;
        case "__space":
          insertText(" ");
          return;
        case "__hide":
          actionsRef.current.onHide();
          return;
        case "__device":
          actionsRef.current.onUseDeviceKeyboard();
          return;
        default: {
          const upper = shiftRef.current !== "off";
          insertText(upper ? key.toUpperCase() : key);
          if (shiftRef.current === "on") setShift("off");
        }
      }
    };

    // Native listeners so we can preventDefault: keeps focus (and caret) in the POS input
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-osk-key]");
      if (!btn) return;
      const key = btn.dataset.oskKey || "";
      btn.dataset.pressed = "true";
      runKey(key);
      if (key === "__back") {
        repeatDelay = setTimeout(() => {
          repeatTimer = setInterval(backspace, 70);
        }, 420);
      }
    };
    const handlePointerUp = () => {
      stopRepeat();
      root.querySelectorAll<HTMLElement>("[data-pressed]").forEach((b) => delete b.dataset.pressed);
    };
    const preventDefault = (e: Event) => e.preventDefault();

    root.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    root.addEventListener("touchstart", preventDefault, { passive: false });
    root.addEventListener("touchend", preventDefault, { passive: false });
    root.addEventListener("mousedown", preventDefault);
    root.addEventListener("contextmenu", preventDefault);
    return () => {
      stopRepeat();
      root.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      root.removeEventListener("touchstart", preventDefault);
      root.removeEventListener("touchend", preventDefault);
      root.removeEventListener("mousedown", preventDefault);
      root.removeEventListener("contextmenu", preventDefault);
    };
  }, []);

  const rows = layer === "letters" ? LETTER_ROWS : SYMBOL_ROWS;
  const upper = shift !== "off" && layer === "letters";
  const keyH = compact ? "h-[30px]" : "h-10";
  const keyText = compact ? "text-[13px]" : "text-base";
  const base = `${keyH} ${keyText} rounded-md font-semibold flex items-center justify-center select-none touch-none transition-colors data-[pressed=true]:bg-emerald-600 data-[pressed=true]:text-white`;
  const charKey = `${base} flex-1 min-w-0 bg-[#3a3f47] text-white shadow-[0_1px_0_#111]`;
  const fnKey = `${base} bg-[#23272e] text-gray-200 shadow-[0_1px_0_#111]`;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="On-screen keyboard"
      className={`w-full bg-[#14171c]/98 border-t border-emerald-800/70 shadow-[0_-6px_18px_rgba(0,0,0,0.6)] select-none touch-none ${
        compact ? "px-1.5 pt-1 pb-1" : "px-1 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))]"
      }`}
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      <div className={`mx-auto flex flex-col ${compact ? "gap-1 max-w-[760px]" : "gap-1.5 max-w-[640px]"}`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <button type="button" data-osk-key="__tab" className="px-2 py-0.5 rounded bg-[#23272e] text-gray-200 font-bold">
              TAB
            </button>
            <button
              type="button"
              data-osk-key="__device"
              className="px-2 py-0.5 rounded bg-[#23272e] text-gray-300 flex items-center gap-1"
              title="Use the phone's own keyboard instead"
            >
              <Smartphone className="w-3 h-3" /> Phone keyboard
            </button>
          </div>
          <button
            type="button"
            data-osk-key="__hide"
            className="px-2 py-0.5 rounded bg-[#23272e] text-gray-200 flex items-center gap-1 font-bold"
            aria-label="Hide keyboard"
          >
            Hide <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {rows.slice(0, 3).map((row, i) => (
          <div key={`${layer}-${i}`} className={`flex ${compact ? "gap-1" : "gap-[5px]"} ${i === 2 && layer === "letters" ? "px-[5%]" : ""}`}>
            {row.split("").map((ch) => (
              <button key={ch} type="button" data-osk-key={ch} className={charKey}>
                {upper ? ch.toUpperCase() : ch}
              </button>
            ))}
          </div>
        ))}

        <div className={`flex ${compact ? "gap-1" : "gap-[5px]"}`}>
          {layer === "letters" ? (
            <button
              type="button"
              data-osk-key="__shift"
              aria-label="Shift"
              className={`${fnKey} w-[13%] ${shift !== "off" ? "!bg-gray-100 !text-gray-900" : ""}`}
            >
              {shift === "lock" ? <ArrowBigUpDash className="w-4 h-4" /> : <ArrowBigUp className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-[13%]" />
          )}
          {rows[3].split("").map((ch) => (
            <button key={ch} type="button" data-osk-key={ch} className={charKey}>
              {upper ? ch.toUpperCase() : ch}
            </button>
          ))}
          <button type="button" data-osk-key="__back" aria-label="Backspace" className={`${fnKey} w-[13%]`}>
            <Delete className="w-4 h-4" />
          </button>
        </div>

        <div className={`flex ${compact ? "gap-1" : "gap-[5px]"}`}>
          <button type="button" data-osk-key="__layer" className={`${fnKey} w-[15%] text-xs`}>
            {layer === "letters" ? "?123" : "ABC"}
          </button>
          <button type="button" data-osk-key="-" className={`${fnKey} w-[8%]`}>
            -
          </button>
          <button type="button" data-osk-key="__space" aria-label="Space" className={`${charKey} text-xs text-gray-300`}>
            space
          </button>
          <button type="button" data-osk-key="." className={`${fnKey} w-[8%]`}>
            .
          </button>
          <button
            type="button"
            data-osk-key="__enter"
            aria-label="Enter"
            className={`${base} w-[22%] bg-emerald-700 text-white font-bold gap-1 text-xs`}
          >
            ENTER <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});
