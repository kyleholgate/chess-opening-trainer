"use client";

import { useState, useEffect } from "react";
import ChessBoard from "../components/ChessBoard";
import { OpeningNode } from "../types/opening";
import { parseOpeningTree } from "../utils/opening-parser";
import scotchGambitData from "../data/scotch-gambit.json";

export default function Home() {
  const [openingTree, setOpeningTree] = useState<OpeningNode | null>(null);
  const [, setGameStats] = useState({
    totalMoves: 0,
    correctMoves: 0,
    incorrectMoves: 0,
    completedVariations: 0,
  });
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
  const handleGameStateChange = (state: {
    position: string;
    moveHistory: string[];
    currentNode: OpeningNode;
    feedback: string;
    isComplete: boolean;
  }) => {
    // Update stats when game completes
    if (state.isComplete) {
      setGameStats((prev) => ({
        ...prev,
        completedVariations: prev.completedVariations + 1,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Loading Scotch Gambit trainer...
          </p>
        </div>
      </div>
    );
  }

  if (error || !openingTree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Trainer
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 pb-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ♛ Scotch Gambit Trainer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master the Scotch Gambit opening! Play the correct moves as White,
            and the computer will respond as Black. Learn this aggressive
            opening through interactive practice.
          </p>
        </div>

        {/* Chess Board */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full">
            <ChessBoard
              openingTree={openingTree}
              onGameStateChange={handleGameStateChange}
            />
          </div>
        </div>

        {/* Opening Information */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              About the Scotch Gambit
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Opening Moves
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                  1. e4 e5
                  <br />
                  2. Nf3 Nc6
                  <br />
                  3. d4 exd4
                  <br />
                  4. Bc4 (The Gambit!)
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Key Ideas
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rapid piece development</li>
                  <li>• Pressure on f7 square</li>
                  <li>• Active piece play over material</li>
                  <li>• Sharp tactical positions</li>
                  <li>• Initiative in the opening</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              📝 How to Use This Trainer
            </h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li>
                1. <strong>You play as White</strong> - drag pieces to make your
                moves
              </li>
              <li>
                2. <strong>Follow the opening theory</strong> - only correct
                moves are accepted
              </li>
              <li>
                3. <strong>Black responds automatically</strong> - with weighted
                realistic moves
              </li>
              <li>
                4. <strong>Learn from feedback</strong> - incorrect moves show
                helpful hints
              </li>
              <li>
                5. <strong>Complete variations</strong> - reach the end of each
                line to master it
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
