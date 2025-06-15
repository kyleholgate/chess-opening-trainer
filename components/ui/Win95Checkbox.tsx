import React from "react";

interface Win95CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Win95Checkbox({
  label,
  className = "",
  ...props
}: Win95CheckboxProps) {
  const checkboxClasses =
    "appearance-none w-5 h-5 border-2 border-solid bg-white cursor-pointer border-[#808080] border-r-white border-b-white border-l-[#808080] border-t-[#808080] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)] checked:bg-white";

  const checkmarkStyle = {
    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="black" stroke-width="2" fill="none"/></svg>')`,
    backgroundSize: "14px 14px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  if (label) {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className={`${checkboxClasses} ${className}`}
          style={props.checked ? checkmarkStyle : undefined}
          {...props}
        />
        <span className="text-xs text-black">{label}</span>
      </label>
    );
  }

  return (
    <input
      type="checkbox"
      className={`${checkboxClasses} ${className}`}
      style={props.checked ? checkmarkStyle : undefined}
      {...props}
    />
  );
}
