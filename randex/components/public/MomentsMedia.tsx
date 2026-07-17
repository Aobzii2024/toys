"use client";

import { useEffect, useMemo } from "react";

type Props = {
  images: string[];
};

/**
 * WeChat Moments image grid + Spotlight lightbox
 * (same viewer as love-list / photos pages).
 */
export function MomentsMedia({ images }: Props) {
  const list = useMemo(() => images.filter(Boolean).slice(0, 9), [images]);
  const allCount = images.filter(Boolean).length;

  useEffect(() => {
    // Ensure Spotlight picks up dynamically rendered images
    try {
      document
        .querySelectorAll(".moments-media img")
        .forEach((img) => img.classList.add("spotlight"));
    } catch {
      /* optional */
    }
  }, [list]);

  if (list.length === 0) return null;

  const n = list.length;
  const gridClass = n === 1 ? "m1" : n === 2 || n === 4 ? "m2" : "m3";

  return (
    <div className={`moments-media ${gridClass}`} data-count={n}>
      {list.map((url, i) => (
        <div className="moments-media-item" key={`${url}-${i}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            loading="lazy"
            className="spotlight"
          />
          {i === 8 && allCount > 9 ? (
            <span className="moments-media-overflow">+{allCount - 9}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
