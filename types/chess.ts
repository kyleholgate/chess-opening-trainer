import { Square } from "chess.js";

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: "q" | "r" | "b" | "n";
}

export interface MoveResult {
  move: string; // SAN notation
  fen: string; // Resulting position
  isValid: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isStalemate?: boolean;
}

export type PieceSymbol = "p" | "n" | "b" | "r" | "q" | "k";
export type Color = "w" | "b";

export interface ChessPiece {
  type: PieceSymbol;
  color: Color;
}

export interface BoardPosition {
  [square: string]: ChessPiece;
}
