"use client";

import { useEffect, useRef } from "react";

/** Antigravity-style animated dot field: an invisible violet grid revealed only
 *  inside a soft halo that follows the cursor. Ported from Priori_diseño.html. */
export function DotField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const GAP = 52, AMP = 9, DOT = 1.6;
    let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, raf = 0;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / GAP) + 2; rows = Math.ceil(H / GAP) + 2;
    };
    build();

    const REV = 215, REV2 = REV * REV, PUSH = 10;
    let mx = W * 0.5, my = H * 0.42, tmx = mx, tmy = my;
    const onMove = (e: MouseEvent) => { tmx = e.clientX; tmy = e.clientY; };
    window.addEventListener("resize", build, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });

    let t = 0;
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.007;
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = i * GAP - GAP + Math.sin(t + i * 0.6 + j * 0.3) * AMP + Math.cos(t * 0.5 + j * 0.7) * AMP * 0.6;
          let y = j * GAP - GAP + Math.cos(t * 0.8 + j * 0.6 + i * 0.3) * AMP + Math.sin(t * 0.45 + i * 0.7) * AMP * 0.6;
          const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
          if (d2 > REV2) continue;
          const d = Math.sqrt(d2), f = 1 - d / REV;
          const s = f * f * (3 - 2 * f);
          const inv = d ? 1 / d : 0;
          x += dx * inv * f * PUSH; y += dy * inv * f * PUSH;
          ctx.beginPath();
          ctx.arc(x, y, DOT + s * 0.8, 0, 6.2832);
          ctx.fillStyle = "rgba(110,60,255," + (s * 0.6).toFixed(3) + ")";
          ctx.fill();
        }
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas id="dotfield" ref={ref} aria-hidden="true" />;
}
