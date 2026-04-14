import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function RouteUXEnhancer() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target instanceof HTMLElement) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: "start", behavior: "smooth" });
          target.focus({ preventScroll: true });
        });
      }
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    requestAnimationFrame(() => {
      const main = document.querySelector("main");
      if (main instanceof HTMLElement) {
        main.focus({ preventScroll: true });
      }
    });
  }, [pathname, search, hash]);

  return null;
}

