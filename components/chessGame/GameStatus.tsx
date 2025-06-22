interface GameStatusProps {
  feedback: string;
}

export default function GameStatus({ feedback }: GameStatusProps) {
  // Split feedback by double newlines and render each part separately
  const feedbackParts = feedback
    .split("\n\n")
    .filter((part) => part.trim() !== "");

  return (
    <div className="win95-panel p-3 mt-4 min-h-40">
      <div className="text-black text-md">
        <div className="font-bold mb-1">Status:</div>
        <div className="space-y-2">
          {feedbackParts.map((part, index) => (
            <div key={index}>{part}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
