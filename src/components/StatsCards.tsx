import { GolferStats } from '../types';

interface Props {
  stats: GolferStats;
}

function formatNumber(value: number | null, decimals: number = 1): string {
  if (value === null) return '-';
  return value.toFixed(decimals);
}

export default function StatsCards({ stats }: Props) {
  const shotCards = [
    { label: 'Total Shots', value: stats.shots.length.toString(), unit: '' },
    { label: 'Avg Ball Speed', value: formatNumber(stats.avgBallSpeed), unit: 'mph' },
    { label: 'Avg Total Distance', value: formatNumber(stats.avgTotalDistance), unit: 'yds' },
    { label: 'Max Distance', value: formatNumber(stats.maxTotalDistance), unit: 'yds' },
  ];

  // Sequential deltas - time between each step
  const deltaCards = [
    { label: 'Speed → Launch', value: formatNumber(stats.avgDeltaSpeedToLaunch, 2), color: 'text-orange-400' },
    { label: 'Launch → Apex', value: formatNumber(stats.avgDeltaLaunchToApex, 2), color: 'text-yellow-400' },
    { label: 'Apex → Curve', value: formatNumber(stats.avgDeltaApexToCurve, 2), color: 'text-green-400' },
    { label: 'Curve → Carry', value: formatNumber(stats.avgDeltaCurveToCarry, 2), color: 'text-blue-400' },
    { label: 'Carry → Total', value: formatNumber(stats.avgDeltaCarryToTotal, 2), color: 'text-purple-400' },
  ];

  return (
    <div className="mb-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-300">{stats.golfer} - Shot Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shotCards.map(card => (
            <div key={card.label} className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">{card.label}</div>
              <div className="text-2xl font-bold text-green-400">
                {card.value}
                {card.unit && <span className="text-sm text-gray-500 ml-1">{card.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-yellow-400">Avg Time Between Data Points (seconds)</h2>
        <p className="text-sm text-gray-500 mb-3">Time gap between each successive data measurement</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {deltaCards.map(card => (
            <div key={card.label} className="bg-gray-800 rounded-lg p-4 border border-yellow-900/50">
              <div className="text-gray-400 text-sm mb-1">{card.label}</div>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
                <span className="text-sm text-gray-500 ml-1">s</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400">Total Time (First Data → All Complete):</span>
            <span className="text-2xl font-bold text-white ml-3">
              {formatNumber(stats.avgTimeToTotal, 2)}s
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Average across {stats.shots.length} shots
          </div>
        </div>
      </div>
    </div>
  );
}
