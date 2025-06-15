interface GameStatusProps {
  feedback: string;
}

export default function GameStatus({ feedback }: GameStatusProps) {
  return (
    <div className="win95-panel p-3 mt-4">
      <div className="text-black text-sm">
        <div className="font-bold mb-1">Status:</div>
        <div>{feedback}</div>
      </div>
    </div>
  );
}
