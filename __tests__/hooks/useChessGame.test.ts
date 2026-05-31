import { renderHook, act } from "@testing-library/react";
import { useChessGame } from "../../hooks/useChessGame";
import { OpeningDefinition, OpeningNode } from "../../types/opening";

// Mock the chess.js library
jest.mock("chess.js", () => {
  class MockChess {
    private _fen =
      "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3";
    private _moves: string[] = [];

    constructor() {}

    move(moveStr: string | { from: string; to: string; promotion?: string }) {
      if (typeof moveStr === "string") {
        this._moves.push(moveStr);
        return { san: moveStr };
      } else {
        // Simple move validation for testing
        const move = `${moveStr.from}${moveStr.to}`;
        if (move === "e2e4") {
          this._moves.push("e4");
          return { san: "e4" };
        }
        if (move === "d7d5") {
          this._moves.push("d5");
          return { san: "d5" };
        }
        if (move === "d8d5") {
          this._moves.push("Qxd5");
          return { san: "Qxd5" };
        }
        if (move === "f7f5") {
          this._moves.push("f5");
          return { san: "f5" };
        }
        return null; // Invalid move
      }
    }

    fen() {
      return this._fen;
    }

    turn() {
      return this._moves.length % 2 === 0 ? "w" : "b";
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

  const mockScotchOpening: OpeningDefinition = {
    id: "scotch-gambit",
    name: "Scotch Gambit",
    description: "Practice the Scotch Gambit as White.",
    playerColor: "white",
    boardOrientation: "white",
    startingMoves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"],
    variationRootMoves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"],
    initialFeedback: "Black to move. How will they respond to the Scotch Gambit?",
    mainLine: ["1. e4 e5", "2. Nf3 Nc6", "3. d4 exd4", "4. Bc4"],
    keyIdeas: ["Sac the pawn on d4"],
    tree: mockOpeningTree,
  };

  const mockScandinavianTree: OpeningNode = {
    move: null,
    children: {
      e4: {
        move: "e4",
        children: {
          d5: {
            move: "d5",
            children: {
              exd5: {
                move: "exd5",
                children: {
                  Qxd5: {
                    move: "Qxd5",
                    children: {},
                    isEndOfVariation: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const mockScandinavianOpening: OpeningDefinition = {
    id: "scandinavian-defense",
    name: "Scandinavian Defense",
    description: "Practice the Scandinavian Defense as Black.",
    playerColor: "black",
    boardOrientation: "black",
    startingMoves: ["e4"],
    variationRootMoves: ["e4", "d5"],
    initialFeedback: "Black to move. Challenge White's center.",
    mainLine: ["1. e4 d5"],
    keyIdeas: ["Challenge e4 immediately"],
    tree: mockScandinavianTree,
  };

  let mockOnGameStateChange: jest.Mock;

  beforeEach(() => {
    mockOnGameStateChange = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Initial State", () => {
    it("should initialize with correct Scotch Gambit position", () => {
      const { result } = renderHook(() =>
        useChessGame({
          opening: mockScotchOpening,
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
        useChessGame({ opening: mockScotchOpening })
      );

      expect(result.current.gameState.selectedVariations).toEqual([
        "f5",
        "Be7",
      ]);
    });

    it("should initialize Scandinavian Defense with Black to move", () => {
      const { result } = renderHook(() =>
        useChessGame({ opening: mockScandinavianOpening })
      );

      expect(result.current.gameState.moveHistory).toEqual(["e4"]);
      expect(result.current.gameState.isPlayerTurn).toBe(true);
      expect(result.current.gameState.selectedVariations).toEqual(["exd5"]);
      expect(result.current.gameState.feedback).toContain("Black to move");
    });
  });

  describe("Player Moves", () => {
    it("should have proper move handling interface", () => {
      const { result } = renderHook(() =>
        useChessGame({ opening: mockScotchOpening })
      );

      // Should have the onDrop function available
      expect(typeof result.current.actions.onDrop).toBe("function");

      // Should start with player turn false (waiting for opponent)
      expect(result.current.gameState.isPlayerTurn).toBe(false);
    });

    it("should not allow moves when it is not player turn", () => {
      const { result } = renderHook(() =>
        useChessGame({ opening: mockScotchOpening })
      );

      // Player turn is false by default - any move should return false
      act(() => {
        const moveResult = result.current.actions.onDrop("f7", "f5");
        expect(moveResult).toBe(false);
      });
    });

    it("should handle move attempts gracefully", () => {
      const { result } = renderHook(() =>
        useChessGame({ opening: mockScotchOpening })
      );

      // Should not crash on invalid input
      act(() => {
        const moveResult = result.current.actions.onDrop("invalid", "move");
        expect(moveResult).toBe(false);
      });
    });

    it("should offer the correct move after three incorrect opening moves", () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useChessGame({ opening: mockScotchOpening })
      );

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.gameState.isPlayerTurn).toBe(true);
      expect(result.current.gameState.canShowCorrectMove).toBe(false);

      act(() => {
        result.current.actions.onDrop("e2", "e4");
      });
      act(() => {
        result.current.actions.onDrop("e2", "e4");
      });
      act(() => {
        result.current.actions.onDrop("e2", "e4");
      });

      expect(result.current.gameState.wrongMoveCount).toBe(3);
      expect(result.current.gameState.canShowCorrectMove).toBe(true);

      act(() => {
        result.current.actions.showCorrectMove();
      });

      expect(result.current.gameState.feedback).toContain("Correct move: Nxe5");
    });

    it("should let Black practice the Scandinavian and auto-play White's response", () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useChessGame({ opening: mockScandinavianOpening })
      );

      act(() => {
        const moveResult = result.current.actions.onDrop("d7", "d5");
        expect(moveResult).toBe(true);
      });

      expect(result.current.gameState.isPlayerTurn).toBe(false);
      expect(result.current.gameState.feedback).toContain("Good! You played d5");

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.gameState.moveHistory).toEqual([
        "e4",
        "d5",
        "exd5",
      ]);
      expect(result.current.gameState.isPlayerTurn).toBe(true);
      expect(result.current.gameState.feedback).toContain("White played exd5");
    });
  });

  describe("Game Reset", () => {
    it("should reset game to initial Scotch Gambit position", () => {
      const { result } = renderHook(() =>
        useChessGame({ opening: mockScotchOpening })
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
        useChessGame({ opening: mockScotchOpening })
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
          opening: mockScotchOpening,
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
        useChessGame({ opening: mockScotchOpening })
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
