import Win95Panel from "../ui/Win95Panel";
import Win95Checkbox from "../ui/Win95Checkbox";

interface Variation {
  move: string;
  comment: string;
  frequency: number;
}

interface VariationSelectorProps {
  availableVariations: Variation[];
  selectedVariations: string[];
  onVariationToggle: (move: string) => void;
}

export default function VariationSelector({
  availableVariations,
  selectedVariations,
  onVariationToggle,
}: VariationSelectorProps) {
  return (
    <Win95Panel title="Practice Against" className="mb-4 p-3">
      <div className="space-y-2">
        {availableVariations.map((variation) => (
          <Win95Checkbox
            key={variation.move}
            label={variation.move}
            checked={selectedVariations.includes(variation.move)}
            onChange={() => onVariationToggle(variation.move)}
            className="font-bold"
          />
        ))}
      </div>
    </Win95Panel>
  );
}

export type { Variation };
