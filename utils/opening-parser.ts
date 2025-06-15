import { OpeningNode } from "../types/opening";

/**
 * Opening Tree Parser
 *
 * Utilities for parsing and validating chess opening tree data.
 * Following P4: Design Deep Modules - simple interface hiding complex validation logic.
 * Following P10: Pull Complexity Downwards - handles all parsing complexity internally.
 */

/**
 * Loads and parses the opening tree from JSON data
 *
 * @param jsonData - Raw JSON data from opening database
 * @returns Validated and parsed opening tree
 * @throws Error if data structure is invalid
 *
 * @example
 * ```tsx
 * const tree = parseOpeningTree(rawJsonData);
 * ```
 */
export function parseOpeningTree(jsonData: unknown): OpeningNode {
  if (!jsonData || typeof jsonData !== "object") {
    throw new Error("Invalid opening tree data: must be a valid object");
  }

  return validateOpeningNode(jsonData);
}

/**
 * Checks if a move is valid from the current node
 *
 * @param node - Current position node
 * @param move - Move to validate in SAN notation
 * @returns True if the move exists in the opening tree
 *
 * @example
 * ```tsx
 * if (isValidMove(currentNode, "e4")) {
 *   // Move is valid in opening theory
 * }
 * ```
 */
export function isValidMove(node: OpeningNode, move: string): boolean {
  return move in node.children;
}

/**
 * Validates an opening node recursively
 *
 * @param node - Raw node data to validate
 * @returns Validated opening node with proper typing
 * @throws Error if node structure is invalid
 *
 * @internal - Used internally by parseOpeningTree
 */
function validateOpeningNode(node: unknown): OpeningNode {
  if (!node || typeof node !== "object") {
    throw new Error("Invalid opening node: must be a valid object");
  }

  // Safe type assertion after runtime validation
  const nodeData = node as Record<string, unknown>;

  const validated: OpeningNode = {
    move: typeof nodeData.move === "string" ? nodeData.move : null,
    children: {},
  };

  // Validate optional fields with proper type checking
  if (typeof nodeData.comment === "string") {
    validated.comment = nodeData.comment;
  }

  if (
    typeof nodeData.frequency === "number" &&
    nodeData.frequency >= 0 &&
    nodeData.frequency <= 1
  ) {
    validated.frequency = nodeData.frequency;
  }

  if (nodeData.isEndOfVariation === true) {
    validated.isEndOfVariation = true;
  }

  // Validate children recursively
  if (nodeData.children && typeof nodeData.children === "object") {
    const children = nodeData.children as Record<string, unknown>;
    for (const [move, child] of Object.entries(children)) {
      if (typeof move === "string" && move.length > 0) {
        validated.children[move] = validateOpeningNode(child);
      }
    }
  }

  return validated;
}
