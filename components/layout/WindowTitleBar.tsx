import Win95Button from "../ui/Win95Button";

interface WindowTitleBarProps {
  title: string;
  onAbout?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  showAbout?: boolean;
}

/**
 * WindowTitleBar Component
 * Following P4: Design Deep Modules - encapsulates title bar complexity
 * Following P6: Prioritize Simple Interfaces - common window operations with clear callbacks
 */
export default function WindowTitleBar({
  title,
  onAbout,
  onMinimize,
  onMaximize,
  onClose,
  showAbout = true,
}: WindowTitleBarProps) {
  return (
    <div className="win95-titlebar flex justify-between items-center">
      <span className="text-md md:text-3xl">{title}</span>
      <div className="flex gap-1">
        {showAbout && (
          <Win95Button className="px-2 py-0 text-xs" onClick={onAbout}>
            ?
          </Win95Button>
        )}
        {onMinimize && (
          <Win95Button className="px-2 py-0 text-xs" onClick={onMinimize}>
            _
          </Win95Button>
        )}
        {onMaximize && (
          <Win95Button className="px-2 py-0 text-xs">□</Win95Button>
        )}
        {onClose && (
          <Win95Button className="px-2 py-0 text-xs" onClick={onClose}>
            ×
          </Win95Button>
        )}
      </div>
    </div>
  );
}
