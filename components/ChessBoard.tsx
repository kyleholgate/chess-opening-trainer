"use client";

import { useState, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import {
  BoardDisplay,
  GameStatus,
  GameControls,
  SidePanel,
  BoardTheme,
  Variation,
  RETRO_BOARD_THEMES,
} from "./chessGame";
import { OpeningNode } from "../types/opening";
import { selectWeightedMove } from "../utils/weighted-selection";
import { isValidMove } from "../utils/opening-parser";

interface ChessBoardProps {
  openingTree: OpeningNode;
  onGameStateChange?: (state: {
    position: string;
    moveHistory: string[];
    currentNode: OpeningNode;
    feedback: string;
    isComplete: boolean;
  }) => void;
}

export default function ChessBoard({
  openingTree,
  onGameStateChange,
}: ChessBoardProps) {
  const [game] = useState(() => {
    const g = new Chess();
    // Set up Scotch Gambit position
    g.move("e4");
    g.move("e5");
    g.move("Nf3");
    g.move("Nc6");
    g.move("d4");
    g.move("exd4");
    g.move("Bc4");
    return g;
  });

  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([
    "e4",
    "e5",
    "Nf3",
    "Nc6",
    "d4",
    "exd4",
    "Bc4",
  ]);

  // Navigate to starting node in tree
  const getStartingNode = () => {
    let node = openingTree;
    const moves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];
    for (const move of moves) {
      if (node.children[move]) {
        node = node.children[move];
      }
    }
    return node;
  };

  const [currentNode, setCurrentNode] = useState(getStartingNode());
  const [feedback, setFeedback] = useState(
    "Black to move. How will they respond to the Scotch Gambit?"
  );
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<BoardTheme>(
    RETRO_BOARD_THEMES[0]
  );

  // Get available variations (Black's responses after Bc4)
  const getAvailableVariations = (): Variation[] => {
    const startingNode = getStartingNode();
    return Object.keys(startingNode.children).map((move) => ({
      move,
      comment: startingNode.children[move].comment || "",
      frequency: startingNode.children[move].frequency || 0.5,
    }));
  };

  const [availableVariations] = useState(getAvailableVariations());
  const [selectedVariations, setSelectedVariations] = useState<string[]>(
    availableVariations.map((v) => v.move) // Start with all variations selected
  );

  // Reset game to Scotch Gambit position (after 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4)
  const resetGame = useCallback(() => {
    game.reset();
    // Play the moves to reach Scotch Gambit position
    game.move("e4");
    game.move("e5");
    game.move("Nf3");
    game.move("Nc6");
    game.move("d4");
    game.move("exd4");
    game.move("Bc4");

    setGamePosition(game.fen());
    setMoveHistory(["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"]);

    // Navigate to the Bc4 node in the opening tree
    let currentNode = openingTree;
    const moves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];
    for (const move of moves) {
      if (currentNode.children[move]) {
        currentNode = currentNode.children[move];
      }
    }

    setCurrentNode(currentNode);
    setFeedback("Black to move. How will they respond to the Scotch Gambit?");
    setIsPlayerTurn(false); // Black moves first from this position
    setIsComplete(false);
  }, [game, openingTree]);

  // Make opponent move using weighted selection
  const makeOpponentMove = useCallback(
    (node: OpeningNode, history: string[]) => {
      // Use selected variations only for the first Black move after Bc4
      const isFirstBlackMove = history.length === 7; // Right after Bc4
      const allowedMoves = isFirstBlackMove ? selectedVariations : undefined;
      const opponentMove = selectWeightedMove(node.children, allowedMoves);

      if (!opponentMove) {
        setFeedback("You've reached the end of this line!");
        setIsComplete(true);
        return;
      }

      try {
        const move = game.move(opponentMove);
        if (!move) {
          console.error("Invalid opponent move:", opponentMove);
          return;
        }

        const newMoveHistory = [...history, opponentMove];
        const newNode = node.children[opponentMove];

        setGamePosition(game.fen());
        setMoveHistory(newMoveHistory);
        setCurrentNode(newNode);
        setIsPlayerTurn(true);

        const nextMoves = Object.keys(newNode.children);
        if (nextMoves.length === 0) {
          setFeedback(`Black played ${opponentMove}. This line is complete!`);
          setIsComplete(true);
        } else if (nextMoves.length === 1) {
          setFeedback(
            `Black played ${opponentMove}. There's one best response here.`
          );
        } else {
          setFeedback(`Black played ${opponentMove}. What's your next move?`);
        }

        onGameStateChange?.({
          position: game.fen(),
          moveHistory: newMoveHistory,
          currentNode: newNode,
          feedback: `Black played ${opponentMove}. ${
            newNode.comment || "What's your response?"
          }`,
          isComplete:
            newNode.isEndOfVariation ||
            Object.keys(newNode.children).length === 0,
        });
      } catch (error) {
        console.error("Error making opponent move:", error);
      }
    },
    [game, onGameStateChange, selectedVariations]
  );

  // Handle piece drop (player move)
  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!isPlayerTurn || isComplete) {
        return false;
      }

      try {
        // Attempt the move
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // Auto-promote to queen for simplicity
        });

        if (!move) {
          return false; // Invalid chess move
        }

        const moveString = move.san;

        // Check if move is in opening tree
        if (!isValidMove(currentNode, moveString)) {
          // Invalid opening move - undo it
          game.undo();
          setFeedback(`"${moveString}" is not the correct move. Try again!`);
          return false;
        }

        // Valid move - update state
        const newMoveHistory = [...moveHistory, moveString];
        const newNode = currentNode.children[moveString];

        setGamePosition(game.fen());
        setMoveHistory(newMoveHistory);
        setCurrentNode(newNode);
        setIsPlayerTurn(false);
        setFeedback(`Good! You played ${moveString}`);

        // Check if we've reached the end of this variation
        if (
          newNode.isEndOfVariation ||
          Object.keys(newNode.children).length === 0
        ) {
          setFeedback(
            `Excellent! You've completed this variation. ${
              newNode.comment || ""
            }`
          );
          setIsComplete(true);
          onGameStateChange?.({
            position: game.fen(),
            moveHistory: newMoveHistory,
            currentNode: newNode,
            feedback: `Variation complete! ${newNode.comment || ""}`,
            isComplete: true,
          });
          return true;
        }

        // Make opponent move after a short delay
        setTimeout(() => {
          makeOpponentMove(newNode, newMoveHistory);
        }, 800);

        return true;
      } catch (error) {
        console.error("Error making player move:", error);
        return false;
      }
    },
    [
      isPlayerTurn,
      isComplete,
      game,
      currentNode,
      moveHistory,
      onGameStateChange,
      makeOpponentMove,
    ]
  );

  // Handle initial Black move when component mounts
  useEffect(() => {
    if (!isPlayerTurn && moveHistory.length === 7) {
      // Just after Bc4
      const timer = setTimeout(() => {
        makeOpponentMove(currentNode, moveHistory);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    isPlayerTurn,
    moveHistory.length,
    currentNode,
    makeOpponentMove,
    moveHistory,
  ]);

  const handleVariationToggle = (move: string) => {
    setSelectedVariations((prev) => {
      const newSelection = prev.includes(move)
        ? prev.filter((m) => m !== move)
        : [...prev, move];

      // Ensure at least one variation is always selected
      return newSelection.length > 0 ? newSelection : [move];
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Chess Board */}
        <div className="flex-1">
          <div className="win95-panel p-4">
            <BoardDisplay
              position={gamePosition}
              onPieceDrop={onDrop}
              isPlayerTurn={isPlayerTurn}
              isComplete={isComplete}
              selectedTheme={selectedTheme}
            />

            <GameStatus feedback={feedback} />

            <GameControls onReset={resetGame} isComplete={isComplete} />
          </div>
        </div>

        {/* Right Side Panel */}
        <SidePanel
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
          availableVariations={availableVariations}
          selectedVariations={selectedVariations}
          onVariationToggle={handleVariationToggle}
          moveHistory={moveHistory}
        />
      </div>
    </div>
  );
}
