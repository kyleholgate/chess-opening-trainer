import { OpeningDefinition, OpeningNode } from "../types/opening";
import { parseOpeningTree } from "../utils/opening-parser";
import scotchGambitData from "../data/scotch-gambit.json";
import scandinavianDefenseData from "../data/scandinavian-defense.json";
import { TIMING, ERROR_MESSAGES } from "../constants/ui";

type OpeningConfig = Omit<OpeningDefinition, "tree">;

const OPENING_CONFIGS: OpeningConfig[] = [
  {
    id: "scotch-gambit",
    name: "Scotch Gambit",
    description: "Practice the Scotch Gambit as White from 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4.",
    playerColor: "white",
    boardOrientation: "white",
    startingMoves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"],
    variationRootMoves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"],
    initialFeedback: "Black to move. How will they respond to the Scotch Gambit?",
    mainLine: ["1. e4 e5", "2. Nf3 Nc6", "3. d4 exd4", "4. Bc4"],
    keyIdeas: [
      "Sac the pawn on d4",
      "Get up in that f7",
      "Look for game-winning traps",
    ],
  },
  {
    id: "scandinavian-defense",
    name: "Scandinavian Defense",
    description: "Practice the Scandinavian Defense as Black, starting after White plays 1.e4.",
    playerColor: "black",
    boardOrientation: "black",
    startingMoves: ["e4"],
    variationRootMoves: ["e4", "d5"],
    initialFeedback: "Black to move. Challenge White's center with the Scandinavian Defense.",
    mainLine: [
      "1. e4 d5",
      "2. exd5 Qxd5",
      "3. Nc3 Qa5",
      "4. d4 c6",
      "5. Nf3 Nf6",
      "6. Bc4 Bf5",
    ],
    keyIdeas: [
      "Challenge e4 immediately with ...d5",
      "Use ...Qa5, ...c6, ...Nf6, and ...Bf5",
      "Know the b4 queen chase and Portuguese/Icelandic traps",
    ],
  },
];

const OPENING_DATA_BY_ID: Record<string, unknown> = {
  "scotch-gambit": scotchGambitData,
  "scandinavian-defense": scandinavianDefenseData,
};

/**
 * Opening Data Service
 *
 * A deep module providing opening data operations with error handling and timing control.
 * Following P4: Design Deep Modules - simple interface hiding complex data loading logic.
 * Following P8: Separate General and Special-Purpose Logic - general data operations.
 * Following P10: Pull Complexity Downwards - handles parsing, timing, and error recovery.
 *
 * Encapsulates:
 * - Data loading and parsing
 * - Error handling and recovery
 * - Loading timing for UX consistency
 * - Future extensibility for multiple opening data sources
 */
export class OpeningService {
  /**
   * Loads and parses opening tree data with consistent timing
   *
   * @param minimumLoadTime - Minimum time to show loading screen (for UX consistency)
   * @returns Promise resolving to parsed opening tree
   * @throws Error with user-friendly message if loading fails
   *
   * @example
   * ```tsx
   * const service = new OpeningService();
   * try {
   *   const tree = await service.loadOpeningTree();
   *   // Use tree data
   * } catch (error) {
   *   // Handle error with user-friendly message
   * }
   * ```
   */
  async loadOpeningTree(
    minimumLoadTime: number = TIMING.LOADING_MINIMUM_DISPLAY
  ): Promise<OpeningNode> {
    const openings = await this.loadOpenings(minimumLoadTime);
    const scotchOpening = openings.find((opening) => opening.id === "scotch-gambit");

    if (!scotchOpening) {
      throw new Error(ERROR_MESSAGES.LOAD_FAILED);
    }

    return scotchOpening.tree;
  }

  /**
   * Loads all bundled opening definitions.
   *
   * @param minimumLoadTime - Minimum time to show loading screen
   * @returns Promise resolving to parsed opening definitions
   */
  async loadOpenings(
    minimumLoadTime: number = TIMING.LOADING_MINIMUM_DISPLAY
  ): Promise<OpeningDefinition[]> {
    try {
      // Start timing for consistent UX
      const startTime = Date.now();

      // Parse the opening data
      const openings = OPENING_CONFIGS.map((config) => ({
        ...config,
        tree: parseOpeningTree(OPENING_DATA_BY_ID[config.id]),
      }));

      // Ensure minimum loading time for better UX perception
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      return openings;
    } catch (error) {
      // Log for debugging while providing user-friendly error
      console.error("Opening tree loading failed:", error);
      throw new Error(ERROR_MESSAGES.LOAD_FAILED);
    }
  }

  /**
   * Validates opening tree data structure
   *
   * @param data - Raw opening data to validate
   * @returns True if data structure is valid
   *
   * @internal - Used internally for data validation
   */
  private validateOpeningData(data: unknown): data is OpeningNode {
    // Simple validation - could be expanded with Zod schema
    return typeof data === "object" && data !== null && "move" in data;
  }

  /**
   * Future: Could support multiple opening databases
   * Following P7: Favor "Somewhat General-Purpose" Modules
   */
  async loadOpeningFromSource(source: string): Promise<OpeningNode> {
    if (!(source in OPENING_DATA_BY_ID)) {
      throw new Error(`Unknown opening source: ${source}`);
    }

    return parseOpeningTree(OPENING_DATA_BY_ID[source]);
  }
}

// Export singleton instance for convenience
export const openingService = new OpeningService();
