import { useState, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { OpeningDefinition, OpeningNode, PlayerColor } from "../types/opening";
import { selectWeightedMove } from "../utils/weighted-selection";
import { isValidMove } from "../utils/opening-parser";

type ChessColor = "w" | "b";

function toChessColor(color: PlayerColor): ChessColor {
  return color === "white" ? "w" : "b";
}

function getSideName(color: ChessColor): "White" | "Black" {
  return color === "w" ? "White" : "Black";
}

function moveListsMatch(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((move, index) => move === b[index]);
}

function navigateToNode(tree: OpeningNode, moves: string[]): OpeningNode {
  let node = tree;

  for (const move of moves) {
    if (!node.children[move]) {
      break;
    }
    node = node.children[move];
  }

  return node;
}

function playMoves(game: Chess, moves: string[]) {
  for (const move of moves) {
    game.move(move);
  }
}

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
  wrongMoveCount: number;
  canShowCorrectMove: boolean;
}

/**
 * Chess Game Actions Interface
 * Following P5: Simplify Interfaces for Common Cases - clear action methods
 */
export interface ChessGameActions {
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  resetGame: () => void;
  handleVariationToggle: (move: string) => void;
  showCorrectMove: () => void;
}

/**
 * Chess Game Hook Props
 */
interface UseChessGameProps {
  opening: OpeningDefinition;
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
 * const { gameState, actions } = useChessGame({ opening, onGameStateChange });
 * ```
 */
export function useChessGame({
  opening,
  onGameStateChange,
}: UseChessGameProps): {
  gameState: ChessGameState;
  actions: ChessGameActions;
} {
  const playerChessColor = toChessColor(opening.playerColor);

  // Initialize chess game with this opening's practice position
  const [game] = useState(() => {
    const g = new Chess();
    playMoves(g, opening.startingMoves);
    return g;
  });

  // Navigate to starting node in opening tree
  const getStartingNode = useCallback((): OpeningNode => {
    return navigateToNode(opening.tree, opening.startingMoves);
  }, [opening]);

  // Get available variations from the configured first opponent choice.
  const getAvailableVariations = useCallback(() => {
    const variationRootNode = navigateToNode(
      opening.tree,
      opening.variationRootMoves
    );

    return Object.keys(variationRootNode.children).map((move) => ({
      move,
      comment: variationRootNode.children[move].comment || "",
      frequency: variationRootNode.children[move].frequency ?? 0.5,
    }));
  }, [opening]);

  // Game state
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>(
    opening.startingMoves
  );
  const [currentNode, setCurrentNode] = useState(getStartingNode());
  const [feedback, setFeedback] = useState(opening.initialFeedback);
  const [isPlayerTurn, setIsPlayerTurn] = useState(
    game.turn() === playerChessColor
  );
  const [isComplete, setIsComplete] = useState(false);
  const [wrongMoveCount, setWrongMoveCount] = useState(0);

  const [availableVariations] = useState(getAvailableVariations());
  const [selectedVariations, setSelectedVariations] = useState<string[]>(
    availableVariations.map((v) => v.move) // Start with all variations selected
  );

  const getCorrectMoveFeedback = useCallback((node: OpeningNode): string => {
    const correctMoves = Object.keys(node.children);

    if (correctMoves.length === 0) {
      return "No further moves are available in this line.";
    }

    return correctMoves.length === 1
      ? `Correct move: ${correctMoves[0]}`
      : `Correct moves: ${correctMoves.join(", ")}`;
  }, []);

  // Make opponent move using weighted selection
  const makeOpponentMove = useCallback(
    (node: OpeningNode, history: string[]) => {
      const isVariationRoot = moveListsMatch(
        history,
        opening.variationRootMoves
      );
      const allowedMoves = isVariationRoot ? selectedVariations : undefined;
      const opponentMove = selectWeightedMove(node.children, allowedMoves);

      if (!opponentMove) {
        const comment = node.comment ? ` ${node.comment}` : "";
        setFeedback(
          (prevFeedback) =>
            `${prevFeedback}\n\nYou've reached the end of this line!${comment}`
        );
        setIsComplete(true);
        return;
      }

      try {
        const opponentSideName = getSideName(game.turn());
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
        setIsPlayerTurn(game.turn() === playerChessColor);
        setWrongMoveCount(0);

        const nextMoves = Object.keys(newNode.children);
        const comment = newNode.comment ? ` ${newNode.comment}` : "";

        // Append to existing feedback instead of replacing it
        setFeedback((prevFeedback) => {
          const opponentMoveInfo =
            nextMoves.length === 0
              ? `${opponentSideName} played ${opponentMove}. This line is complete!${comment}`
              : `${opponentSideName} played ${opponentMove}.${comment}`;

          return `${prevFeedback}\n\n${opponentMoveInfo}`;
        });

        if (nextMoves.length === 0) {
          setIsComplete(true);
        }

        onGameStateChange?.({
          position: game.fen(),
          moveHistory: newMoveHistory,
          currentNode: newNode,
          feedback: `${opponentSideName} played ${opponentMove}. ${
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
    [game, onGameStateChange, opening, playerChessColor, selectedVariations]
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
          const nextWrongMoveCount = wrongMoveCount + 1;
          setWrongMoveCount(nextWrongMoveCount);
          setFeedback(
            `"${moveString}" is not the correct move. Try again! (${nextWrongMoveCount}/3 wrong attempts)`
          );
          return false;
        }

        // Valid move - update state
        const newMoveHistory = [...moveHistory, moveString];
        const newNode = currentNode.children[moveString];

        setGamePosition(game.fen());
        setMoveHistory(newMoveHistory);
        setCurrentNode(newNode);
        setIsPlayerTurn(false);
        setWrongMoveCount(0);

        const nextMoves = Object.keys(newNode.children);
        const comment = newNode.comment ? ` ${newNode.comment}` : "";

        // Clear previous feedback and start fresh when the player makes a move
        if (nextMoves.length === 0) {
          setFeedback(
            `Great! You played ${moveString}. This line is complete!${comment}`
          );
          setIsComplete(true);
        } else {
          setFeedback(`Good! You played ${moveString}.${comment}`);

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
      wrongMoveCount,
      makeOpponentMove,
      onGameStateChange,
    ]
  );

  const showCorrectMove = useCallback(() => {
    const correctMoveFeedback = getCorrectMoveFeedback(currentNode);

    setFeedback((prevFeedback) =>
      prevFeedback.includes(correctMoveFeedback)
        ? prevFeedback
        : `${prevFeedback}\n\n${correctMoveFeedback}`
    );
  }, [currentNode, getCorrectMoveFeedback]);

  // Reset game to the selected opening position
  const resetGame = useCallback(() => {
    game.reset();
    playMoves(game, opening.startingMoves);

    setGamePosition(game.fen());
    setMoveHistory([...opening.startingMoves]);
    setCurrentNode(getStartingNode());
    setFeedback(opening.initialFeedback);
    setIsPlayerTurn(game.turn() === playerChessColor);
    setIsComplete(false);
    setWrongMoveCount(0);
  }, [game, getStartingNode, opening, playerChessColor]);

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

  // Auto-start openings where the opponent moves first from the practice position.
  useEffect(() => {
    const isAtStartingPosition = moveListsMatch(
      moveHistory,
      opening.startingMoves
    );

    if (
      isAtStartingPosition &&
      !isPlayerTurn &&
      !isComplete &&
      Object.keys(currentNode.children).length > 0
    ) {
      const timer = setTimeout(() => {
        makeOpponentMove(currentNode, moveHistory);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [
    moveHistory,
    opening,
    isPlayerTurn,
    isComplete,
    currentNode,
    makeOpponentMove,
  ]);

  // Combine state and actions
  const gameState: ChessGameState = {
    gamePosition,
    moveHistory,
    currentNode,
    feedback,
    isPlayerTurn,
    isComplete,
    selectedVariations,
    wrongMoveCount,
    canShowCorrectMove:
      wrongMoveCount >= 3 &&
      isPlayerTurn &&
      !isComplete &&
      Object.keys(currentNode.children).length > 0,
  };

  const actions: ChessGameActions = {
    onDrop,
    resetGame,
    handleVariationToggle,
    showCorrectMove,
  };

  return { gameState, actions };
}
