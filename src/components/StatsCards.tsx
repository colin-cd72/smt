import { GolferStats } from '../types';

interface Props {
  stats: GolferStats;
}

function formatNumber(value: number | null, decimals: number = 1): string {
  if (value === null) return '-';
  return value.toFixed(decimals);
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    { label: 'Total Shots', value: stats.shots.length.toString(), unit: '' },
    { label: 'Avg Ball Speed', value: formatNumber(stats.avgBallSpeed), unit: 'mph' },
    { label: 'Avg Launch Angle', value: formatNumber(stats.avgLaunchAngle), unit: '°' },
    { label: 'Avg Apex', value: formatNumber(stats.avgApex), unit: 'ft' },
    { label: 'Avg Carry', value: formatNumber(stats.avgCarryDistance), unit: 'yds' },
    { label: 'Avg Total Distance', value: formatNumber(stats.avgTotalDistance), unit: 'yds' },
    { label: 'Max Distance', value: formatNumber(stats.maxTotalDistance), unit: 'yds' },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3 text-gray-300">{stats.golfer} - Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {cards.map(card => (
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
  );
}
