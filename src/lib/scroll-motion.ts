import { useEffect } from "react";

/**
 * HyperMotion Engine
 * 1. Re-triggerable 3D scroll observer for section headers, grids, and cards.
 * 2. 3D Spatial Tilt & Holographic Cursor Spotlight tracking for cards.
 * 3. Scroll-Scrubbed 3D Double-Door Engine for intake section:
 *    (scrolling down closes the doors together, scrolling upward pushes them back out of screen).
 * 4. Scroll-Scrubbed Hero Panel Engine:
 *    (scrolling down away from top moves panel out, scrolling upward to top brings it back in and closes shut).
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

  // 2. Scroll-Linked Scrubbed 3D Double-Door Controller
  // Directly tied to user scroll: scrolling down brings doors in from off-screen,
  // and scrolling upward returns them back out of screen in real-time.
  let scrollDoorRaf: number | null = null;

  function updateScrollDoors() {
    const containers = document.querySelectorAll<HTMLElement>(
      ".door-container, [data-scroll-doors]"
    );
    if (!containers.length) return;

    const windowHeight = window.innerHeight;
    const isMobile = window.innerWidth < 1024;

    containers.forEach((container) => {
      const rect = container.getBoundingClientRect();
      const leftDoor = container.querySelector<HTMLElement>(".door-left");
      const rightDoor = container.querySelector<HTMLElement>(".door-right");
      if (!leftDoor || !rightDoor) return;

      // Start closing when section top reaches 96% of the screen height (entering bottom)
      // Fully closed when section top reaches 20% of screen height (centered view)
      const startY = windowHeight * 0.96;
      const endY = windowHeight * 0.20;

      const rawProgress = (startY - rect.top) / (startY - endY);
      const progress = Math.min(Math.max(rawProgress, 0), 1);

      // Smooth organic sine easing curve
      const eased = Math.sin((progress * Math.PI) / 2);
      const openFactor = 1 - eased;

      const xOffsetVw = openFactor * 100; // in vw (starts completely outside viewport)
      const rotateAngle = openFactor * (isMobile ? 26 : 52); // in deg
      const zOffset = openFactor * (isMobile ? -60 : -140); // in px
      const scale = 0.88 + eased * 0.12;
      const opacity = Math.min(eased * 1.5, 1);
      const blur = openFactor * 12;

      leftDoor.style.transform = `perspective(2000px) rotateY(${-rotateAngle}deg) translate3d(${-xOffsetVw}vw, 0, ${zOffset}px) scale(${scale})`;
      leftDoor.style.opacity = `${opacity}`;
      leftDoor.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";

      rightDoor.style.transform = `perspective(2000px) rotateY(${rotateAngle}deg) translate3d(${xOffsetVw}vw, 0, ${zOffset}px) scale(${scale})`;
      rightDoor.style.opacity = `${opacity}`;
      rightDoor.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";
    });
  }

  // 3. Scroll-Linked Scrubbed Hero Panel Controller
  // Scrolling down away from top moves hero panel out to the left
  // Scrolling up back to top brings hero panel in from the left and closes shut
  let hasScrolledHero = false;

  function bindHeroEntrance() {
    const heroPanel = document.querySelector<HTMLElement>(".home-hero-panel");
    if (!heroPanel) return;
    heroPanel.addEventListener(
      "animationend",
      () => {
        hasScrolledHero = true;
        heroPanel.style.animation = "none";
      },
      { once: true }
    );
  }
  bindHeroEntrance();

  function updateHeroScroll() {
    const heroPanel = document.querySelector<HTMLElement>(".home-hero-panel");
    if (!heroPanel) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (!hasScrolledHero && scrollY === 0) {
      // Let initial CSS entrance play on mount
      return;
    }
    hasScrolledHero = true;
    heroPanel.style.animation = "none"; // Hand off control to 1:1 scroll

    const isMobile = window.innerWidth < 1024;
    const maxScroll = isMobile ? 360 : 500;
    const rawProgress = 1 - scrollY / maxScroll;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    const eased = Math.sin((progress * Math.PI) / 2);
    const openFactor = 1 - eased;

    const xOffsetVw = openFactor * (isMobile ? 100 : 85);
    const rotateAngle = openFactor * (isMobile ? 28 : 50);
    const zOffset = openFactor * -140;
    const scale = 0.88 + eased * 0.12;
    const opacity = Math.min(eased * 1.3, 1);
    const blur = openFactor * 12;

    heroPanel.style.transform = `perspective(2000px) rotateY(${-rotateAngle}deg) translate3d(${-xOffsetVw}vw, 0, ${zOffset}px) scale(${scale})`;
    heroPanel.style.opacity = `${opacity}`;
    heroPanel.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";
    heroPanel.style.pointerEvents = openFactor > 0.75 ? "none" : "auto";
  }

  const handleScroll = () => {
    if (!scrollDoorRaf) {
      scrollDoorRaf = requestAnimationFrame(() => {
        updateScrollDoors();
        updateHeroScroll();
        scrollDoorRaf = null;
      });
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll, { passive: true });

  // Initial calculation
  updateScrollDoors();
  updateHeroScroll();

  // Re-scan when DOM changes (e.g. route transitions, dynamic data)
  const mutationObserver = new MutationObserver(() => {
    scanAndObserve();
    bindHeroEntrance();
    updateScrollDoors();
    updateHeroScroll();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 4. Interactive 3D Card Tilt & Holographic Spotlight Tracker
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
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerleave", handlePointerLeave);
    if (scrollDoorRaf) cancelAnimationFrame(scrollDoorRaf);
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
