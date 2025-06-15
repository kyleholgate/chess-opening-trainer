import Win95Panel from "../ui/Win95Panel";

interface MoveHistoryProps {
  moveHistory: string[];
}

export default function MoveHistory({ moveHistory }: MoveHistoryProps) {
  return (
    <Win95Panel title="Move History" className="p-3">
      <div className="win95-input p-2 h-24 overflow-y-auto">
        <div className="text-xs text-black leading-tight">
          {moveHistory.map((move, index) => {
            const moveNumber = Math.floor(index / 2) + 1;
            const isWhiteMove = index % 2 === 0;
            return (
              <span key={index}>
                {isWhiteMove && `${moveNumber}. `}
                {move}
                {!isWhiteMove && " "}
              </span>
            );
          })}
        </div>
      </div>
    </Win95Panel>
  );
}
