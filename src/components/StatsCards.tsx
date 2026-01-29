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

  // Time from first timestamp to each data point
  const timeCards = [
    { label: 'To Ball Speed', value: formatNumber(stats.avgTimeToBallSpeed, 2), color: 'text-red-400' },
    { label: 'To Launch Angle', value: formatNumber(stats.avgTimeToLaunchAngle, 2), color: 'text-orange-400' },
    { label: 'To Apex', value: formatNumber(stats.avgTimeToApex, 2), color: 'text-yellow-400' },
    { label: 'To Curve', value: formatNumber(stats.avgTimeToCurve, 2), color: 'text-green-400' },
    { label: 'To Carry', value: formatNumber(stats.avgTimeToCarry, 2), color: 'text-blue-400' },
    { label: 'To Total', value: formatNumber(stats.avgTimeToTotal, 2), color: 'text-purple-400' },
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
        <h2 className="text-lg font-semibold mb-3 text-yellow-400">Time From First Timestamp (seconds)</h2>
        <p className="text-sm text-gray-500 mb-3">How fast each data point arrives after the shot is first detected</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {timeCards.map(card => (
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
    </div>
  );
}
