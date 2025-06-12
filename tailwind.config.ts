import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Updated to reflect fonts in globals.css
        sans: [
          "var(--font-geist-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        // Accent colors are omitted here as they are commented out in globals.css
        // accent: {
        //   50: "var(--color-accent-50)",
        //   100: "var(--color-accent-100)",
        //   200: "var(--color-accent-200)",
        //   300: "var(--color-accent-300)",
        //   400: "var(--color-accent-400)",
        //   500: "var(--color-accent-500)",
        //   600: "var(--color-accent-600)",
        //   700: "var(--color-accent-700)",
        //   800: "var(--color-accent-800)",
        //   900: "var(--color-accent-900)",
        // },
        muted: {
          50: "var(--color-muted-50)",
          100: "var(--color-muted-100)",
          200: "var(--color-muted-200)",
          300: "var(--color-muted-300)",
          400: "var(--color-muted-400)",
          500: "var(--color-muted-500)",
          600: "var(--color-muted-600)",
          700: "var(--color-muted-700)",
          800: "var(--color-muted-800)",
          900: "var(--color-muted-900)",
        },
        destructive: {
          // Tailwind expects a palette or a single value. If you want a palette, define it similarly to primary.
          DEFAULT: "var(--color-destructive)", // Makes 'bg-destructive' work
          foreground: "var(--color-destructive-foreground)",
          // You can also add shades if needed, e.g., 500: "var(--color-destructive-500)"
          // For now, aligning with how it's defined in globals.css (single --color-destructive and --color-destructive-foreground)
          // We'll use DEFAULT for the base color from --color-destructive and add the shades.
          50: "var(--color-destructive-50)",
          100: "var(--color-destructive-100)",
          200: "var(--color-destructive-200)",
          300: "var(--color-destructive-300)",
          400: "var(--color-destructive-400)",
          500: "var(--color-destructive-500)",
          600: "var(--color-destructive-600)",
          700: "var(--color-destructive-700)",
          800: "var(--color-destructive-800)",
          900: "var(--color-destructive-900)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
