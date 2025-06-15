"use client";

import { motion, AnimatePresence } from "motion/react";
import ChessBoard from "../components/ChessBoard";
import Win95Panel from "../components/ui/Win95Panel";
import Win95Input from "../components/ui/Win95Input";
import AboutModal from "../components/AboutModal";
import DesktopIcon from "../components/DesktopIcon";
import LoadingScreen from "../components/screens/LoadingScreen";
import ErrorScreen from "../components/screens/ErrorScreen";
import WindowTitleBar from "../components/layout/WindowTitleBar";
import BackgroundImage from "../components/layout/BackgroundImage";
import TaskBar from "../components/layout/TaskBar";
import { useApplicationState } from "../hooks/useApplicationState";
import { WINDOW_TITLES, Z_INDEX, TIMING } from "../constants/ui";

/**
 * Home Component - Refactored following A Philosophy of Software Design principles
 * Following P4: Design Deep Modules - delegates complexity to focused child components
 * Following P2: Prioritize Design Quality - clean architecture over quick fixes
 */
export default function Home() {
  const {
    openingTree,
    isLoading,
    error,
    isMinimized,
    isClosed,
    showContactModal,
    isRelaunching,
    setIsMinimized,
    setIsClosed,
    setShowContactModal,
    relaunchApplication,
  } = useApplicationState();

  // Handle game state changes - simplified callback
  // Following RULE 4: Minimize Cognitive Load - clear, simple interface
  const handleGameStateChange = () => {
    // Game state changes are handled within the ChessBoard component
    // This callback is available for future functionality if needed
  };

  // Early returns for different application states
  // Following P14: Design for Readability - obvious state handling
  if (isLoading || isRelaunching) {
    return <LoadingScreen />;
  }

  if (error || !openingTree) {
    return <ErrorScreen error={error || "Unknown error occurred"} />;
  }

  return (
    <div className="min-h-screen bg-background p-0 md:p-2 relative overflow-hidden">
      {/* Background Image - only visible when minimized */}
      <BackgroundImage isVisible={isMinimized} />

      <AnimatePresence mode="wait">
        {!isMinimized && !isClosed ? (
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
                duration: TIMING.WINDOW_CLOSE_ANIMATION / 1000,
                ease: "easeIn",
              },
            }}
            style={{
              position: "relative",
              zIndex: Z_INDEX.WINDOW,
              transformOrigin: "bottom left",
            }}
          >
            {/* Title Bar */}
            <WindowTitleBar
              title={WINDOW_TITLES.MAIN}
              onAbout={() => setShowContactModal(true)}
              onMinimize={() => setIsMinimized(true)}
              onClose={() => setIsClosed(true)}
            />

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

      {/* Desktop Icon - only visible when window is closed */}
      {isClosed && <DesktopIcon onDoubleClick={relaunchApplication} />}

      {/* Minimized Taskbar */}
      <AnimatePresence>
        <TaskBar
          isVisible={isMinimized}
          applicationTitle="Scotch Gambit Trainer"
          onRestore={() => setIsMinimized(false)}
        />
      </AnimatePresence>

      {/* About Modal */}
      <AboutModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
