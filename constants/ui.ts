// UI Constants - Single source of truth for all hardcoded values
// Following P1: Complexity Accumulates Incrementally - eliminate small complexities

export const TIMING = {
  LOADING_MINIMUM_DISPLAY: 1000,
  WINDOW_CLOSE_ANIMATION: 250,
  TASKBAR_ANIMATION: 150,
} as const;

export const Z_INDEX = {
  BACKGROUND: 1,
  WINDOW: 10,
  TASKBAR: 50,
} as const;

export const DIMENSIONS = {
  BACKGROUND_SMALL: { width: 90, height: 90 },
  BACKGROUND_LARGE: { width: 160, height: 160 },
  TASKBAR_ICON: { width: 4, height: 4 },
  TASKBAR_ICON_IMAGE: { width: 12, height: 12 },
} as const;

// Colors are defined in globals.css as CSS custom properties
// Use bg-background, bg-[#808080], border-[#404040] etc. in Tailwind classes

export const WINDOW_TITLES = {
  LOADING: "Scotch Gambit Trainer - Loading...",
  ERROR: "Scotch Gambit Trainer - Error",
  MAIN: "Scotch Gambit Trainer v1.0",
} as const;

export const ERROR_MESSAGES = {
  LOAD_FAILED: "Failed to load opening data",
  SYSTEM_ERROR: "System Error",
  LOADING_MESSAGE: "Loading chess trainer components...",
} as const;
