import { OpeningNode } from "../types/opening";

/**
 * Selects a random move from the available children based on frequency weights
 * @param children - The available child moves
 * @returns The selected move key, or null if no moves available
 */
export function selectWeightedMove(
  children: Record<string, OpeningNode>
): string | null {
  const moves = Object.keys(children);

  if (moves.length === 0) {
    return null;
  }

  // If only one move, select it
  if (moves.length === 1) {
    return moves[0];
  }

  // Calculate total weight
  let totalWeight = 0;
  const weights: { move: string; weight: number; cumulative: number }[] = [];

  for (const move of moves) {
    const frequency = children[move].frequency || 0.5; // Default to 0.5 if no frequency
    totalWeight += frequency;
    weights.push({
      move,
      weight: frequency,
      cumulative: totalWeight,
    });
  }

  // Generate random number between 0 and totalWeight
  const random = Math.random() * totalWeight;

  // Find the selected move
  for (const { move, cumulative } of weights) {
    if (random <= cumulative) {
      return move;
    }
  }

  // Fallback to the last move (shouldn't happen)
  return moves[moves.length - 1];
}

/**
 * Gets the probability of each move being selected
 * @param children - The available child moves
 * @returns Object with move probabilities
 */
export function getMovesProbabilities(
  children: Record<string, OpeningNode>
): Record<string, number> {
  const moves = Object.keys(children);
  const probabilities: Record<string, number> = {};

  if (moves.length === 0) {
    return probabilities;
  }

  // Calculate total weight
  let totalWeight = 0;
  for (const move of moves) {
    const frequency = children[move].frequency || 0.5;
    totalWeight += frequency;
  }

  // Calculate probabilities
  for (const move of moves) {
    const frequency = children[move].frequency || 0.5;
    probabilities[move] = frequency / totalWeight;
  }

  return probabilities;
}
