import { ReactNode } from "react";

/**
 * Base props shared across all Windows 95 styled components
 * Following P4: Design Deep Modules - consistent interface across similar components
 */
export interface Win95BaseProps {
  /** Optional CSS class names for styling customization */
  className?: string;
  /** Child elements to render within the component */
  children?: ReactNode;
  /** Optional title for components that support titles */
  title?: string;
}

/**
 * Window control button types
 * Following P14: Design for Readability - clear enumeration of possible actions
 */
export type WindowAction = "minimize" | "maximize" | "close" | "about";

/**
 * Props for components that handle window operations
 * Following P5: Simplify Interfaces for Common Cases - common window operations grouped
 */
export interface WindowControlProps {
  /** Window title displayed in title bar */
  title: string;
  /** Callback for about/help action */
  onAbout?: () => void;
  /** Callback for minimize action */
  onMinimize?: () => void;
  /** Callback for maximize action */
  onMaximize?: () => void;
  /** Callback for close action */
  onClose?: () => void;
}

/**
 * Props for screen-level components (Loading, Error, etc.)
 * Following P6: Prioritize Simple Interfaces over Simple Implementations
 */
export interface ScreenComponentProps {
  /** Primary title for the screen */
  title?: string;
  /** Main message or content */
  message?: string;
  /** Optional retry callback for error screens */
  onRetry?: () => void;
}

/**
 * Animation state for components with motion
 * Following P11: Define Errors/Special Cases Out Of Existence - explicit states
 */
export type AnimationState = "entering" | "visible" | "exiting" | "hidden";

/**
 * Props for components with animation control
 */
export interface AnimatedComponentProps extends Win95BaseProps {
  /** Whether the component is currently visible */
  isVisible: boolean;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation state for fine-grained control */
  animationState?: AnimationState;
}

/**
 * Theme variants for Windows 95 components
 * Following P17: Strive for Consistency - standardized theming approach
 */
export type Win95Variant = "default" | "raised" | "sunken" | "flat";

/**
 * Props for Win95 UI elements with theming support
 */
export interface Win95ThemedProps extends Win95BaseProps {
  /** Visual variant of the component */
  variant?: Win95Variant;
  /** Whether the component appears disabled */
  disabled?: boolean;
  /** Whether the component appears pressed/active */
  pressed?: boolean;
}

/**
 * Common error types that can occur in the application
 * Following P11: Define Errors/Special Cases Out Of Existence
 */
export type ApplicationError =
  | "LOADING_FAILED"
  | "PARSING_FAILED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Error context for better error handling
 */
export interface ErrorContext {
  /** Type of error that occurred */
  type: ApplicationError;
  /** Human-readable error message */
  message: string;
  /** Optional additional context */
  details?: string;
  /** Whether the error is recoverable */
  recoverable: boolean;
}
