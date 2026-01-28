import { useEffect, useState } from 'react';
import { Match } from '../types';

interface Props {
  onSelectMatch: (matchNumber: string) => void;
  selectedMatch: string | null;
  refreshTrigger: number;
}

export default function MatchSelector({ onSelectMatch, selectedMatch, refreshTrigger }: Props) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [refreshTrigger]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (matchNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete match "${matchNumber}" and all its data?`)) return;

    try {
      await fetch(`/api/matches/${encodeURIComponent(matchNumber)}`, {
        method: 'DELETE',
      });
      fetchMatches();
      if (selectedMatch === matchNumber) {
        onSelectMatch('');
      }
    } catch (error) {
      console.error('Failed to delete match:', error);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Saved Matches</h2>
        <div className="text-gray-500">Loading matches...</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Saved Matches</h2>
        <div className="text-gray-500 bg-gray-800 rounded-lg p-4">
          No matches saved yet. Upload a CSV file to create your first match.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Saved Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map(match => (
          <div
            key={match.id}
            onClick={() => onSelectMatch(match.match_number)}
            className={`relative bg-gray-800 rounded-lg p-4 cursor-pointer transition-all
              ${selectedMatch === match.match_number
                ? 'ring-2 ring-green-500 bg-gray-700'
                : 'hover:bg-gray-750 hover:ring-1 hover:ring-gray-600'}`}
          >
            <button
              onClick={(e) => handleDelete(match.match_number, e)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-400 p-1"
              title="Delete match"
            >
              ✕
            </button>
            <h3 className="font-semibold text-lg text-white mb-1">{match.match_number}</h3>
            {match.description && (
              <p className="text-gray-400 text-sm mb-2">{match.description}</p>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>{match.shot_count} shots</span>
              <span>{new Date(match.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
