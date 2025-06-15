import React from "react";

interface Win95RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Win95Radio({
  label,
  className = "",
  ...props
}: Win95RadioProps) {
  const radioClasses =
    "appearance-none w-5 h-5 border-2 border-solid bg-white cursor-pointer border-[#808080] border-r-white border-b-white border-l-[#808080] border-t-[#808080] rounded-full shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)] checked:bg-black checked:shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1),inset_0_0_0_3px_white]";

  if (label) {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          className={`${radioClasses} ${className}`}
          {...props}
        />
        <span className="text-xs text-black">{label}</span>
      </label>
    );
  }

  return (
    <input type="radio" className={`${radioClasses} ${className}`} {...props} />
  );
}
