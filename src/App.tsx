import { useState } from 'react';
import FileUpload from './components/FileUpload';
import MatchSelector from './components/MatchSelector';
import AllGolfersView from './components/AllGolfersView';
import { GolferStats, UploadResponse, MatchResponse } from './types';

function App() {
  const [stats, setStats] = useState<GolferStats[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchInfo, setMatchInfo] = useState<{ matchNumber: string; description: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataLoaded = (data: UploadResponse) => {
    setStats(data.stats);
    setSelectedMatch(data.matchNumber);
    setMatchInfo({ matchNumber: data.matchNumber, description: '' });
  };

  const handleMatchSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectMatch = async (matchNumber: string) => {
    if (!matchNumber) {
      setSelectedMatch(null);
      setStats([]);
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
    } catch (error) {
      console.error('Failed to load match:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-green-400">SMT Golf Analytics</h1>
          <p className="text-gray-400 mt-1">Upload shot data, track timing metrics, analyze by match</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="print:hidden">
          <FileUpload onDataLoaded={handleDataLoaded} onMatchSaved={handleMatchSaved} />

          <MatchSelector
            onSelectMatch={handleSelectMatch}
            selectedMatch={selectedMatch}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {stats.length > 0 && matchInfo && (
          <AllGolfersView stats={stats} matchInfo={matchInfo} />
        )}
      </main>

      <footer className="bg-gray-800 mt-auto py-4 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          TMRW Sports - TGL Golf Analytics
        </div>
      </footer>
    </div>
  );
}

export default App;
