import { useState } from 'react';
import FileUpload from './components/FileUpload';
import MatchSelector from './components/MatchSelector';
import AllGolfersView from './components/AllGolfersView';
import MatchCompareSelector from './components/MatchCompareSelector';
import MatchCompareView from './components/MatchCompareView';
import { GolferStats, UploadResponse, MatchResponse, CompareResponse } from './types';

function App() {
  const [stats, setStats] = useState<GolferStats[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchInfo, setMatchInfo] = useState<{ matchNumber: string; description: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareMatchA, setCompareMatchA] = useState<string | null>(null);
  const [compareMatchB, setCompareMatchB] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

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

  const handleCompare = async () => {
    if (!compareMatchA || !compareMatchB) return;
    setCompareLoading(true);
    try {
      const response = await fetch(
        `/api/compare?matchA=${encodeURIComponent(compareMatchA)}&matchB=${encodeURIComponent(compareMatchB)}`
      );
      if (!response.ok) throw new Error('Failed to compare');
      const data: CompareResponse = await response.json();
      setCompareData(data);
    } catch (error) {
      console.error('Failed to load comparison:', error);
    } finally {
      setCompareLoading(false);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setCompareData(null);
    setCompareMatchA(null);
    setCompareMatchB(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-400">SMT Golf Analytics</h1>
            <p className="text-gray-400 mt-1">Upload shot data, track timing metrics, analyze by match</p>
          </div>
          <button
            onClick={toggleCompareMode}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors
              ${compareMode
                ? 'bg-green-600 text-white hover:bg-green-500'
                : 'bg-yellow-600 text-white hover:bg-yellow-500'}`}
          >
            {compareMode ? 'Single Match View' : 'Compare Matches'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {!compareMode ? (
          <>
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
          </>
        ) : (
          <>
            <MatchCompareSelector
              matchA={compareMatchA}
              matchB={compareMatchB}
              onSelectA={setCompareMatchA}
              onSelectB={setCompareMatchB}
              onCompare={handleCompare}
              loading={compareLoading}
              refreshTrigger={refreshTrigger}
            />
            {compareData && <MatchCompareView data={compareData} />}
          </>
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
