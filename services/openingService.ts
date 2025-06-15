import { OpeningNode } from "../types/opening";
import { parseOpeningTree } from "../utils/opening-parser";
import scotchGambitData from "../data/scotch-gambit.json";
import { TIMING, ERROR_MESSAGES } from "../constants/ui";

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
    try {
      // Start timing for consistent UX
      const startTime = Date.now();

      // Parse the opening data
      const parsedTree = parseOpeningTree(scotchGambitData);

      // Ensure minimum loading time for better UX perception
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      return parsedTree;
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
    // Placeholder for future multi-source support
    if (source === "scotch-gambit") {
      return this.loadOpeningTree();
    }
    throw new Error(`Unknown opening source: ${source}`);
  }
}

// Export singleton instance for convenience
export const openingService = new OpeningService();
