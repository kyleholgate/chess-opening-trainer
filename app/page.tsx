"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ChessBoard from "../components/ChessBoard";
import Win95Panel from "../components/ui/Win95Panel";
import Win95Button from "../components/ui/Win95Button";
import Win95Input from "../components/ui/Win95Input";
import { OpeningNode } from "../types/opening";
import { parseOpeningTree } from "../utils/opening-parser";
import scotchGambitData from "../data/scotch-gambit.json";

export default function Home() {
  const [openingTree, setOpeningTree] = useState<OpeningNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Load and parse opening tree on component mount
  useEffect(() => {
    try {
      const parsedTree = parseOpeningTree(scotchGambitData);
      setOpeningTree(parsedTree);
      setLoading(false);
    } catch (err) {
      setError("Failed to load opening data");
      setLoading(false);
      console.error("Error parsing opening tree:", err);
    }
  }, []);

  // Handle game state changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGameStateChange = (_state: {
    position: string;
    moveHistory: string[];
    currentNode: OpeningNode;
    feedback: string;
    isComplete: boolean;
  }) => {
    // Game state changes are handled within the ChessBoard component
    // This callback is available for future functionality if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#C3C3C3] flex items-center justify-center">
        <div className="win95-window p-8">
          <div className="win95-titlebar mb-4">
            <span className="">Scotch Gambit Trainer - Loading...</span>
          </div>
          <div className="win95-panel p-6 text-center">
            <div className="bg-[#808080] h-4 w-64 mx-auto mb-4 win95-panel">
              <div
                className="h-full bg-[#008080] animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="text-black">Loading chess trainer components...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !openingTree) {
    return (
      <div className="min-h-screen bg-[#C3C3C3] flex items-center justify-center">
        <div className="win95-window p-8">
          <div className="win95-titlebar mb-4">
            <span className="">Scotch Gambit Trainer - Error</span>
          </div>
          <div className="win95-panel p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl text-black mb-4">System Error</h1>
            <p className="text-black">{error}</p>
            <Win95Button className="mt-4">OK</Win95Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#C3C3C3] p-2 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="window"
            className="win95-window h-full"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 0,
              x: -200,
              y: 200,
              opacity: 0,
              transition: {
                duration: 0.25,
                ease: "easeIn",
              },
            }}
            style={{
              position: "relative",
              zIndex: 10,
              transformOrigin: "bottom left",
            }}
          >
            {/* Title Bar */}
            <div className="win95-titlebar flex justify-between items-center">
              <span className="">Scotch Gambit Trainer v1.0</span>
              <div className="flex gap-1">
                <Win95Button
                  className="px-2 py-0 text-xs"
                  onClick={() => setShowContactModal(true)}
                >
                  ?
                </Win95Button>
                <Win95Button
                  className="px-2 py-0 text-xs"
                  onClick={() => setIsMinimized(true)}
                >
                  _
                </Win95Button>
                <Win95Button className="px-2 py-0 text-xs">□</Win95Button>
                <Win95Button className="px-2 py-0 text-xs">×</Win95Button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 flex-1 overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-4 h-full max-w-7xl mx-auto">
                {/* Left Panel - Chess Board */}
                <div className="flex-1 lg:max-w-4xl">
                  <div className="win95-raised p-4 h-full">
                    <div className="win95-panel p-4">
                      <ChessBoard
                        openingTree={openingTree}
                        onGameStateChange={handleGameStateChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Panel - Information (appears below on mobile) */}
                <div className="w-full lg:min-w-64 lg:max-w-80">
                  {/* Opening Information Panel */}
                  <Win95Panel title="Opening Information" className="mb-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-black font-bold mb-2">
                          Main Line:
                        </h3>
                        <Win95Input
                          variant="textarea"
                          className="p-2 text-xs h-20 w-full"
                          value="1. e4 e5&#10;2. Nf3 Nc6&#10;3. d4 exd4&#10;4. Bc4"
                          readOnly
                        />
                      </div>
                      <div>
                        <h3 className="text-black font-bold mb-2">
                          Key Ideas:
                        </h3>
                        <div className="win95-panel p-2 text-xs">
                          <ul className="text-black space-y-1">
                            <li>• Sac the pawn on d4</li>
                            <li>• Get up in that f7</li>
                            <li>• Look for game-winning traps</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Win95Panel>

                  {/* Instructions Panel */}
                  <Win95Panel title="Instructions">
                    <div className="text-xs text-black space-y-2">
                      <p>
                        <strong>How to play:</strong>
                      </p>
                      <ul className="space-y-1 ml-2">
                        <li>1. You are White</li>
                        <li>2. Drag pieces to move</li>
                        <li>3. Follow opening theory</li>
                        <li>4. Black responds automatically</li>
                        <li>5. Drill until you remember the lines</li>
                      </ul>
                    </div>
                  </Win95Panel>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Minimized Taskbar */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            key="taskbar"
            className="fixed bottom-2 left-2 right-2 z-50"
            initial={{ y: 50, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{ y: 50, opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
          >
            <div className="win95-panel p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#008080] border border-[#404040] flex items-center justify-center">
                    <div className="text-white text-xs">♔</div>
                  </div>
                  <span className="text-sm">Scotch Gambit Trainer</span>
                </div>
                <Win95Button
                  className="px-3 py-1 text-xs"
                  onClick={() => setIsMinimized(false)}
                >
                  Restore
                </Win95Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="win95-window w-80 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title Bar */}
            <div className="win95-titlebar flex justify-between items-center">
              <span className="">About</span>
              <Win95Button
                className="px-2 py-0 text-xs"
                onClick={() => setShowContactModal(false)}
              >
                ×
              </Win95Button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="win95-panel p-4">
                <div className="text-center space-y-4">
                  <div className="text-2xl">♔</div>
                  <h3 className="text-black font-bold">
                    Scotch Gambit Trainer
                  </h3>
                  <p className="text-sm text-black">Created by [Your Name]</p>

                  <div className="space-y-2">
                    <Win95Button
                      className="w-full py-2"
                      onClick={() =>
                        window.open(
                          "https://linkedin.com/in/your-profile",
                          "_blank"
                        )
                      }
                    >
                      📧 LinkedIn
                    </Win95Button>
                    <Win95Button
                      className="w-full py-2"
                      onClick={() =>
                        window.open("https://twitter.com/your-handle", "_blank")
                      }
                    >
                      🐦 Twitter
                    </Win95Button>
                    <Win95Button
                      className="w-full py-2"
                      onClick={() =>
                        window.open("mailto:your.email@example.com", "_blank")
                      }
                    >
                      ✉️ Email
                    </Win95Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
