import { useCallback, useEffect, useLayoutEffect } from "react";

/**
 * Fits a word or sentence to ~95% of its container's width.
 * Measures on a single line (nowrap), clamps to [minPx, maxPx], then restores
 * the element's own white-space so a clamped-at-minimum sentence can still
 * wrap gracefully instead of overflowing.
 */
export const useAutoFitFont = (
  ref: React.RefObject<HTMLElement>,
  text: string,
  maxPx: number,
  minPx: number,
) => {
  const adjust = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const container = el.parentElement;
    if (!container) return;
    const prevWhiteSpace = el.style.whiteSpace;
    el.style.whiteSpace = "nowrap";
    el.style.fontSize = "100px";
    const measured = el.scrollWidth;
    if (measured) {
      let size = ((container.clientWidth * 0.95) / measured) * 100;
      size = Math.max(minPx, Math.min(size, maxPx));
      el.style.fontSize = `${size}px`;
    }
    el.style.whiteSpace = prevWhiteSpace;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, maxPx, minPx]);

  useLayoutEffect(() => {
    adjust();
  }, [adjust]);

  useEffect(() => {
    window.addEventListener("resize", adjust);
    return () => window.removeEventListener("resize", adjust);
  }, [adjust]);

  // The container's width can settle AFTER mount (e.g. the story banner sits
  // over a page image that is still loading, so the first measurement sees a
  // near-zero container and clamps the text to minimum). Re-fit whenever the
  // container's size actually changes.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const container = el.parentElement;
    if (!container) return;
    const ro = new ResizeObserver(() => adjust());
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjust]);
};
