import { openingService } from "../../services/openingService";

// Mock the opening parser
jest.mock("../../utils/opening-parser", () => ({
  parseOpeningTree: jest.fn(),
}));

// Mock the opening data
jest.mock(
  "../../data/scotch-gambit.json",
  () => ({
    move: null,
    children: {
      e4: {
        move: "e4",
        children: {
          e5: { move: "e5", children: {} },
        },
      },
    },
  }),
  { virtual: true }
);

// Mock constants
jest.mock("../../constants/ui", () => ({
  TIMING: {
    LOADING_MINIMUM_DISPLAY: 100,
  },
  ERROR_MESSAGES: {
    LOAD_FAILED: "Failed to load opening data",
  },
}));

import { parseOpeningTree } from "../../utils/opening-parser";

describe("OpeningService", () => {
  const mockParseOpeningTree = parseOpeningTree as jest.MockedFunction<
    typeof parseOpeningTree
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  describe("loadOpeningTree", () => {
    it("should successfully load and parse opening data", async () => {
      const mockParsedTree = {
        move: null,
        children: {
          e4: {
            move: "e4",
            children: {},
          },
        },
      };

      mockParseOpeningTree.mockReturnValue(mockParsedTree);

      const loadPromise = openingService.loadOpeningTree();

      // Fast-forward past the minimum display time
      jest.advanceTimersByTime(100);

      const result = await loadPromise;

      expect(mockParseOpeningTree).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockParsedTree);
    });

    it("should handle parsing errors gracefully", async () => {
      const mockError = new Error("Invalid data format");
      mockParseOpeningTree.mockImplementation(() => {
        throw mockError;
      });

      await expect(openingService.loadOpeningTree()).rejects.toThrow(
        "Failed to load opening data"
      );
      expect(mockParseOpeningTree).toHaveBeenCalledTimes(1);
    });

    it("should respect minimum loading time for UX", async () => {
      const mockParsedTree = {
        move: null,
        children: {},
      };

      mockParseOpeningTree.mockReturnValue(mockParsedTree);

      const startTime = Date.now();
      const loadPromise = openingService.loadOpeningTree();

      // Don't advance timers yet
      const resultPromise = loadPromise.then(() => {
        const endTime = Date.now();
        return endTime - startTime;
      });

      // Fast-forward and resolve
      jest.advanceTimersByTime(100);

      const duration = await resultPromise;

      // Should have waited at least the minimum time
      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it("should support custom minimum load times", async () => {
      const mockParsedTree = { move: null, children: {} };
      mockParseOpeningTree.mockReturnValue(mockParsedTree);

      const loadPromise = openingService.loadOpeningTree(200);
      jest.advanceTimersByTime(200);
      const result = await loadPromise;

      expect(result).toEqual(mockParsedTree);
    });
  });

  describe("Multi-source support", () => {
    it("should load from scotch-gambit source", async () => {
      const mockParsedTree = { move: null, children: {} };
      mockParseOpeningTree.mockReturnValue(mockParsedTree);

      const loadPromise = openingService.loadOpeningFromSource("scotch-gambit");
      jest.advanceTimersByTime(100);
      const result = await loadPromise;

      expect(result).toEqual(mockParsedTree);
    });

    it("should reject unknown sources", async () => {
      await expect(
        openingService.loadOpeningFromSource("unknown-opening")
      ).rejects.toThrow("Unknown opening source: unknown-opening");
    });
  });

  describe("Error Scenarios", () => {
    it("should provide meaningful error messages", async () => {
      mockParseOpeningTree.mockImplementation(() => {
        throw new Error("Malformed JSON");
      });

      await expect(openingService.loadOpeningTree()).rejects.toThrow(
        "Failed to load opening data"
      );
    });

    it("should handle various parser errors", async () => {
      const testCases = [
        new Error("Network error"),
        new Error("Permission denied"),
        new Error("Invalid format"),
      ];

      for (const testError of testCases) {
        mockParseOpeningTree.mockImplementation(() => {
          throw testError;
        });

        await expect(openingService.loadOpeningTree()).rejects.toThrow(
          "Failed to load opening data"
        );
      }
    });
  });

  describe("Performance", () => {
    it("should not block the main thread for long periods", async () => {
      const mockParsedTree = { move: null, children: {} };
      mockParseOpeningTree.mockReturnValue(mockParsedTree);

      const startTime = Date.now();
      const loadPromise = openingService.loadOpeningTree();

      // Should return control quickly
      const controlReturnTime = Date.now();
      expect(controlReturnTime - startTime).toBeLessThan(50);

      jest.advanceTimersByTime(100);
      await loadPromise;
    });
  });
});
