"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  /** debounce ms before auto submit */
  delay?: number;
  /** show small saved indicator */
  showStatus?: boolean;
};

/**
 * Submits the form automatically after changes (debounced).
 * Use for admin edit forms so users don't click「保存」again.
 */
export function AutoSaveForm({
  action,
  children,
  className,
  delay = 700,
  showStatus = true,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const submit = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    setStatus("saving");
    startTransition(async () => {
      try {
        await action(fd);
        setStatus("saved");
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setStatus("idle"), 1600);
      } catch {
        setStatus("error");
      }
    });
  }, [action]);

  const schedule = useCallback(() => {
    clearTimer();
    timer.current = setTimeout(() => {
      submit();
    }, delay);
  }, [delay, submit]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  return (
    <form
      ref={formRef}
      className={className}
      onChange={schedule}
      onInput={schedule}
      action={action}
    >
      {children}
      {showStatus && status !== "idle" ? (
        <p
          className="field-hint"
          style={{
            marginTop: "0.55rem",
            color:
              status === "error"
                ? "#b91c1c"
                : status === "saved"
                  ? "#047857"
                  : undefined,
          }}
        >
          {status === "saving" || pending
            ? "保存中…"
            : status === "saved"
              ? "已自动保存"
              : "保存失败，请重试"}
        </p>
      ) : null}
    </form>
  );
}
