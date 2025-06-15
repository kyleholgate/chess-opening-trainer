import { useMemo } from "react";
import { Chessboard } from "react-chessboard";

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
}: BoardDisplayProps) {
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

  return (
    <div className="win95-raised p-2">
      <div className="w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] mx-auto">
        <Chessboard
          position={position}
          onPieceDrop={onPieceDrop}
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
  );
}

export type { BoardTheme };
