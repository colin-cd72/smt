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
import { Bar, Line } from 'react-chartjs-2';
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
  // Time to data chart - shows how long each metric takes to populate
  const timeToDataChart = {
    labels: stats.shots.map((s, i) => `H${s.holeNumber}-S${s.strokeNumber}`),
    datasets: [
      {
        label: 'Ball Speed',
        data: stats.shots.map(s => s.timeToBallSpeed !== null ? s.timeToBallSpeed / 1000 : null),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Launch Angle',
        data: stats.shots.map(s => s.timeToLaunchAngle !== null ? s.timeToLaunchAngle / 1000 : null),
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Apex',
        data: stats.shots.map(s => s.timeToApex !== null ? s.timeToApex / 1000 : null),
        borderColor: 'rgba(234, 179, 8, 1)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Curve',
        data: stats.shots.map(s => s.timeToCurve !== null ? s.timeToCurve / 1000 : null),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Carry',
        data: stats.shots.map(s => s.timeToCarry !== null ? s.timeToCarry / 1000 : null),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Total Distance',
        data: stats.shots.map(s => s.timeToTotal !== null ? s.timeToTotal / 1000 : null),
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Average time to data by metric (bar chart)
  const avgTimeToDataChart = {
    labels: ['Ball Speed', 'Launch Angle', 'Apex', 'Curve', 'Carry', 'Total'],
    datasets: [
      {
        label: 'Avg Time (seconds)',
        data: [
          stats.avgTimeToBallSpeed,
          stats.avgTimeToLaunchAngle,
          stats.avgTimeToApex,
          stats.avgTimeToCurve,
          stats.avgTimeToCarry,
          stats.avgTimeToTotal,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
        ],
      },
    ],
  };

  // Golfer comparison - time to total distance
  const golferTimeComparison = {
    labels: allStats.map(s => s.golfer),
    datasets: [
      {
        label: 'Avg Time to Total (s)',
        data: allStats.map(s => s.avgTimeToTotal),
        backgroundColor: allStats.map(s =>
          s.golfer === stats.golfer
            ? 'rgba(34, 197, 94, 0.8)'
            : 'rgba(107, 114, 128, 0.6)'
        ),
      },
    ],
  };

  // Distance per shot bar chart
  const distanceData = {
    labels: stats.shots.map((s, i) => `H${s.holeNumber}-S${s.strokeNumber}`),
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

  return (
    <div className="space-y-8">
      {/* Time to Data - Primary Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Time to Data by Shot</h3>
        <p className="text-sm text-gray-500 mb-4">Shows how long (in seconds) after the first data point each metric was received</p>
        <div className="h-80">
          <Line
            data={timeToDataChart}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  title: { display: true, text: 'Seconds', color: '#9CA3AF' },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Average Time to Data */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Average Time to Data</h3>
          <p className="text-sm text-gray-500 mb-4">Average seconds from first data to each metric</p>
          <div className="h-64">
            <Bar
              data={avgTimeToDataChart}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    title: { display: true, text: 'Seconds', color: '#9CA3AF' },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Golfer Comparison - Time to Total */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Golfer Comparison - Time to Total</h3>
          <p className="text-sm text-gray-500 mb-4">Average time to receive total distance by golfer</p>
          <div className="h-64">
            <Bar
              data={golferTimeComparison}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    title: { display: true, text: 'Seconds', color: '#9CA3AF' },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Distance per shot */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Distance by Shot</h3>
          <div className="h-64">
            <Bar data={distanceData} options={chartOptions} />
          </div>
        </div>

        {/* Golfer comparison - distance */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Golfer Comparison - Avg Distance</h3>
          <div className="h-64">
            <Bar
              data={{
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
              }}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Shot details table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Shot Details with Timing</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 pr-4">Hole</th>
                <th className="pb-3 pr-4">Stroke</th>
                <th className="pb-3 pr-4">Ball Speed</th>
                <th className="pb-3 pr-4">Total Dist</th>
                <th className="pb-3 pr-4 text-yellow-400">Time to Speed</th>
                <th className="pb-3 pr-4 text-yellow-400">Time to Apex</th>
                <th className="pb-3 pr-4 text-yellow-400">Time to Carry</th>
                <th className="pb-3 text-yellow-400">Time to Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.shots.map((shot, i) => (
                <tr key={i} className="border-b border-gray-700/50">
                  <td className="py-2 pr-4">{shot.holeNumber}</td>
                  <td className="py-2 pr-4">{shot.strokeNumber}</td>
                  <td className="py-2 pr-4">{shot.ballSpeed?.toFixed(1) ?? '-'} mph</td>
                  <td className="py-2 pr-4 font-semibold text-green-400">{shot.totalDistance?.toFixed(1) ?? '-'} yds</td>
                  <td className="py-2 pr-4 text-yellow-300">{shot.timeToBallSpeed !== null ? (shot.timeToBallSpeed / 1000).toFixed(2) : '-'}s</td>
                  <td className="py-2 pr-4 text-yellow-300">{shot.timeToApex !== null ? (shot.timeToApex / 1000).toFixed(2) : '-'}s</td>
                  <td className="py-2 pr-4 text-yellow-300">{shot.timeToCarry !== null ? (shot.timeToCarry / 1000).toFixed(2) : '-'}s</td>
                  <td className="py-2 text-yellow-300 font-semibold">{shot.timeToTotal !== null ? (shot.timeToTotal / 1000).toFixed(2) : '-'}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
