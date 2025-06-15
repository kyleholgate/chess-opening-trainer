import { motion } from "motion/react";
import Image from "next/image";
import Win95Button from "../ui/Win95Button";
import { Z_INDEX, DIMENSIONS, TIMING } from "../../constants/ui";

interface TaskBarProps {
  isVisible: boolean;
  applicationTitle: string;
  onRestore: () => void;
  iconPath?: string;
}

/**
 * TaskBar Component
 * Following P4: Design Deep Modules - encapsulates taskbar display and animation complexity
 * Following P10: Pull Complexity Downwards - handles motion and styling internally
 */
export default function TaskBar({
  isVisible,
  applicationTitle,
  onRestore,
  iconPath = "/pieces/wq.svg",
}: TaskBarProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-2 left-2 right-2"
      style={{ zIndex: Z_INDEX.TASKBAR }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{
        duration: TIMING.TASKBAR_ANIMATION / 1000,
        ease: "easeOut",
      }}
    >
      <div className="win95-panel p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="border border-[#404040] flex items-center justify-center p-0.5 bg-primary"
              style={{
                width: `${DIMENSIONS.TASKBAR_ICON.width * 4}px`,
                height: `${DIMENSIONS.TASKBAR_ICON.height * 4}px`,
              }}
            >
              <Image
                src={iconPath}
                alt="Application Icon"
                width={DIMENSIONS.TASKBAR_ICON_IMAGE.width}
                height={DIMENSIONS.TASKBAR_ICON_IMAGE.height}
                className="w-full h-full"
              />
            </div>
            <span className="text-sm">{applicationTitle}</span>
          </div>
          <Win95Button className="px-3 py-1 text-xs" onClick={onRestore}>
            Restore
          </Win95Button>
        </div>
      </div>
    </motion.div>
  );
}
