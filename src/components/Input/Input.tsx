import "./Input.css";

import type { Icon } from "@phosphor-icons/react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: Icon;
};

export function Input({
  icon: IconComponent,
  className,
  ...props
}: InputProps) {
  return (
    <div className="input-wrapper">
      <input
        {...props}
        className={`input ${IconComponent ? "input--with-icon" : ""} ${className || ""}`}
      />
      {IconComponent && (
        <span className="input-icon" aria-hidden="true">
          <IconComponent size={18} />
        </span>
      )}
    </div>
  );
}
