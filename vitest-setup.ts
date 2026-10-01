// jsdom ships no `matchMedia`. Some libraries (notably `svelte/motion`, whose
// `Tween`/`tweened` reads `prefers-reduced-motion` when the module loads) call
// it at import time — before any test's beforeEach can stub it. Provide a
// default here so importing such a module never throws. Tests that need to
// drive reduced-motion still reassign `window.matchMedia` in beforeEach.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom ships no `IntersectionObserver`. The `animateIn` action constructs one
// at mount, so any component test that renders scroll-revealed content would
// throw without it. A no-op default keeps those
// tests green; tests that need to DRIVE intersection reassign it in beforeEach.
if (typeof window !== "undefined" && typeof window.IntersectionObserver !== "function") {
  class NoopIntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver = NoopIntersectionObserver as unknown as typeof IntersectionObserver;
}

// jsdom ships no Web Animations API. Svelte's `in:`/`out:` transitions call
// `element.animate()` (the phone menu's IX2 slide), so a test that opens or
// closes the menu would throw without it. This stand-in finishes at once, so a
// transitioned element mounts and unmounts as if the transition were instant;
// the real curve is checked in a browser (tests/interaction/menu-and-gallery).
if (typeof Element !== "undefined" && typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = function () {
    const animation = {
      onfinish: null as null | (() => void),
      oncancel: null,
      currentTime: 0,
      playState: "finished",
      cancel() {},
      finish() {},
      pause() {},
      play() {},
      reverse() {},
      finished: Promise.resolve(),
      effect: null,
    };
    queueMicrotask(() => animation.onfinish?.());
    return animation as unknown as Animation;
  };
}
