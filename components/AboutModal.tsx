import { motion } from "motion/react";
import Win95Button from "./ui/Win95Button";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <motion.div
        className="win95-window w-80 max-w-sm absolute"
        style={{
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "-50%",
        }}
        drag
        dragElastic={0}
        dragMomentum={false}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Title Bar */}
        <div className="win95-titlebar flex justify-between items-center cursor-move">
          <span className="">About</span>
          <Win95Button
            className="px-2 py-0 text-xs cursor-pointer"
            onClick={onClose}
          >
            ×
          </Win95Button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          <div className="win95-panel p-4">
            <div className="text-center space-y-4">
              <div className="text-2xl">♔</div>
              <h3 className="text-black font-bold">Scotch Gambit Trainer</h3>
              <p className="text-sm text-black">Created by Kyle Holgate</p>

              <div className="space-y-2">
                <Win95Button
                  className="w-full py-2"
                  onClick={() =>
                    window.open(
                      "https://linkedin.com/in/kyleholgate/",
                      "_blank"
                    )
                  }
                >
                  📧 LinkedIn
                </Win95Button>
                <Win95Button
                  className="w-full py-2"
                  onClick={() =>
                    window.open("https://twitter.com/kyleholgate", "_blank")
                  }
                >
                  🐦 Twitter
                </Win95Button>
                <Win95Button
                  className="w-full py-2"
                  onClick={() =>
                    window.open("mailto:kyle.holgate@gmail.com", "_blank")
                  }
                >
                  ✉️ Email
                </Win95Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
