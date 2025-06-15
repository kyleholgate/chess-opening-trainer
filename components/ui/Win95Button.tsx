import React from "react";

interface Win95ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "pressed";
}

export default function Win95Button({
  children,
  variant = "default",
  className = "",
  ...props
}: Win95ButtonProps) {
  const baseClasses =
    "bg-[#C3C3C3] text-black border-2 border-solid px-4 py-2 cursor-pointer transition-none";

  const variantClasses = {
    default:
      "border-white border-r-[#808080] border-b-[#808080] border-l-white border-t-white hover:bg-[#DFDFDF] active:border-[#808080] active:border-r-white active:border-b-white active:border-l-[#808080] active:border-t-[#808080]",
    pressed:
      "border-[#808080] border-r-white border-b-white border-l-[#808080] border-t-[#808080]",
  };

  const shadowClasses = {
    default:
      "shadow-[inset_1px_1px_0px_#DFDFDF,inset_-1px_-1px_0px_#808080] active:shadow-[inset_-1px_-1px_0px_#DFDFDF,inset_1px_1px_0px_#808080]",
    pressed: "shadow-[inset_-1px_-1px_0px_#DFDFDF,inset_1px_1px_0px_#808080]",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${shadowClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
