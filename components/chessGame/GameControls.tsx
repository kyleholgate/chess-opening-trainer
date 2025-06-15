import Win95Button from "../ui/Win95Button";

interface GameControlsProps {
  onReset: () => void;
  isComplete: boolean;
}

export default function GameControls({
  onReset,
  isComplete,
}: GameControlsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <Win95Button onClick={onReset}>New Game</Win95Button>
      {isComplete && <Win95Button onClick={onReset}>Play Again</Win95Button>}
    </div>
  );
}
