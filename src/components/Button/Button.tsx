import { useEffect, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import "./Button.css";

type ButtonType = "Primary" | "Secondary" | "Tertiary";

export function Button({
  children,
  buttonStyle: style,
  isLoading,
  isIconOnly,
  ...props
}: {
  children: React.ReactNode;
  buttonStyle: ButtonType;
  isLoading?: boolean;
  isIconOnly?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [buttonClass, setButtonClass] = useState(`btn ${style.toLowerCase()}`);

  useEffect(() => {
    if (isLoading) {
      setButtonClass(`btn inactive`);
    } else {
      setButtonClass(`btn ${style.toLowerCase()}`);
    }
  }, [isLoading, style]);

  return (
    <button
      {...props}
      className={`${buttonClass} ${isIconOnly ? "icon-only" : ""}`}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading && (
        <CircleNotch size={16} className="btn-spinner" weight="bold" />
      )}
      {children}
    </button>
  );
}
