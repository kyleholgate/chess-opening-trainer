export interface OpeningNode {
  move: string | null; // SAN notation or null for root
  comment?: string; // Optional annotation or explanation
  children: Record<string, OpeningNode>;
  frequency?: number; // 0-1 weight for opponent move selection
  isEndOfVariation?: boolean; // True when this is a terminal node
}

export interface GameState {
  currentPosition: string; // FEN string
  moveHistory: string[]; // Array of SAN moves
  currentNode: OpeningNode; // Current position in opening tree
  isPlayerTurn: boolean; // True when it's the player's turn
  gameStatus: "playing" | "correct" | "incorrect" | "complete";
  feedback?: string; // Feedback message for the player
}
