import { useMemo } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceRenderObject } from "react-chessboard";

interface BoardTheme {
  name: string;
  darkSquares: string;
  lightSquares: string;
}

interface BoardDisplayProps {
  position: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  isPlayerTurn: boolean;
  isComplete: boolean;
  selectedTheme: BoardTheme;
  boardOrientation: "white" | "black";
}

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

export default function BoardDisplay({
  position,
  onPieceDrop,
  isPlayerTurn,
  isComplete,
  selectedTheme,
  boardOrientation,
}: BoardDisplayProps) {
  // Custom pieces with SVG images
  const customPieces = useMemo(() => {
    const pieceComponents: PieceRenderObject = {};
    pieces.forEach((piece) => {
      pieceComponents[piece] = () => (
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            backgroundImage: `url(/pieces/${piece.toLowerCase()}.svg)`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      );
    });
    return pieceComponents;
  }, []);

  return (
    <div className="win95-raised p-2">
      <div className="w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] mx-auto">
        <Chessboard
          options={{
            position,
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              targetSquare ? onPieceDrop(sourceSquare, targetSquare) : false,
            boardOrientation,
            allowDragging: isPlayerTurn && !isComplete,
            darkSquareStyle: {
              backgroundColor: selectedTheme.darkSquares,
            },
            lightSquareStyle: {
              backgroundColor: selectedTheme.lightSquares,
            },
            dropSquareStyle: {
              boxShadow: "inset 0 0 1px 4px #FF0000",
            },
            pieces: customPieces,
            animationDurationInMs: 200,
          }}
        />
      </div>
    </div>
  );
}

export type { BoardTheme };
