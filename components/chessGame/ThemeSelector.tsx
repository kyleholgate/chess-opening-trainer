import Win95Panel from "../ui/Win95Panel";
import Win95Radio from "../ui/Win95Radio";
import { BoardTheme } from "./BoardDisplay";

const RETRO_BOARD_THEMES: BoardTheme[] = [
  {
    name: "Classic Beige",
    darkSquares: "#B6B09F",
    lightSquares: "#F2F2F2",
  },
  {
    name: "Moonrise Kingdom",
    darkSquares: "#c5512c",
    lightSquares: "#e29b75",
  },
  {
    name: "Grand Budapest",
    darkSquares: "#784283",
    lightSquares: "#ffa8cb",
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
