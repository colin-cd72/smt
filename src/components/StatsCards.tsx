import { GolferStats } from '../types';

interface Props {
  stats: GolferStats;
}

function formatNumber(value: number | null, decimals: number = 1): string {
  if (value === null) return '-';
  return value.toFixed(decimals);
}

export default function StatsCards({ stats }: Props) {
  const distanceCards = [
    { label: 'Total Shots', value: stats.shots.length.toString(), unit: '' },
    { label: 'Avg Ball Speed', value: formatNumber(stats.avgBallSpeed), unit: 'mph' },
    { label: 'Avg Launch Angle', value: formatNumber(stats.avgLaunchAngle), unit: '°' },
    { label: 'Avg Carry', value: formatNumber(stats.avgCarryDistance), unit: 'yds' },
    { label: 'Avg Total Distance', value: formatNumber(stats.avgTotalDistance), unit: 'yds' },
    { label: 'Max Distance', value: formatNumber(stats.maxTotalDistance), unit: 'yds' },
  ];

  const timingCards = [
    { label: 'Avg to Ball Speed', value: formatNumber(stats.avgTimeToBallSpeed, 2), unit: 's' },
    { label: 'Avg to Launch', value: formatNumber(stats.avgTimeToLaunchAngle, 2), unit: 's' },
    { label: 'Avg to Apex', value: formatNumber(stats.avgTimeToApex, 2), unit: 's' },
    { label: 'Avg to Curve', value: formatNumber(stats.avgTimeToCurve, 2), unit: 's' },
    { label: 'Avg to Carry', value: formatNumber(stats.avgTimeToCarry, 2), unit: 's' },
    { label: 'Avg to Total', value: formatNumber(stats.avgTimeToTotal, 2), unit: 's' },
  ];

  return (
    <div className="mb-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-300">{stats.golfer} - Shot Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {distanceCards.map(card => (
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
        <h2 className="text-lg font-semibold mb-3 text-yellow-400">Time to Data (from first reading)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {timingCards.map(card => (
            <div key={card.label} className="bg-gray-800 rounded-lg p-4 border border-yellow-900/50">
              <div className="text-gray-400 text-sm mb-1">{card.label}</div>
              <div className="text-2xl font-bold text-yellow-400">
                {card.value}
                {card.unit && <span className="text-sm text-gray-500 ml-1">{card.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
