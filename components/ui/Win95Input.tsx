import React from "react";

interface Win95InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "textarea";
}

export default function Win95Input({
  variant = "default",
  className = "",
  ...props
}: Win95InputProps) {
  const baseClasses = "bg-white text-black border-2 border-solid px-2 py-1";
  const borderClasses =
    "border-[#808080] border-r-white border-b-white border-l-[#808080] border-t-[#808080]";
  const shadowClasses = "shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]";

  if (variant === "textarea") {
    return (
      <textarea
        className={`${baseClasses} ${borderClasses} ${shadowClasses} resize-none ${className}`}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  return (
    <input
      className={`${baseClasses} ${borderClasses} ${shadowClasses} ${className}`}
      {...props}
    />
  );
}
