import Win95Button from "../ui/Win95Button";

interface GameControlsProps {
  onReset: () => void;
  onShowCorrectMove: () => void;
  isComplete: boolean;
  canShowCorrectMove: boolean;
}

export default function GameControls({
  onReset,
  onShowCorrectMove,
  isComplete,
  canShowCorrectMove,
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Win95Button onClick={onReset}>New Game</Win95Button>
      {canShowCorrectMove && (
        <Win95Button onClick={onShowCorrectMove}>Show Correct Move</Win95Button>
      )}
      {isComplete && <Win95Button onClick={onReset}>Play Again</Win95Button>}
    </div>
  );
}
