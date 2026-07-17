"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type DanmakuMessage = {
  id: number;
  name: string;
  qq: string;
  body: string;
};

type Props = {
  messages: DanmakuMessage[];
  /** Stage height in px */
  height?: number;
};

const TRACKS = 5;
const BASE_DURATION = 12; // seconds for one pass at 1x
const STAGGER = 1.6;
const ROUND_GAP_MS = 600;
/** Hover playback rate — slower, not paused */
const SLOW_RATE = 0.35;

type Flight = DanmakuMessage & {
  track: number;
  delay: number;
  duration: number;
};

/**
 * Looping danmaku board.
 * - Plays all messages in a round, then restarts.
 * - Hover slows flights via Web Animations playbackRate.
 */
export function MessageDanmaku({ messages, height = 300 }: Props) {
  const [slow, setSlow] = useState(false);
  const [round, setRound] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const finishedRef = useRef(0);
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Remaining duration at 1x speed (ms) */
  const remainingNormalMs = useRef(0);
  const segmentStartedAt = useRef(0);
  const rateRef = useRef(1);

  const items: Flight[] = useMemo(() => {
    return messages.map((m, i) => {
      const track = i % TRACKS;
      const orderInTrack = Math.floor(i / TRACKS);
      const delay = orderInTrack * STAGGER + track * 0.35;
      const duration = BASE_DURATION + (i % 3) * 1.2 + track * 0.4;
      return { ...m, track, delay, duration };
    });
  }, [messages]);

  const maxRoundNormalMs = useMemo(() => {
    if (items.length === 0) return 0;
    return (
      items.reduce((acc, it) => Math.max(acc, it.delay + it.duration), 0) *
        1000 +
      ROUND_GAP_MS
    );
  }, [items]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimer.current) {
      clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }
  }, []);

  const applyPlaybackRate = useCallback((rate: number) => {
    rateRef.current = rate;
    const root = stageRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(".danmaku-item").forEach((el) => {
      el.getAnimations?.().forEach((anim) => {
        anim.playbackRate = rate;
      });
    });
  }, []);

  /** Fold wall-clock elapsed into remainingNormalMs (using current rate). */
  const consumeElapsed = useCallback(() => {
    if (!restartTimer.current) return;
    const rate = rateRef.current || 1;
    const wallElapsed = Date.now() - segmentStartedAt.current;
    remainingNormalMs.current = Math.max(
      0,
      remainingNormalMs.current - wallElapsed * rate,
    );
    clearRestartTimer();
  }, [clearRestartTimer]);

  /** Arm wall timer so remainingNormalMs elapses at current playbackRate. */
  const armTimer = useCallback(
    (normalMs: number) => {
      clearRestartTimer();
      remainingNormalMs.current = Math.max(0, normalMs);
      if (remainingNormalMs.current <= 0) {
        finishedRef.current = 0;
        setRound((r) => r + 1);
        return;
      }
      const rate = rateRef.current || 1;
      const wallMs = remainingNormalMs.current / rate;
      segmentStartedAt.current = Date.now();
      restartTimer.current = setTimeout(() => {
        finishedRef.current = 0;
        remainingNormalMs.current = 0;
        setRound((r) => r + 1);
      }, wallMs);
    },
    [clearRestartTimer],
  );

  // New round / message list
  useEffect(() => {
    finishedRef.current = 0;
    clearRestartTimer();
    if (items.length === 0 || maxRoundNormalMs <= 0) return;

    const t = window.setTimeout(() => {
      applyPlaybackRate(rateRef.current);
      armTimer(maxRoundNormalMs);
    }, 0);

    return () => {
      window.clearTimeout(t);
      clearRestartTimer();
    };
  }, [
    round,
    messages,
    items.length,
    maxRoundNormalMs,
    armTimer,
    clearRestartTimer,
    applyPlaybackRate,
  ]);

  // Hover slow / restore
  useEffect(() => {
    const next = slow ? SLOW_RATE : 1;
    if (next === rateRef.current) {
      applyPlaybackRate(next);
      return;
    }
    consumeElapsed();
    applyPlaybackRate(next);
    if (remainingNormalMs.current > 0) {
      armTimer(remainingNormalMs.current);
    }
  }, [slow, applyPlaybackRate, consumeElapsed, armTimer]);

  const onItemAnimationEnd = useCallback(() => {
    finishedRef.current += 1;
    if (finishedRef.current < items.length) return;
    armTimer(ROUND_GAP_MS);
  }, [items.length, armTimer]);

  if (messages.length === 0) {
    return (
      <div className="danmaku-stage danmaku-empty" style={{ height }}>
        <p>暂无留言，来写第一条祝福吧～</p>
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      className={`danmaku-stage${slow ? " is-slow" : ""}`}
      style={{ height }}
      onMouseEnter={() => setSlow(true)}
      onMouseLeave={() => setSlow(false)}
      aria-label="留言弹幕区"
    >
      {items.map((it) => (
        <div
          key={`${round}-${it.id}-${it.track}`}
          className="danmaku-item"
          style={{
            top: `calc(${(it.track + 0.5) * (100 / TRACKS)}% - 18px)`,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
          }}
          onAnimationEnd={onItemAnimationEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="danmaku-avatar"
            src={`https://q1.qlogo.cn/g?b=qq&nk=${it.qq}&s=100`}
            alt=""
            draggable={false}
          />
          <span className="danmaku-name">{it.name}</span>
          <span className="danmaku-sep">：</span>
          <span className="danmaku-text">{it.body}</span>
        </div>
      ))}
    </div>
  );
}
