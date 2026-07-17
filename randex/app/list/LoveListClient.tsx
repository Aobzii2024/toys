"use client";

import { useState } from "react";

export type LoveListItemView = {
  id: number;
  title: string;
  done: boolean;
  imageUrl: string | null;
};

type Props = {
  items: LoveListItemView[];
};

export function LoveListClient({ items }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="lovelist">
      {items.map((item) => (
        <div key={item.id}>
          <li
            className="cike"
            onClick={() =>
              setOpenId((cur) => (cur === item.id ? null : item.id))
            }
          >
            <i
              className={`iconfont icon-chenggong2 ${item.done ? "com" : "air"}`}
            />
            <span>{item.title}</span>
            {item.imageUrl ? (
              <svg className="icon" aria-hidden="true" width="1.5em" height="1.5em">
                <use href="#icon-tupian" />
              </svg>
            ) : null}
          </li>
          {item.imageUrl && openId === item.id ? (
            <ul style={{ display: "block" }}>
              <li>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="spotlight"
                />
              </li>
            </ul>
          ) : item.imageUrl ? (
            <ul style={{ display: "none" }}>
              <li>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="spotlight"
                />
              </li>
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
