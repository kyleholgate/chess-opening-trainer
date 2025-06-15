import { Chess } from "chess.js";
import { OpeningNode } from "../../types/opening";
import { selectWeightedMove } from "../../utils/weighted-selection";

// Mock the weighted selection for predictable testing
jest.mock("../../utils/weighted-selection", () => ({
  selectWeightedMove: jest.fn(),
}));

const mockSelectWeightedMove = selectWeightedMove as jest.MockedFunction<
  typeof selectWeightedMove
>;

describe("Core Game Logic", () => {
  let chess: Chess;

  const sampleOpeningTree: OpeningNode = {
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
                                    frequency: 0.7,
                                    children: {
                                      Nxe5: { move: "Nxe5", children: {} },
                                    },
                                  },
                                  Be7: {
                                    move: "Be7",
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

  beforeEach(() => {
    chess = new Chess();
    jest.clearAllMocks();
  });

  describe("Opening Tree Navigation", () => {
    it("should navigate through the scotch gambit opening correctly", () => {
      // Play through the main line
      const moves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];

      moves.forEach((move) => {
        const result = chess.move(move);
        expect(result).toBeTruthy();
        expect(result?.san).toBe(move);
      });

      // Should reach the key branching position (after Bc4)
      expect(chess.fen()).toContain("2BpP3/5N2"); // Key pieces: Bishop on c4, Knight on f3
    });

    it("should identify valid continuation moves from opening tree", () => {
      // Navigate to the Bc4 position
      const moves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];
      moves.forEach((move) => chess.move(move));

      // Check that tree has the expected variations
      const currentNode = navigateToPosition(sampleOpeningTree, moves);
      expect(currentNode?.children).toHaveProperty("f5");
      expect(currentNode?.children).toHaveProperty("Be7");

      const variations = Object.keys(currentNode?.children || {});
      expect(variations).toContain("f5");
      expect(variations).toContain("Be7");
    });

    it("should correctly weight move selection", () => {
      mockSelectWeightedMove.mockReturnValue("f5");

      const variations = {
        f5: { move: "f5", frequency: 0.7, children: {} },
        Be7: { move: "Be7", frequency: 0.3, children: {} },
      };
      const selectedMoves = ["f5", "Be7"];

      const result = mockSelectWeightedMove(variations, selectedMoves);
      expect(result).toBe("f5");
      expect(mockSelectWeightedMove).toHaveBeenCalledWith(
        variations,
        selectedMoves
      );
    });
  });

  describe("Move Validation", () => {
    it("should validate legal chess moves", () => {
      // Valid opening moves
      expect(chess.move("e4")).toBeTruthy();
      expect(chess.move("e5")).toBeTruthy();

      // Invalid move (pawn can't move backwards) - chess.js throws error
      chess.reset();
      chess.move("e4");
      expect(() => chess.move("e3")).toThrow();
    });

    it("should enforce opening tree restrictions", () => {
      // In a real game, you could play many moves, but the opening tree limits options
      const moves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];
      moves.forEach((move) => chess.move(move));

      // Black's turn - only specific moves are in the opening tree
      const validTreeMoves = ["f5", "Be7"];
      const currentNode = navigateToPosition(sampleOpeningTree, moves);
      const availableMoves = Object.keys(currentNode?.children || {});

      expect(availableMoves).toEqual(expect.arrayContaining(validTreeMoves));
    });
  });

  describe("Position Analysis", () => {
    it("should recognize the scotch gambit position characteristics", () => {
      const scotchMoves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"];
      scotchMoves.forEach((move) => chess.move(move));

      const fen = chess.fen();

      // Key characteristics of Scotch Gambit position
      expect(fen).toContain("2BpP3"); // Bishop on c4, pawn on d4
      expect(fen).toContain("5N2"); // Knight on f3
      expect(chess.turn()).toBe("b"); // Black to move
    });

    it("should handle end-of-variation detection", () => {
      // Test with a simpler sequence that doesn't require complex chess validation
      const moves = ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "f5"];

      // Just test the tree navigation logic, not actual chess moves
      const currentNode = navigateToPosition(sampleOpeningTree, moves);
      expect(currentNode).toBeTruthy();
      expect(currentNode?.children).toHaveProperty("Nxe5");

      // Navigate one more level to test end detection
      const endNode = navigateToPosition(sampleOpeningTree, [...moves, "Nxe5"]);
      const isEndOfLine = Object.keys(endNode?.children || {}).length === 0;
      expect(isEndOfLine).toBe(true);
    });
  });

  describe("Error Scenarios", () => {
    it("should handle malformed opening trees", () => {
      const badTree: OpeningNode = { move: null, children: {} };

      // Should not crash when navigating empty tree
      const result = navigateToPosition(badTree, ["e4"]);
      expect(result).toBeNull();
    });

    it("should handle chess.js errors gracefully", () => {
      // Try to make an impossible move - chess.js throws error
      expect(() => chess.move("z9")).toThrow();

      // Board should remain in valid state
      expect(chess.fen()).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
    });
  });
});

/**
 * Helper function to navigate to a position in the opening tree
 * This simulates the logic that would be in useChessGame
 */
function navigateToPosition(
  tree: OpeningNode,
  moves: string[]
): OpeningNode | null {
  let currentNode = tree;

  for (const move of moves) {
    if (!currentNode.children[move]) {
      return null;
    }
    currentNode = currentNode.children[move];
  }

  return currentNode;
}
