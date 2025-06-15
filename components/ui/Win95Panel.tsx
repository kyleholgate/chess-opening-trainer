import React from "react";

interface Win95PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Win95Panel({
  title,
  children,
  className = "",
}: Win95PanelProps) {
  return (
    <div className={`win95-raised p-4 ${className}`}>
      <div className="win95-titlebar mb-3">
        <span className="">{title}</span>
      </div>
      <div className=" p-3">{children}</div>
    </div>
  );
}
