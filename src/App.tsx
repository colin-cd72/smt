import { useState } from 'react';
import FileUpload from './components/FileUpload';
import GolferSelector from './components/GolferSelector';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import { GolferStats } from './types';

function App() {
  const [stats, setStats] = useState<GolferStats[]>([]);
  const [selectedGolfer, setSelectedGolfer] = useState<string | null>(null);

  const handleDataLoaded = (data: { stats: GolferStats[] }) => {
    setStats(data.stats);
    if (data.stats.length > 0) {
      setSelectedGolfer(data.stats[0].golfer);
    }
  };

  const selectedStats = stats.find(s => s.golfer === selectedGolfer);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-green-400">SMT Golf Analytics</h1>
          <p className="text-gray-400 mt-1">Upload shot data and analyze golfer performance</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <FileUpload onDataLoaded={handleDataLoaded} />

        {stats.length > 0 && (
          <>
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
