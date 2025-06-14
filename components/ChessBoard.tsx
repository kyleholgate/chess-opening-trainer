"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
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

interface BoardTheme {
  name: string;
  darkSquares: string;
  lightSquares: string;
}

const RETRO_BOARD_THEMES: BoardTheme[] = [
  {
    name: "Classic Beige",
    darkSquares: "#808080",
    lightSquares: "#C3C3C3",
  },
  {
    name: "Teal Gray",
    darkSquares: "#008080",
    lightSquares: "#DFDFDF",
  },
  {
    name: "Monochrome",
    darkSquares: "#404040",
    lightSquares: "#FFFFFF",
  },
];

const pieces = [
  "wP",
  "wN",
  "wB",
  "wR",
  "wQ",
  "wK",
  "bP",
  "bN",
  "bB",
  "bR",
  "bQ",
  "bK",
];

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

  // Custom pieces with PNG images
  const customPieces = useMemo(() => {
    const pieceComponents: {
      [key: string]: ({
        squareWidth,
      }: {
        squareWidth: number;
      }) => React.ReactElement;
    } = {};
    pieces.forEach((piece) => {
      pieceComponents[piece] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/pieces/${piece}.svg)`,
            backgroundSize: "100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      );
    });
    return pieceComponents;
  }, []);

  // Get available variations (Black's responses after Bc4)
  const getAvailableVariations = () => {
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
            <div className="win95-raised p-2">
              <div className="w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] mx-auto">
                <Chessboard
                  position={gamePosition}
                  onPieceDrop={onDrop}
                  boardOrientation="white"
                  arePiecesDraggable={isPlayerTurn && !isComplete}
                  customDarkSquareStyle={{
                    backgroundColor: selectedTheme.darkSquares,
                  }}
                  customLightSquareStyle={{
                    backgroundColor: selectedTheme.lightSquares,
                  }}
                  customDropSquareStyle={{
                    boxShadow: "inset 0 0 1px 4px #FF0000",
                  }}
                  customPieces={customPieces}
                  animationDuration={200}
                />
              </div>
            </div>

            {/* Feedback Area */}
            <div className="win95-panel p-3 mt-4">
              <div className="font-vt323 text-black text-sm">
                <div className="font-bold mb-1">Status:</div>
                <div>{feedback}</div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2 mt-4">
              <button onClick={resetGame} className="win95-button font-vt323">
                New Game
              </button>
              {isComplete && (
                <button onClick={resetGame} className="win95-button font-vt323">
                  Play Again
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Panel - Settings and History */}
        <div className="w-full lg:flex-1 lg:min-w-32 lg:max-w-80">
          {/* Theme Selector */}
          <div className="win95-raised p-3 mb-4">
            <div className="win95-titlebar mb-2">
              <span className="font-vt323 text-xs">Board Theme</span>
            </div>
            <div className="space-y-2">
              {RETRO_BOARD_THEMES.map((theme) => (
                <label
                  key={theme.name}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="theme"
                    checked={selectedTheme.name === theme.name}
                    onChange={() => setSelectedTheme(theme)}
                    className="win95-radio"
                  />
                  <span className="font-vt323 text-xs text-black">
                    {theme.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Variations */}
          <div className="win95-raised p-3 mb-4">
            <div className="win95-titlebar mb-2">
              <span className="font-vt323 text-xs">Practice Against</span>
            </div>
            <div className="space-y-2">
              {availableVariations.map((variation) => (
                <label
                  key={variation.move}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedVariations.includes(variation.move)}
                    onChange={() => handleVariationToggle(variation.move)}
                    className="win95-checkbox"
                  />
                  <span className="font-vt323 text-xs text-black font-bold">
                    {variation.move}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Move History */}
          <div className="win95-raised p-3">
            <div className="win95-titlebar mb-2">
              <span className="font-vt323 text-xs">Move History</span>
            </div>
            <div className="win95-input p-2 h-24 overflow-y-auto">
              <div className="font-vt323 text-xs text-black leading-tight">
                {moveHistory.map((move, index) => {
                  const moveNumber = Math.floor(index / 2) + 1;
                  const isWhiteMove = index % 2 === 0;
                  return (
                    <span key={index}>
                      {isWhiteMove && `${moveNumber}. `}
                      {move}
                      {!isWhiteMove && " "}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
