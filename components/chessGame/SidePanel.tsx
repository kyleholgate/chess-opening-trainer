import ThemeSelector from "./ThemeSelector";
import VariationSelector from "./VariationSelector";
import MoveHistory from "./MoveHistory";
import { BoardTheme } from "./BoardDisplay";
import { Variation } from "./VariationSelector";

interface SidePanelProps {
  selectedTheme: BoardTheme;
  onThemeChange: (theme: BoardTheme) => void;
  availableVariations: Variation[];
  selectedVariations: string[];
  onVariationToggle: (move: string) => void;
  moveHistory: string[];
}

export default function SidePanel({
  selectedTheme,
  onThemeChange,
  availableVariations,
  selectedVariations,
  onVariationToggle,
  moveHistory,
}: SidePanelProps) {
  return (
    <div className="w-full lg:flex-1 lg:min-w-32 lg:max-w-80">
      <ThemeSelector
        selectedTheme={selectedTheme}
        onThemeChange={onThemeChange}
      />

      <VariationSelector
        availableVariations={availableVariations}
        selectedVariations={selectedVariations}
        onVariationToggle={onVariationToggle}
      />

      <MoveHistory moveHistory={moveHistory} />
    </div>
  );
}
