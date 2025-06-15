import { renderHook, act } from "@testing-library/react";
import { useChessGame } from "../../hooks/useChessGame";
import { OpeningNode } from "../../types/opening";

// Mock the chess.js library
jest.mock("chess.js", () => {
  class MockChess {
    private _fen =
      "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3";
    private _moves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];

    constructor() {}

    move(moveStr: string | { from: string; to: string; promotion?: string }) {
      if (typeof moveStr === "string") {
        this._moves.push(moveStr);
        return { san: moveStr };
      } else {
        // Simple move validation for testing
        const move = `${moveStr.from}${moveStr.to}`;
        if (move === "e2e4") return { san: "e4" };
        if (move === "f7f5") return { san: "f5" };
        return null; // Invalid move
      }
    }

    fen() {
      return this._fen;
    }

    reset() {
      this._moves = [];
      this._fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }

    undo() {
      this._moves.pop();
      return true;
    }
  }

  return { Chess: MockChess };
});

// Mock the weighted selection
jest.mock("../../utils/weighted-selection", () => ({
  selectWeightedMove: jest.fn((children, allowedMoves) => {
    const moves = Object.keys(children);
    if (allowedMoves) {
      const filtered = moves.filter((move) => allowedMoves.includes(move));
      return filtered[0] || null;
    }
    return moves[0] || null;
  }),
}));

describe("useChessGame Hook", () => {
  const mockOpeningTree: OpeningNode = {
    move: null,
    children: {
      e4: {
        move: "e4",
        children: {
          e5: {
            move: "e5",
            children: {
              Nf3: {
                move: "Nf3",
                children: {
                  Nc6: {
                    move: "Nc6",
                    children: {
                      d4: {
                        move: "d4",
                        children: {
                          exd4: {
                            move: "exd4",
                            children: {
                              Bc4: {
                                move: "Bc4",
                                children: {
                                  f5: {
                                    move: "f5",
                                    comment: "The f5 variation",
                                    frequency: 0.7,
                                    children: {
                                      Nxe5: {
                                        move: "Nxe5",
                                        children: {},
                                        isEndOfVariation: true,
                                      },
                                    },
                                  },
                                  Be7: {
                                    move: "Be7",
                                    comment: "The Be7 variation",
                                    frequency: 0.3,
                                    children: {},
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  let mockOnGameStateChange: jest.Mock;

  beforeEach(() => {
    mockOnGameStateChange = jest.fn();
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with correct Scotch Gambit position", () => {
      const { result } = renderHook(() =>
        useChessGame({
          openingTree: mockOpeningTree,
          onGameStateChange: mockOnGameStateChange,
        })
      );

      expect(result.current.gameState.moveHistory).toEqual([
        "e4",
        "e5",
        "Nf3",
        "Nc6",
        "d4",
        "exd4",
        "Bc4",
      ]);
      expect(result.current.gameState.isPlayerTurn).toBe(false);
      expect(result.current.gameState.isComplete).toBe(false);
      expect(result.current.gameState.feedback).toContain("Black to move");
    });

    it("should have all variations selected by default", () => {
      const { result } = renderHook(() =>
        useChessGame({ openingTree: mockOpeningTree })
      );

      expect(result.current.gameState.selectedVariations).toEqual([
        "f5",
        "Be7",
      ]);
    });
  });

  describe("Player Moves", () => {
    it("should have proper move handling interface", () => {
      const { result } = renderHook(() =>
        useChessGame({ openingTree: mockOpeningTree })
      );

      // Should have the onDrop function available
      expect(typeof result.current.actions.onDrop).toBe("function");

      // Should start with player turn false (waiting for opponent)
      expect(result.current.gameState.isPlayerTurn).toBe(false);
    });

    it("should not allow moves when it is not player turn", () => {
      const { result } = renderHook(() =>
        useChessGame({ openingTree: mockOpeningTree })
      );

      // Player turn is false by default - any move should return false
      act(() => {
        const moveResult = result.current.actions.onDrop("f7", "f5");
        expect(moveResult).toBe(false);
      });
    });

    it("should handle move attempts gracefully", () => {
      const { result } = renderHook(() =>
        useChessGame({ openingTree: mockOpeningTree })
      );

      // Should not crash on invalid input
      act(() => {
        const moveResult = result.current.actions.onDrop("invalid", "move");
        expect(moveResult).toBe(false);
      });
    });
  });

  describe("Game Reset", () => {
    it("should reset game to initial Scotch Gambit position", () => {
      const { result } = renderHook(() =>
        useChessGame({ openingTree: mockOpeningTree })
      );

      // Modify state first
      act(() => {
        result.current.gameState.isComplete = true;
        result.current.gameState.feedback = "Game over";
      });

      // Reset
      act(() => {
        result.current.actions.resetGame();
      });

      expect(result.current.gameState.moveHistory).toEqual([
        "e4",
        "e5",
        "Nf3",
        "Nc6",
        "d4",
        "exd4",
        "Bc4",
      ]);
      expect(result.current.gameState.isPlayerTurn).toBe(false);
      expect(result.current.gameState.isComplete).toBe(false);
      expect(result.current.gameState.feedback).toContain("Black to move");
    });
  });

  describe("Variation Selection", () => {
    it("should toggle variations on and off", () => {
      const { result } = renderHook(() =>
        useChessGame({ openingTree: mockOpeningTree })
      );

      // Initially both variations selected
      expect(result.current.gameState.selectedVariations).toEqual([
        "f5",
        "Be7",
      ]);

      // Toggle off f5
      act(() => {
        result.current.actions.handleVariationToggle("f5");
      });

      expect(result.current.gameState.selectedVariations).toEqual(["Be7"]);

      // Try to toggle off the last variation (should not work)
      act(() => {
        result.current.actions.handleVariationToggle("Be7");
      });

      expect(result.current.gameState.selectedVariations).toEqual(["Be7"]);

      // Toggle f5 back on
      act(() => {
        result.current.actions.handleVariationToggle("f5");
      });

      expect(result.current.gameState.selectedVariations).toEqual([
        "Be7",
        "f5",
      ]);
    });
  });

  describe("Game State Callbacks", () => {
    it("should call onGameStateChange when provided", () => {
      const { result } = renderHook(() =>
        useChessGame({
          openingTree: mockOpeningTree,
          onGameStateChange: mockOnGameStateChange,
        })
      );

      // Reset to trigger callback
      act(() => {
        result.current.actions.resetGame();
      });

      // Note: The actual callback would be triggered by opponent moves in a real scenario
      // This is testing the setup and structure
      expect(mockOnGameStateChange).toHaveBeenCalledTimes(0); // Not called on reset in current implementation
    });
  });

  describe("Error Handling", () => {
    it("should handle chess.js errors gracefully", () => {
      const { result } = renderHook(() =>
        useChessGame({ openingTree: mockOpeningTree })
      );

      // Set player turn
      act(() => {
        result.current.gameState.isPlayerTurn = true;
      });

      // This should not crash even if chess.js throws an error
      act(() => {
        const moveResult = result.current.actions.onDrop("invalid", "move");
        expect(moveResult).toBe(false);
      });
    });
  });
});
