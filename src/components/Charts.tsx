import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Scatter, Doughnut } from 'react-chartjs-2';
import { GolferStats } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Props {
  stats: GolferStats;
  allStats: GolferStats[];
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#9CA3AF',
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#9CA3AF' },
      grid: { color: '#374151' },
    },
    y: {
      ticks: { color: '#9CA3AF' },
      grid: { color: '#374151' },
    },
  },
};

export default function Charts({ stats, allStats }: Props) {
  // Distance per shot bar chart
  const distanceData = {
    labels: stats.shots.map((_, i) => `Shot ${i + 1}`),
    datasets: [
      {
        label: 'Carry Distance',
        data: stats.shots.map(s => s.carryDistance),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
      {
        label: 'Total Distance',
        data: stats.shots.map(s => s.totalDistance),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  // Ball speed vs distance scatter
  const scatterData = {
    datasets: [
      {
        label: stats.golfer,
        data: stats.shots
          .filter(s => s.ballSpeed && s.totalDistance)
          .map(s => ({ x: s.ballSpeed!, y: s.totalDistance! })),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        pointRadius: 8,
      },
    ],
  };

  // Comparison chart - all golfers avg distance
  const comparisonData = {
    labels: allStats.map(s => s.golfer),
    datasets: [
      {
        label: 'Avg Total Distance',
        data: allStats.map(s => s.avgTotalDistance),
        backgroundColor: allStats.map(s =>
          s.golfer === stats.golfer
            ? 'rgba(34, 197, 94, 0.8)'
            : 'rgba(107, 114, 128, 0.6)'
        ),
      },
    ],
  };

  // Launch angle distribution (doughnut)
  const launchBuckets = { low: 0, mid: 0, high: 0 };
  stats.shots.forEach(shot => {
    if (shot.launchAngle !== null) {
      if (shot.launchAngle < 10) launchBuckets.low++;
      else if (shot.launchAngle < 15) launchBuckets.mid++;
      else launchBuckets.high++;
    }
  });

  const launchData = {
    labels: ['Low (<10°)', 'Mid (10-15°)', 'High (>15°)'],
    datasets: [
      {
        data: [launchBuckets.low, launchBuckets.mid, launchBuckets.high],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distance per shot */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Distance by Shot</h3>
          <div className="h-64">
            <Bar data={distanceData} options={chartOptions} />
          </div>
        </div>

        {/* Ball Speed vs Distance */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Ball Speed vs Total Distance</h3>
          <div className="h-64">
            <Scatter
              data={scatterData}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  x: { ...chartOptions.scales.x, title: { display: true, text: 'Ball Speed (mph)', color: '#9CA3AF' } },
                  y: { ...chartOptions.scales.y, title: { display: true, text: 'Total Distance (yds)', color: '#9CA3AF' } },
                },
              }}
            />
          </div>
        </div>

        {/* Golfer comparison */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Golfer Comparison - Avg Distance</h3>
          <div className="h-64">
            <Bar
              data={comparisonData}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Launch angle distribution */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Launch Angle Distribution</h3>
          <div className="h-64 flex justify-center">
            <Doughnut
              data={launchData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#9CA3AF' },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Shot details table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Shot Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 pr-4">Hole</th>
                <th className="pb-3 pr-4">Stroke</th>
                <th className="pb-3 pr-4">Ball Speed</th>
                <th className="pb-3 pr-4">Launch</th>
                <th className="pb-3 pr-4">Apex</th>
                <th className="pb-3 pr-4">Curve</th>
                <th className="pb-3 pr-4">Carry</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.shots.map((shot, i) => (
                <tr key={i} className="border-b border-gray-700/50">
                  <td className="py-2 pr-4">{shot.holeNumber}</td>
                  <td className="py-2 pr-4">{shot.strokeNumber}</td>
                  <td className="py-2 pr-4">{shot.ballSpeed?.toFixed(1) ?? '-'} mph</td>
                  <td className="py-2 pr-4">{shot.launchAngle?.toFixed(1) ?? '-'}°</td>
                  <td className="py-2 pr-4">{shot.apex?.toFixed(1) ?? '-'} ft</td>
                  <td className="py-2 pr-4">{shot.curve?.toFixed(1) ?? '-'}</td>
                  <td className="py-2 pr-4">{shot.carryDistance?.toFixed(1) ?? '-'} yds</td>
                  <td className="py-2 font-semibold text-green-400">{shot.totalDistance?.toFixed(1) ?? '-'} yds</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
