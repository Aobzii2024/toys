"use client";

type Props = {
  label: string;
  confirmMessage: string;
  className?: string;
  disabled?: boolean;
};

/** Submit button that asks for confirmation first. */
export function ConfirmSubmit({
  label,
  confirmMessage,
  className = "admin-btn danger small",
  disabled,
}: Props) {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
