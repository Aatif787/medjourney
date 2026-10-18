import { useEffect } from "react";

/**
 * HyperMotion Engine
 * 1. Re-triggerable 3D scroll observer: triggers animations every time elements enter & leave view.
 * 2. 3D Spatial Tilt & Holographic Cursor Spotlight tracking for cards.
 */
export function initScrollMotion(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  // 1. Scroll-Triggered Reveal Observer (Re-triggers Every Single Time)
  let observer: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
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

    observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: [0, 0.1],
    });
  }

  function scanAndObserve() {
    if (!observer) return;
    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal], .reveal-on-scroll, [data-stagger]"
    );
    targets.forEach((target) => observer?.observe(target));
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

  // 2. Interactive 3D Card Tilt & Holographic Spotlight Tracker
  let activeCard: HTMLElement | null = null;
  let rafId: number | null = null;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  function updateCardTransform() {
    if (activeCard) {
      activeCard.style.setProperty("--mouse-x", `${targetMouseX}px`);
      activeCard.style.setProperty("--mouse-y", `${targetMouseY}px`);
      activeCard.style.setProperty("--tilt-x", `${targetTiltX.toFixed(2)}deg`);
      activeCard.style.setProperty("--tilt-y", `${targetTiltY.toFixed(2)}deg`);
    }
    rafId = null;
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return; // Keep mobile smooth without tilt distortion
    const card = (e.target as HTMLElement)?.closest<HTMLElement>(".motion-card, .hyper-card");
    if (!card) {
      if (activeCard) {
        activeCard.style.setProperty("--tilt-x", "0deg");
        activeCard.style.setProperty("--tilt-y", "0deg");
        activeCard = null;
      }
      return;
    }

    activeCard = card;
    const rect = card.getBoundingClientRect();
    targetMouseX = e.clientX - rect.left;
    targetMouseY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle, high-end 3D tilt physics (max 8.5 deg)
    targetTiltX = ((targetMouseY - centerY) / centerY) * -8.5;
    targetTiltY = ((targetMouseX - centerX) / centerX) * 8.5;

    if (!rafId) {
      rafId = requestAnimationFrame(updateCardTransform);
    }
  };

  const handlePointerLeave = () => {
    if (activeCard) {
      activeCard.style.setProperty("--tilt-x", "0deg");
      activeCard.style.setProperty("--tilt-y", "0deg");
      activeCard = null;
    }
  };

  document.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.addEventListener("pointerleave", handlePointerLeave, { passive: true });

  return () => {
    observer?.disconnect();
    mutationObserver.disconnect();
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerleave", handlePointerLeave);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/**
 * React hook to enable Apple-style scroll-triggered animations and 3D tilt.
 * Can be invoked in root or individual pages.
 */
export function useScrollMotion(dependencyKey?: string) {
  useEffect(() => {
    const cleanup = initScrollMotion();
    return cleanup;
  }, [dependencyKey]);
}
