import Image from "next/image";

interface DesktopIconProps {
  onDoubleClick: () => void;
}

export default function DesktopIcon({ onDoubleClick }: DesktopIconProps) {
  return (
    <div className="absolute top-8 left-8 z-20">
      <div
        className="flex flex-col items-center cursor-pointer select-none p-3 rounded hover:bg-[#316AC5] hover:bg-opacity-30 transition-colors"
        onDoubleClick={onDoubleClick}
        onClick={onDoubleClick}
      >
        <div
          className="w-12 h-12 border border-[#404040] flex items-center justify-center mb-2 p-2"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Image
            src="/pieces/wq.svg"
            alt="Chess Queen"
            width={32}
            height={32}
            className="w-full h-full"
          />
        </div>
        <span className="text-sm text-black text-center leading-tight max-w-20">
          Scotch Gambit Trainer
        </span>
      </div>
    </div>
  );
}
