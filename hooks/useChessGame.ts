import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import { OpeningNode } from "../types/opening";
import { selectWeightedMove } from "../utils/weighted-selection";
import { isValidMove } from "../utils/opening-parser";

/**
 * Chess Game State Interface
 * Following P4: Design Deep Modules - simple interface for complex game state
 */
export interface ChessGameState {
  gamePosition: string;
  moveHistory: string[];
  currentNode: OpeningNode;
  feedback: string;
  isPlayerTurn: boolean;
  isComplete: boolean;
  selectedVariations: string[];
}

/**
 * Chess Game Actions Interface
 * Following P5: Simplify Interfaces for Common Cases - clear action methods
 */
export interface ChessGameActions {
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  resetGame: () => void;
  handleVariationToggle: (move: string) => void;
}

/**
 * Chess Game Hook Props
 */
interface UseChessGameProps {
  openingTree: OpeningNode;
  onGameStateChange?: (state: {
    position: string;
    moveHistory: string[];
    currentNode: OpeningNode;
    feedback: string;
    isComplete: boolean;
  }) => void;
}

/**
 * Custom hook for chess game logic
 *
 * A deep module that encapsulates all chess game state and logic behind a simple interface.
 * Following P4: Design Deep Modules - complex implementation, simple interface.
 * Following P10: Pull Complexity Downwards - handles all game logic internally.
 * Following P8: Separate General and Special-Purpose Logic - chess logic separate from UI.
 *
 * Handles:
 * - Chess game state management
 * - Move validation and execution
 * - Opening tree navigation
 * - Opponent move generation
 * - Game reset and variation selection
 *
 * @param props - Hook configuration
 * @returns Combined game state and actions
 *
 * @example
 * ```tsx
 * const { gameState, actions } = useChessGame({ openingTree, onGameStateChange });
 * ```
 */
export function useChessGame({
  openingTree,
  onGameStateChange,
}: UseChessGameProps): {
  gameState: ChessGameState;
  actions: ChessGameActions;
} {
  // Initialize chess game with Scotch Gambit position
  const [game] = useState(() => {
    const g = new Chess();
    // Set up Scotch Gambit position: 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4
    const scotchMoves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];
    scotchMoves.forEach((move) => g.move(move));
    return g;
  });

  // Scotch Gambit starting moves
  const SCOTCH_GAMBIT_MOVES = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];

  // Navigate to starting node in opening tree
  const getStartingNode = useCallback((): OpeningNode => {
    let node = openingTree;
    for (const move of SCOTCH_GAMBIT_MOVES) {
      if (node.children[move]) {
        node = node.children[move];
      }
    }
    return node;
  }, [openingTree]);

  // Get available variations (Black's responses after Bc4)
  const getAvailableVariations = useCallback(() => {
    const startingNode = getStartingNode();
    return Object.keys(startingNode.children).map((move) => ({
      move,
      comment: startingNode.children[move].comment || "",
      frequency: startingNode.children[move].frequency || 0.5,
    }));
  }, [getStartingNode]);

  // Game state
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>(SCOTCH_GAMBIT_MOVES);
  const [currentNode, setCurrentNode] = useState(getStartingNode());
  const [feedback, setFeedback] = useState(
    "Black to move. How will they respond to the Scotch Gambit?"
  );
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [availableVariations] = useState(getAvailableVariations());
  const [selectedVariations, setSelectedVariations] = useState<string[]>(
    availableVariations.map((v) => v.move) // Start with all variations selected
  );

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
    (sourceSquare: string, targetSquare: string): boolean => {
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

        const nextMoves = Object.keys(newNode.children);
        if (nextMoves.length === 0) {
          setFeedback(
            `Great! You played ${moveString}. This line is complete!`
          );
          setIsComplete(true);
        } else {
          setFeedback(`Good! You played ${moveString}. Black is thinking...`);

          // Make opponent move after a short delay
          setTimeout(() => {
            makeOpponentMove(newNode, newMoveHistory);
          }, 1000);
        }

        onGameStateChange?.({
          position: game.fen(),
          moveHistory: newMoveHistory,
          currentNode: newNode,
          feedback: `You played ${moveString}. ${newNode.comment || ""}`,
          isComplete:
            newNode.isEndOfVariation ||
            Object.keys(newNode.children).length === 0,
        });

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
      makeOpponentMove,
      onGameStateChange,
    ]
  );

  // Reset game to Scotch Gambit position
  const resetGame = useCallback(() => {
    game.reset();
    // Play the moves to reach Scotch Gambit position
    SCOTCH_GAMBIT_MOVES.forEach((move) => game.move(move));

    setGamePosition(game.fen());
    setMoveHistory([...SCOTCH_GAMBIT_MOVES]);
    setCurrentNode(getStartingNode());
    setFeedback("Black to move. How will they respond to the Scotch Gambit?");
    setIsPlayerTurn(false); // Black moves first from this position
    setIsComplete(false);
  }, [game, getStartingNode]);

  // Handle variation selection toggle
  const handleVariationToggle = useCallback((move: string) => {
    setSelectedVariations((prev) => {
      if (prev.includes(move)) {
        // Don't allow deselecting if it's the only one selected
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((m) => m !== move);
      } else {
        return [...prev, move];
      }
    });
  }, []);

  // Combine state and actions
  const gameState: ChessGameState = {
    gamePosition,
    moveHistory,
    currentNode,
    feedback,
    isPlayerTurn,
    isComplete,
    selectedVariations,
  };

  const actions: ChessGameActions = {
    onDrop,
    resetGame,
    handleVariationToggle,
  };

  return { gameState, actions };
}
