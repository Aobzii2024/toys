"use client";

import { useEffect, useState } from "react";

type Props = {
  startTime: string;
};

type Elapsed = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calcElapsed(startTime: string, now: number): Elapsed | null {
  const birth = new Date(startTime);
  if (Number.isNaN(birth.getTime())) return null;
  const timeold = now - birth.getTime();
  if (timeold < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const msPerDay = 24 * 60 * 60 * 1000;
  const e_daysold = timeold / msPerDay;
  const daysold = Math.floor(e_daysold);
  const e_hrsold = (e_daysold - daysold) * 24;
  const hrsold = Math.floor(e_hrsold);
  const e_minsold = (e_hrsold - hrsold) * 60;
  const minsold = Math.floor(e_minsold);
  const seconds = Math.floor((e_minsold - minsold) * 60);
  return {
    days: daysold,
    hours: hrsold,
    minutes: minsold,
    seconds,
  };
}

export function LoveTimer({ startTime }: Props) {
  const [elapsed, setElapsed] = useState<Elapsed | null>(null);

  useEffect(() => {
    const tick = () => setElapsed(calcElapsed(startTime, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startTime]);

  const secStr =
    elapsed && elapsed.seconds < 10
      ? `0${elapsed.seconds}`
      : String(elapsed?.seconds ?? 0);

  return (
    <div className="time">
      <span id="span_dt_dt">这是我们一起走过的</span>
      <b id="tian">{elapsed ? `${elapsed.days}天` : ""}</b>
      <b id="shi">{elapsed ? `${elapsed.hours}时` : ""}</b>
      <b id="fen">{elapsed ? `${elapsed.minutes}分` : ""}</b>
      <b id="miao">{elapsed ? `${secStr}秒` : ""}</b>
    </div>
  );
}
