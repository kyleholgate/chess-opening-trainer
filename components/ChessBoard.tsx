"use client";

import { useState } from "react";
import {
  BoardDisplay,
  SidePanel,
  GameStatus,
  OpeningSelector,
  BoardTheme,
  RETRO_BOARD_THEMES,
} from "./chessGame";
import GameControls from "./chessGame/GameControls";
import { OpeningDefinition, OpeningNode } from "../types/opening";
import { useChessGame } from "../hooks/useChessGame";

/**
 * ChessBoard Component
 *
 * A Windows 95-styled chess training interface for the Scotch Gambit opening.
 * Following P4: Design Deep Modules - delegates complex game logic to useChessGame hook.
 * Following P14: Design for Readability - clear, focused component responsibility.
 *
 * @param props - ChessBoard configuration
 * @returns JSX element displaying the complete chess training interface
 */

interface ChessBoardProps {
  /** Selected opening data for move validation and opponent responses */
  opening: OpeningDefinition;
  /** All bundled openings the player can practice */
  openings: OpeningDefinition[];
  /** Currently selected opening id */
  selectedOpeningId: string;
  /** Called when the player switches opening drills */
  onOpeningChange: (openingId: string) => void;
  /** Optional callback for game state changes */
  onGameStateChange?: (state: {
    position: string;
    moveHistory: string[];
    currentNode: OpeningNode;
    feedback: string;
    isComplete: boolean;
  }) => void;
}

export default function ChessBoard({
  opening,
  openings,
  selectedOpeningId,
  onOpeningChange,
  onGameStateChange,
}: ChessBoardProps) {
  // Use the chess game hook for all game logic
  const { gameState, actions } = useChessGame({
    opening,
    onGameStateChange,
  });

  // UI state (separate from game logic)
  const [selectedTheme, setSelectedTheme] = useState<BoardTheme>(
    RETRO_BOARD_THEMES[0]
  );

  // Handle theme change
  const handleThemeChange = (theme: BoardTheme) => {
    setSelectedTheme(theme);
  };

  // Get available variations for the side panel
  const getAvailableVariations = () => {
    // Navigate to configured variation root to get opponent variations
    let node = opening.tree;
    for (const move of opening.variationRootMoves) {
      if (node.children[move]) {
        node = node.children[move];
      }
    }

    return Object.keys(node.children).map((move) => ({
      move,
      comment: node.children[move].comment || "",
      frequency: node.children[move].frequency ?? 0.5,
    }));
  };

  const availableVariations = getAvailableVariations();

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Main board area */}
      <div className="flex-1">
        <BoardDisplay
          position={gameState.gamePosition}
          onPieceDrop={actions.onDrop}
          selectedTheme={selectedTheme}
          boardOrientation={opening.boardOrientation}
          isPlayerTurn={gameState.isPlayerTurn}
          isComplete={gameState.isComplete}
        />
        {/* Game Status */}
        <GameStatus feedback={gameState.feedback} />
        {/* Game Controls below the board */}
        <GameControls
          onReset={actions.resetGame}
          onShowCorrectMove={actions.showCorrectMove}
          isComplete={gameState.isComplete}
          canShowCorrectMove={gameState.canShowCorrectMove}
        />
      </div>

      {/* Side panel */}
      <div className="w-full lg:w-80">
        <OpeningSelector
          openings={openings}
          selectedOpeningId={selectedOpeningId}
          onOpeningChange={onOpeningChange}
        />
        <SidePanel
          moveHistory={gameState.moveHistory}
          availableVariations={availableVariations}
          selectedVariations={gameState.selectedVariations}
          onVariationToggle={actions.handleVariationToggle}
          selectedTheme={selectedTheme}
          onThemeChange={handleThemeChange}
        />
      </div>
    </div>
  );
}
