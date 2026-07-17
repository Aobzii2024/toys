"use client";

import { useEffect } from "react";

/**
 * Port critical jQuery behaviors from original footer.php / head.php
 * so CSS-driven UI feels the same without requiring Pjax.
 */
export function PublicInteractions() {
  useEffect(() => {
    const onScroll = () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const wenan = document.querySelectorAll<HTMLElement>(".wenan");
      const alogo = document.querySelectorAll<HTMLElement>(".alogo");
      const color = scrollTop > 500 ? "#333333" : "rgb(97 97 97)";
      wenan.forEach((el) => {
        el.style.color = color;
      });
      alogo.forEach((el) => {
        el.style.color = color;
      });
    };

    const onCardClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const card = target.closest(".card, .card-b") as HTMLElement | null;
      if (!card) return;
      // Ignore if user already clicked a link
      if (target.closest("a")) return;
      const link = card.querySelector("a");
      if (link instanceof HTMLAnchorElement) {
        link.click();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onCardClick);
    onScroll();

    // Lazy-load / spotlight helpers if present (loaded via layout scripts)
    const w = window as unknown as {
      FunLazy?: (opts: Record<string, unknown>) => void;
      $?: (sel: string) => { addClass: (c: string) => void };
    };
    try {
      w.FunLazy?.({
        placeholder: "/style/img/Loading2.gif",
        effect: "show",
        strictLazyMode: false,
      });
    } catch {
      /* optional */
    }
    try {
      document
        .querySelectorAll(
          ".love_img img, .lovelist img, .little_texts img, .moments-media img",
        )
        .forEach((img) => img.classList.add("spotlight"));
    } catch {
      /* optional */
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onCardClick);
    };
  }, []);

  return null;
}
