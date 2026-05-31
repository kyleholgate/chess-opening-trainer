import { OpeningDefinition } from "../../types/opening";
import Win95Panel from "../ui/Win95Panel";
import Win95Radio from "../ui/Win95Radio";

interface OpeningSelectorProps {
  openings: OpeningDefinition[];
  selectedOpeningId: string;
  onOpeningChange: (openingId: string) => void;
}

export default function OpeningSelector({
  openings,
  selectedOpeningId,
  onOpeningChange,
}: OpeningSelectorProps) {
  return (
    <Win95Panel title="Opening" className="mb-4 p-3">
      <div className="space-y-2">
        {openings.map((opening) => (
          <Win95Radio
            key={opening.id}
            name="opening"
            label={opening.name}
            checked={opening.id === selectedOpeningId}
            onChange={() => onOpeningChange(opening.id)}
            className="font-bold"
          />
        ))}
      </div>
    </Win95Panel>
  );
}
