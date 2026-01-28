interface Props {
  golfers: string[];
  selected: string | null;
  onSelect: (golfer: string) => void;
}

export default function GolferSelector({ golfers, selected, onSelect }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3 text-gray-300">Select Golfer</h2>
      <div className="flex flex-wrap gap-2">
        {golfers.map(golfer => (
          <button
            key={golfer}
            onClick={() => onSelect(golfer)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${selected === golfer
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {golfer}
          </button>
        ))}
      </div>
    </div>
  );
}
