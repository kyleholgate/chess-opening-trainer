import { OpeningNode } from "../types/opening";

/**
 * Loads and parses the opening tree from JSON data
 * @param jsonData - Raw JSON data
 * @returns Parsed opening tree
 */
export function parseOpeningTree(jsonData: unknown): OpeningNode {
  if (!jsonData || typeof jsonData !== "object") {
    throw new Error("Invalid opening tree data");
  }

  return validateOpeningNode(jsonData);
}

/**
 * Validates an opening node recursively
 * @param node - Node to validate
 * @returns Validated opening node
 */
function validateOpeningNode(node: unknown): OpeningNode {
  if (!node || typeof node !== "object") {
    throw new Error("Invalid opening node");
  }

  const validated: OpeningNode = {
    move: node.move || null,
    children: {},
  };

  // Optional fields
  if (node.comment) {
    validated.comment = String(node.comment);
  }

  if (
    typeof node.frequency === "number" &&
    node.frequency >= 0 &&
    node.frequency <= 1
  ) {
    validated.frequency = node.frequency;
  }

  if (node.isEndOfVariation === true) {
    validated.isEndOfVariation = true;
  }

  // Validate children recursively
  if (node.children && typeof node.children === "object") {
    for (const [move, child] of Object.entries(node.children)) {
      if (typeof move === "string" && move.length > 0) {
        validated.children[move] = validateOpeningNode(child);
      }
    }
  }

  return validated;
}

/**
 * Navigates to a specific node in the opening tree following a path of moves
 * @param root - Root node of the opening tree
 * @param moves - Array of moves in SAN notation
 * @returns The node at the end of the path, or null if path doesn't exist
 */
export function navigateToNode(
  root: OpeningNode,
  moves: string[]
): OpeningNode | null {
  let currentNode = root;

  for (const move of moves) {
    if (!currentNode.children[move]) {
      return null; // Path doesn't exist
    }
    currentNode = currentNode.children[move];
  }

  return currentNode;
}

/**
 * Gets all possible moves from a given node
 * @param node - Current node
 * @returns Array of possible moves in SAN notation
 */
export function getPossibleMoves(node: OpeningNode): string[] {
  return Object.keys(node.children);
}

/**
 * Checks if a move is valid from the current node
 * @param node - Current node
 * @param move - Move to check in SAN notation
 * @returns True if the move exists in the opening tree
 */
export function isValidMove(node: OpeningNode, move: string): boolean {
  return move in node.children;
}

/**
 * Gets the depth of the opening tree
 * @param node - Starting node
 * @returns Maximum depth from this node
 */
export function getTreeDepth(node: OpeningNode): number {
  if (Object.keys(node.children).length === 0) {
    return 0;
  }

  let maxDepth = 0;
  for (const child of Object.values(node.children)) {
    const childDepth = getTreeDepth(child);
    maxDepth = Math.max(maxDepth, childDepth + 1);
  }

  return maxDepth;
}

/**
 * Gets all terminal nodes (end of variations) from a starting node
 * @param node - Starting node
 * @param currentPath - Current path of moves
 * @returns Array of paths to terminal nodes
 */
export function getTerminalPaths(
  node: OpeningNode,
  currentPath: string[] = []
): string[][] {
  const paths: string[][] = [];

  if (node.isEndOfVariation || Object.keys(node.children).length === 0) {
    paths.push([...currentPath]);
    return paths;
  }

  for (const [move, child] of Object.entries(node.children)) {
    const childPaths = getTerminalPaths(child, [...currentPath, move]);
    paths.push(...childPaths);
  }

  return paths;
}
