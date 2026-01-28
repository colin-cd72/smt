import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import MatchSelector from './components/MatchSelector';
import GolferSelector from './components/GolferSelector';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import { GolferStats, UploadResponse, MatchResponse } from './types';

function App() {
  const [stats, setStats] = useState<GolferStats[]>([]);
  const [selectedGolfer, setSelectedGolfer] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchInfo, setMatchInfo] = useState<{ matchNumber: string; description: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataLoaded = (data: UploadResponse) => {
    setStats(data.stats);
    setSelectedMatch(data.matchNumber);
    setMatchInfo({ matchNumber: data.matchNumber, description: '' });
    if (data.stats.length > 0) {
      setSelectedGolfer(data.stats[0].golfer);
    }
  };

  const handleMatchSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectMatch = async (matchNumber: string) => {
    if (!matchNumber) {
      setSelectedMatch(null);
      setStats([]);
      setSelectedGolfer(null);
      setMatchInfo(null);
      return;
    }

    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(matchNumber)}`);
      if (!response.ok) throw new Error('Failed to load match');

      const data: MatchResponse = await response.json();
      setStats(data.stats);
      setSelectedMatch(matchNumber);
      setMatchInfo({ matchNumber: data.match.matchNumber, description: data.match.description });
      if (data.stats.length > 0) {
        setSelectedGolfer(data.stats[0].golfer);
      } else {
        setSelectedGolfer(null);
      }
    } catch (error) {
      console.error('Failed to load match:', error);
    }
  };

  const selectedStats = stats.find(s => s.golfer === selectedGolfer);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-green-400">SMT Golf Analytics</h1>
          <p className="text-gray-400 mt-1">Upload shot data, track timing metrics, analyze by match</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <FileUpload onDataLoaded={handleDataLoaded} onMatchSaved={handleMatchSaved} />

        <MatchSelector
          onSelectMatch={handleSelectMatch}
          selectedMatch={selectedMatch}
          refreshTrigger={refreshTrigger}
        />

        {stats.length > 0 && matchInfo && (
          <>
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-bold text-green-400">{matchInfo.matchNumber}</h2>
              {matchInfo.description && (
                <p className="text-gray-400">{matchInfo.description}</p>
              )}
            </div>

            <GolferSelector
              golfers={stats.map(s => s.golfer)}
              selected={selectedGolfer}
              onSelect={setSelectedGolfer}
            />

            {selectedStats && (
              <>
                <StatsCards stats={selectedStats} />
                <Charts stats={selectedStats} allStats={stats} />
              </>
            )}
          </>
        )}
      </main>

      <footer className="bg-gray-800 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          TMRW Sports - TGL Golf Analytics
        </div>
      </footer>
    </div>
  );
}

export default App;
