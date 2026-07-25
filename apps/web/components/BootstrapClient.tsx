"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    bootstrap?: {
      Dropdown: {
        getOrCreateInstance: (el: Element) => { show: () => void; hide: () => void };
      };
      Carousel: {
        getOrCreateInstance: (
          el: Element,
          options?: Record<string, unknown>
        ) => { cycle: () => void };
      };
      Modal: {
        getOrCreateInstance: (el: Element) => {
          show: () => void;
          hide: () => void;
        };
        getInstance: (el: Element) => { hide: () => void } | null;
      };
      Toast: new (
        el: Element,
        options?: { delay?: number }
      ) => { show: () => void };
    };
  }
}

export default function BootstrapClient() {
  useEffect(() => {
    const initHoverDropdowns = () => {
      if (!window.bootstrap?.Dropdown) return;

      document.querySelectorAll(".navbar .dropdown").forEach((dropdown) => {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        if (!toggle) return;

        const instance = window.bootstrap!.Dropdown.getOrCreateInstance(toggle);

        const onEnter = () => {
          if (window.innerWidth >= 992) instance.show();
        };
        const onLeave = () => {
          if (window.innerWidth >= 992) instance.hide();
        };

        dropdown.addEventListener("mouseenter", onEnter);
        dropdown.addEventListener("mouseleave", onLeave);
      });
    };

    initHoverDropdowns();
  }, []);

  return null;
}
