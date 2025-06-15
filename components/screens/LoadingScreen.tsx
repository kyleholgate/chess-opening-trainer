import { z } from "zod";
import { WINDOW_TITLES, ERROR_MESSAGES } from "../../constants/ui";

// Zod schema for runtime prop validation
const LoadingScreenPropsSchema = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
});

interface LoadingScreenProps {
  /** Title displayed in the window title bar */
  title?: string;
  /** Message displayed below the progress bar */
  message?: string;
  /** Progress percentage (0-100) for the loading bar */
  progressPercent?: number;
}

/**
 * LoadingScreen Component
 *
 * A Windows 95-styled loading screen with animated progress bar.
 * Following P4: Design Deep Modules - simple interface, encapsulates loading UI complexity.
 * Following P14: Design for Readability - clear, obvious purpose and behavior.
 * Following P10: Pull Complexity Downwards - handles all loading UI state internally.
 *
 * @param props - LoadingScreen configuration
 * @returns JSX element displaying a Windows 95-styled loading screen
 *
 * @example
 * ```tsx
 * <LoadingScreen
 *   title="Custom Loading..."
 *   message="Processing data..."
 *   progressPercent={75}
 * />
 * ```
 */
export default function LoadingScreen({
  title = WINDOW_TITLES.LOADING,
  message = ERROR_MESSAGES.LOADING_MESSAGE,
  progressPercent = 60,
}: LoadingScreenProps) {
  // Runtime validation for development safety
  if (process.env.NODE_ENV === "development") {
    const result = LoadingScreenPropsSchema.safeParse({
      title,
      message,
      progressPercent,
    });
    if (!result.success) {
      console.warn("LoadingScreen prop validation failed:", result.error);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="win95-window p-8">
        {/* Window title bar with loading indicator */}
        <div className="win95-titlebar mb-4">
          <span>{title}</span>
        </div>

        {/* Content panel with progress bar and message */}
        <div className="win95-panel p-6 text-center">
          {/* Animated progress bar */}
          <div className="h-4 w-64 mx-auto mb-4 win95-panel bg-[#808080]">
            <div
              className="h-full animate-pulse bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Loading message */}
          <p className="text-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
