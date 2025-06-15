import Win95Panel from "../ui/Win95Panel";
import Win95Radio from "../ui/Win95Radio";
import { BoardTheme } from "./BoardDisplay";

const RETRO_BOARD_THEMES: BoardTheme[] = [
  {
    name: "Classic Beige",
    darkSquares: "#808080",
    lightSquares: "#C3C3C3",
  },
  {
    name: "Teal Gray",
    darkSquares: "#008080",
    lightSquares: "#DFDFDF",
  },
  {
    name: "Monochrome",
    darkSquares: "#404040",
    lightSquares: "#FFFFFF",
  },
];

interface ThemeSelectorProps {
  selectedTheme: BoardTheme;
  onThemeChange: (theme: BoardTheme) => void;
}

export default function ThemeSelector({
  selectedTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  return (
    <Win95Panel title="Board Theme" className="mb-4 p-3">
      <div className="space-y-2">
        {RETRO_BOARD_THEMES.map((theme) => (
          <Win95Radio
            key={theme.name}
            name="theme"
            label={theme.name}
            checked={selectedTheme.name === theme.name}
            onChange={() => onThemeChange(theme)}
          />
        ))}
      </div>
    </Win95Panel>
  );
}

export { RETRO_BOARD_THEMES };
