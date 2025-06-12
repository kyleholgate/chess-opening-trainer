"use client";

import { useState, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { OpeningNode } from "../types/opening";
import { selectWeightedMove } from "../utils/weighted-selection";
import { isValidMove, navigateToNode } from "../utils/opening-parser";

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
  const [game] = useState(() => new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState(openingTree);
  const [feedback, setFeedback] = useState("Make your first move: e4");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  // Reset game to starting position
  const resetGame = useCallback(() => {
    game.reset();
    setGamePosition(game.fen());
    setMoveHistory([]);
    setCurrentNode(openingTree);
    setFeedback("Make your first move: e4");
    setIsPlayerTurn(true);
    setIsComplete(false);
  }, [game, openingTree]);

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
    ]
  );

  // Make opponent move using weighted selection
  const makeOpponentMove = useCallback(
    (node: OpeningNode, history: string[]) => {
      const opponentMove = selectWeightedMove(node.children);

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
            `Black played ${opponentMove}. Your only correct response is ${nextMoves[0]}`
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
    [game, onGameStateChange]
  );

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-[500px] h-[500px] sm:w-[600px] sm:h-[600px]">
        <Chessboard
          position={gamePosition}
          onPieceDrop={onDrop}
          boardOrientation="white"
          arePiecesDraggable={isPlayerTurn && !isComplete}
          customBoardStyle={{
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        />
      </div>

      <div className="text-center max-w-md">
        <p className="text-lg font-semibold mb-2 text-gray-800">{feedback}</p>
        {currentNode.comment && (
          <p className="text-base text-gray-700 italic font-medium">
            {currentNode.comment}
          </p>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Reset Game
        </button>

        {isComplete && (
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Practice Again
          </button>
        )}
      </div>

      {moveHistory.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-800">Move History:</h3>
          <p className="text-base font-mono text-gray-800">
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
      )}
    </div>
  );
}
