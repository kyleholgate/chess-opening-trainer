"use client";

import { useState, useEffect } from "react";
import ChessBoard from "../components/ChessBoard";
import { OpeningNode } from "../types/opening";
import { parseOpeningTree } from "../utils/opening-parser";
import scotchGambitData from "../data/scotch-gambit.json";

export default function Home() {
  const [openingTree, setOpeningTree] = useState<OpeningNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <span className="font-vt323">
              Scotch Gambit Trainer - Loading...
            </span>
          </div>
          <div className="win95-panel p-6 text-center">
            <div className="bg-[#808080] h-4 w-64 mx-auto mb-4 win95-panel">
              <div
                className="h-full bg-[#008080] animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="font-vt323 text-black">
              Loading chess trainer components...
            </p>
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
            <span className="font-vt323">Scotch Gambit Trainer - Error</span>
          </div>
          <div className="win95-panel p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-vt323 text-black mb-4">System Error</h1>
            <p className="font-vt323 text-black">{error}</p>
            <button className="win95-button mt-4">OK</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#C3C3C3] p-2">
      {/* Main Application Window */}
      <div className="win95-window h-full">
        {/* Title Bar */}
        <div className="win95-titlebar flex justify-between items-center">
          <span className="font-vt323">Scotch Gambit Trainer v1.0</span>
          <div className="flex gap-1">
            <button className="win95-button px-2 py-0 text-xs">_</button>
            <button className="win95-button px-2 py-0 text-xs">□</button>
            <button className="win95-button px-2 py-0 text-xs">×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="bg-[#C3C3C3] border-b-2 border-[#808080] px-2 py-1">
          <div className="flex gap-4">
            <button className="font-vt323 text-black px-2 py-1 hover:bg-[#0080FF] hover:text-white">
              File
            </button>
            <button className="font-vt323 text-black px-2 py-1 hover:bg-[#0080FF] hover:text-white">
              Options
            </button>
            <button className="font-vt323 text-black px-2 py-1 hover:bg-[#0080FF] hover:text-white">
              Help
            </button>
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
              <div className="win95-raised p-4 mb-4">
                <div className="win95-titlebar mb-3">
                  <span className="font-vt323">Opening Information</span>
                </div>
                <div className="win95-panel p-3 space-y-3">
                  <div>
                    <h3 className="font-vt323 text-black font-bold mb-2">
                      Main Line:
                    </h3>
                    <div className="win95-input p-2 text-xs font-vt323">
                      1. e4 e5
                      <br />
                      2. Nf3 Nc6
                      <br />
                      3. d4 exd4
                      <br />
                      4. Bc4
                    </div>
                  </div>
                  <div>
                    <h3 className="font-vt323 text-black font-bold mb-2">
                      Key Ideas:
                    </h3>
                    <div className="win95-panel p-2 text-xs">
                      <ul className="font-vt323 text-black space-y-1">
                        <li>• Sac the pawn on d4</li>
                        <li>• Get up in that f7</li>
                        <li>• Look for game-winning traps</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="win95-raised p-4">
                <div className="win95-titlebar mb-3">
                  <span className="font-vt323">Instructions</span>
                </div>
                <div className="win95-panel p-3">
                  <div className="text-xs font-vt323 text-black space-y-2">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
