import { useEffect } from "react";

/**
 * Apple-grade Scroll Motion Controller
 * Observes elements with [data-reveal] and [data-stagger].
 * Re-triggers every time elements enter and leave the viewport (not just once).
 */
export function initScrollMotion(): () => void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return () => {};
  }

  const observerCallback: IntersectionObserverCallback = (entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        el.classList.add("in-view");
      } else {
        // Re-trigger every time: remove in-view when out of viewport so animation replays on scroll
        el.classList.remove("in-view");
      }
    }
  };

  const observer = new IntersectionObserver(observerCallback, {
    root: null,
    rootMargin: "0px 0px -40px 0px",
    threshold: [0, 0.12],
  });

  function scanAndObserve() {
    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal], .reveal-on-scroll, [data-stagger]"
    );
    targets.forEach((target) => observer.observe(target));
  }

  // Initial scan
  scanAndObserve();

  // Re-scan when DOM changes (e.g. route transitions, dynamic data)
  const mutationObserver = new MutationObserver(() => {
    scanAndObserve();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
  };
}

/**
 * React hook to enable Apple-style scroll-triggered animations.
 * Can be invoked in root or individual pages.
 */
export function useScrollMotion(dependencyKey?: string) {
  useEffect(() => {
    const cleanup = initScrollMotion();
    return cleanup;
  }, [dependencyKey]);
}
