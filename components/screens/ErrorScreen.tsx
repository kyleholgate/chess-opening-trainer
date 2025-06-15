import { z } from "zod";
import Win95Button from "../ui/Win95Button";
import { WINDOW_TITLES, ERROR_MESSAGES } from "../../constants/ui";

// Zod schema for runtime prop validation
const ErrorScreenPropsSchema = z.object({
  error: z.string().min(1, "Error message cannot be empty"),
  title: z.string().optional(),
  onRetry: z.function().optional(),
});

interface ErrorScreenProps {
  /** Error message to display to the user */
  error: string;
  /** Title displayed in the window title bar */
  title?: string;
  /** Optional callback function for retry functionality */
  onRetry?: () => void;
}

/**
 * ErrorScreen Component
 *
 * A Windows 95-styled error dialog with system error appearance.
 * Following P4: Design Deep Modules - simple interface, encapsulates error display complexity.
 * Following P5: Simplify Interfaces for Common Cases - error display with optional retry.
 * Following P11: Define Errors Out Of Existence - provides clear error communication.
 *
 * @param props - ErrorScreen configuration
 * @returns JSX element displaying a Windows 95-styled error dialog
 *
 * @example
 * ```tsx
 * <ErrorScreen
 *   error="Network connection failed"
 *   onRetry={() => retryConnection()}
 * />
 * ```
 */
export default function ErrorScreen({
  error,
  title = WINDOW_TITLES.ERROR,
  onRetry,
}: ErrorScreenProps) {
  // Runtime validation for development safety
  if (process.env.NODE_ENV === "development") {
    const result = ErrorScreenPropsSchema.safeParse({ error, title, onRetry });
    if (!result.success) {
      console.warn("ErrorScreen prop validation failed:", result.error);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="win95-window p-8">
        {/* Window title bar with error indicator */}
        <div className="win95-titlebar mb-4">
          <span>{title}</span>
        </div>

        {/* Error content panel */}
        <div className="win95-panel p-6 text-center">
          {/* Warning icon */}
          <div className="text-4xl mb-4" role="img" aria-label="Warning">
            ⚠️
          </div>

          {/* System error heading */}
          <h1 className="text-xl text-foreground font-bold mb-4">
            {ERROR_MESSAGES.SYSTEM_ERROR}
          </h1>

          {/* Error message */}
          <p className="text-foreground mb-4" role="alert">
            {error}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 justify-center">
            <Win95Button type="button">OK</Win95Button>
            {onRetry && (
              <Win95Button type="button" onClick={onRetry}>
                Retry
              </Win95Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
