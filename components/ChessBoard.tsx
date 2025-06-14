"use client";

import { useState, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { motion, AnimatePresence } from "motion/react";
import { OpeningNode } from "../types/opening";
import { selectWeightedMove } from "../utils/weighted-selection";
import { isValidMove } from "../utils/opening-parser";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  border?: string;
}

const BOARD_THEMES: BoardTheme[] = [
  {
    name: "Wooden",
    darkSquares: "#B8860B",
    lightSquares: "#F5DEB3",
    border: "#8B5A2B",
  },
  {
    name: "Classic",
    darkSquares: "#8B4513",
    lightSquares: "#F0D9B5",
    border: "#654321",
  },
  {
    name: "Blue",
    darkSquares: "#4A90E2",
    lightSquares: "#E3F2FD",
    border: "#2171B5",
  },
  {
    name: "Green",
    darkSquares: "#769656",
    lightSquares: "#EEEED2",
    border: "#5A7A3A",
  },
  {
    name: "Purple",
    darkSquares: "#8B4789",
    lightSquares: "#E8D5E8",
    border: "#6B3569",
  },
  {
    name: "Modern",
    darkSquares: "#2D3748",
    lightSquares: "#F7FAFC",
    border: "#1A202C",
  },
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
    BOARD_THEMES[0]
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle responsive sidebar - open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        setFeedback("🎉 You've reached the end of this line!");
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
          setFeedback(`❌ "${moveString}" is not the correct move. Try again!`);
          return false;
        }

        // Valid move - update state
        const newMoveHistory = [...moveHistory, moveString];
        const newNode = currentNode.children[moveString];

        setGamePosition(game.fen());
        setMoveHistory(newMoveHistory);
        setCurrentNode(newNode);
        setIsPlayerTurn(false);
        setFeedback(`✅ Good! You played ${moveString}`);

        // Check if we've reached the end of this variation
        if (
          newNode.isEndOfVariation ||
          Object.keys(newNode.children).length === 0
        ) {
          setFeedback(
            `🎉 Excellent! You've completed this variation. ${
              newNode.comment || ""
            }`
          );
          setIsComplete(true);
          onGameStateChange?.({
            position: game.fen(),
            moveHistory: newMoveHistory,
            currentNode: newNode,
            feedback: `🎉 Variation complete! ${newNode.comment || ""}`,
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
    <TooltipProvider>
      <div className="w-full">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <div className="lg:flex lg:h-screen">
          {/* Sidebar */}
          <motion.div
            className="fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto bg-white shadow-lg border-r border-gray-200 overflow-hidden"
            initial={false}
            animate={{
              width: sidebarOpen ? 320 : 0,
              x: sidebarOpen
                ? 0
                : typeof window !== "undefined" && window.innerWidth < 1024
                ? -320
                : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            style={{
              display:
                sidebarOpen ||
                (typeof window !== "undefined" && window.innerWidth >= 1024)
                  ? "block"
                  : "none",
            }}
          >
            <div className="p-6 space-y-6 h-full overflow-y-auto">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Settings
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  ✕
                </Button>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">
                  Board Theme
                </label>
                <Select
                  value={selectedTheme.name}
                  onValueChange={(value) => {
                    const theme = BOARD_THEMES.find((t) => t.name === value);
                    if (theme) setSelectedTheme(theme);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARD_THEMES.map((theme) => (
                      <SelectItem key={theme.name} value={theme.name}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Variation Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">
                  Practice Against
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {availableVariations.map((variation) => (
                    <Tooltip key={variation.move}>
                      <TooltipTrigger asChild>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-200">
                          <Checkbox
                            checked={selectedVariations.includes(
                              variation.move
                            )}
                            onCheckedChange={() =>
                              handleVariationToggle(variation.move)
                            }
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {variation.move}
                          </span>
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{variation.comment}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Move History */}
              {moveHistory.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900">
                    Move History
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm font-mono text-gray-800 leading-relaxed">
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
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="flex-1 flex flex-col"
            animate={{
              marginLeft:
                typeof window !== "undefined" &&
                window.innerWidth >= 1024 &&
                sidebarOpen
                  ? 0
                  : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
          >
            {/* Top Bar */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-4">
              <div className="flex items-center justify-between gap-2">
                {/* Settings toggle buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden"
                  >
                    ☰ Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex"
                  >
                    {sidebarOpen ? "← Hide Panel" : "→ Show Panel"}
                  </Button>
                </div>

                {/* Reset Game */}
                <Button onClick={resetGame} variant="default" size="sm">
                  Reset Game
                </Button>
              </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-start p-4 lg:p-6 space-y-4 lg:space-y-6">
              {/* Chess Board */}
              <div className="w-full max-w-[400px] aspect-square sm:max-w-[500px] md:max-w-[600px] lg:max-w-[600px]">
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
                    boxShadow: "inset 0 0 1px 6px rgba(255,255,0,0.75)",
                  }}
                  animationDuration={200}
                />
              </div>

              {/* Feedback */}
              <div className="text-center max-w-md px-4">
                <p className="text-base lg:text-lg font-semibold mb-2 text-gray-800">
                  {feedback}
                </p>
                {currentNode.comment && (
                  <p className="text-sm lg:text-base text-gray-700 italic font-medium">
                    {currentNode.comment}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {isComplete && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={resetGame}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Practice Again
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
