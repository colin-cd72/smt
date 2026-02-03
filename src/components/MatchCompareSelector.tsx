import { useEffect, useState } from 'react';
import { Match } from '../types';

interface Props {
  matchA: string | null;
  matchB: string | null;
  onSelectA: (m: string | null) => void;
  onSelectB: (m: string | null) => void;
  onCompare: () => void;
  loading: boolean;
  refreshTrigger: number;
}

export default function MatchCompareSelector({
  matchA, matchB, onSelectA, onSelectB, onCompare, loading, refreshTrigger
}: Props) {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => setMatches(data.matches || []))
      .catch(() => {});
  }, [refreshTrigger]);

  const handleClick = (matchNumber: string, slot: 'A' | 'B') => {
    if (slot === 'A') {
      if (matchA === matchNumber) {
        onSelectA(null);
      } else {
        if (matchB === matchNumber) onSelectB(null);
        onSelectA(matchNumber);
      }
    } else {
      if (matchB === matchNumber) {
        onSelectB(null);
      } else {
        if (matchA === matchNumber) onSelectA(null);
        onSelectB(matchNumber);
      }
    }
  };

  const canCompare = matchA && matchB && matchA !== matchB && !loading;

  return (
    <div className="mb-8 print:hidden">
      <h2 className="text-xl font-semibold mb-2 text-gray-200">Select Two Matches to Compare</h2>
      <p className="text-sm text-gray-500 mb-4">
        Click "A" and "B" to assign matches, then click Compare
      </p>

      {matches.length < 2 ? (
        <div className="text-gray-500 bg-gray-800 rounded-lg p-4">
          Need at least 2 saved matches to compare.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {matches.map(match => {
              const isA = matchA === match.match_number;
              const isB = matchB === match.match_number;

              return (
                <div
                  key={match.id}
                  className={`relative bg-gray-800 rounded-lg p-4 transition-all
                    ${isA ? 'ring-2 ring-blue-500' : ''}
                    ${isB ? 'ring-2 ring-orange-500' : ''}`}
                >
                  {isA && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">A</span>
                  )}
                  {isB && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">B</span>
                  )}

                  <h3 className="font-semibold text-lg text-white mb-1">{match.match_number}</h3>
                  {match.description && (
                    <p className="text-gray-400 text-sm mb-2">{match.description}</p>
                  )}
                  <div className="text-sm text-gray-500 mb-3">
                    {match.shot_count} shots | {new Date(match.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClick(match.match_number, 'A')}
                      className={`flex-1 py-1 rounded text-sm font-medium transition-colors
                        ${isA
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {isA ? 'Selected as A' : 'Set as A'}
                    </button>
                    <button
                      onClick={() => handleClick(match.match_number, 'B')}
                      className={`flex-1 py-1 rounded text-sm font-medium transition-colors
                        ${isB
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {isB ? 'Selected as B' : 'Set as B'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onCompare}
            disabled={!canCompare}
            className={`w-full py-3 rounded-lg font-semibold transition-colors
              ${canCompare
                ? 'bg-yellow-600 text-white hover:bg-yellow-500'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
          >
            {loading ? 'Loading...' : matchA === matchB && matchA ? 'Select two different matches' : 'Compare Matches'}
          </button>
        </>
      )}
    </div>
  );
}
