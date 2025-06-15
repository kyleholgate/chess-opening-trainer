import { useState, useEffect } from "react";
import { OpeningNode } from "../types/opening";
import { openingService } from "../services/openingService";
import { TIMING } from "../constants/ui";

// Application state interface - clear contract for consumers
export interface ApplicationState {
  openingTree: OpeningNode | null;
  isLoading: boolean;
  error: string | null;
  isMinimized: boolean;
  isClosed: boolean;
  showContactModal: boolean;
  isRelaunching: boolean;
}

// Actions interface - explicit operations available
export interface ApplicationActions {
  setIsMinimized: (minimized: boolean) => void;
  setIsClosed: (closed: boolean) => void;
  setShowContactModal: (show: boolean) => void;
  relaunchApplication: () => Promise<void>;
}

/**
 * Custom hook managing application-wide state
 *
 * A deep module that encapsulates all application state management behind a clean interface.
 * Following P4: Design Deep Modules - hides complex state management behind simple interface.
 * Following P10: Pull Complexity Downwards - absorbs loading logic complexity.
 * Following P8: Separate General and Special-Purpose Logic - general state management.
 *
 * Handles:
 * - Opening tree data loading and parsing
 * - Application window states (minimized, closed, loading)
 * - Modal state management
 * - Loading timing and animation coordination
 *
 * @returns Combined state and actions interface for application control
 *
 * @example
 * ```tsx
 * const { openingTree, isLoading, error, relaunchApplication } = useApplicationState();
 *
 * if (isLoading) return <LoadingScreen />;
 * if (error) return <ErrorScreen error={error} />;
 * ```
 */
export function useApplicationState(): ApplicationState & ApplicationActions {
  const [openingTree, setOpeningTree] = useState<OpeningNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isRelaunching, setIsRelaunching] = useState(false);

  // Load and parse opening tree on mount
  // Following P10: Pull Complexity Downwards - handle loading complexity internally
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use service layer for data loading with built-in timing
        const parsedTree = await openingService.loadOpeningTree();
        setOpeningTree(parsedTree);
        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setIsLoading(false);
        console.error("Error loading opening tree:", err);
      }
    };

    loadData();
  }, []);

  // Relaunch application with proper loading state management
  const relaunchApplication = async () => {
    setIsRelaunching(true);
    await new Promise((resolve) =>
      setTimeout(resolve, TIMING.LOADING_MINIMUM_DISPLAY)
    );
    setIsClosed(false);
    setIsMinimized(false);
    setIsRelaunching(false);
  };

  return {
    // State
    openingTree,
    isLoading,
    error,
    isMinimized,
    isClosed,
    showContactModal,
    isRelaunching,
    // Actions
    setIsMinimized,
    setIsClosed,
    setShowContactModal,
    relaunchApplication,
  };
}
