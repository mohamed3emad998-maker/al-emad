"use client";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Counter({ value, digits }: { value: number | null; digits: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (value === null || !inView) return;
    if (reduce) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  // No real figure entered yet -> show the design placeholder, e.g. [00]
  if (value === null) return <span ref={ref}>[{"0".repeat(digits)}]</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("en-US")}
    </span>
  );
}
