"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Muestra un valor (ej. "+5,000", "4.9", "+3 años") animando el número de 0
 * al valor final cuando entra en pantalla. Conserva prefijo y sufijo.
 */
export default function AnimatedStat({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const m = String(value).match(/^(\D*)([\d.,]+)(.*)$/);
    if (!m) {
      setDisplay(value);
      return;
    }
    const prefix = m[1];
    const raw = m[2];
    const suffix = m[3];
    const decimals = (raw.split(".")[1] || "").length;
    const target = parseFloat(raw.replace(/,/g, ""));
    const hadComma = raw.includes(",");

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fmt = (n: number) => {
      let s = n.toFixed(decimals);
      if (hadComma) s = Number(s).toLocaleString("en-US", { minimumFractionDigits: decimals });
      return prefix + s + suffix;
    };

    if (reduce) {
      setDisplay(fmt(target));
      return;
    }

    setDisplay(fmt(0));
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const dur = 1300;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(fmt(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
