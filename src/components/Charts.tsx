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
  Legend
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
  // Time from first timestamp to each data point - PRIMARY VIEW
  const timeFromFirstChart = {
    labels: stats.shots.map((s) => `H${s.holeNumber}-S${s.strokeNumber}`),
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

  // Average time from first timestamp to each metric
  const avgTimeChart = {
    labels: ['Ball Speed', 'Launch', 'Apex', 'Curve', 'Carry', 'Total'],
    datasets: [
      {
        label: 'Avg Seconds From First Data',
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

  // Golfer comparison - time to total
  const golferComparison = {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Print Comparison
        </button>
      </div>

      {/* Time From First Timestamp - PRIMARY CHART */}
      <div className="bg-gray-800 rounded-lg p-6 print:bg-white print:border print:border-gray-300">
        <h3 className="text-xl font-semibold mb-2 text-yellow-400 print:text-black">
          Time From First Timestamp (per shot)
        </h3>
        <p className="text-sm text-gray-500 mb-4 print:text-gray-600">
          Shows how fast each data point arrives after the shot is first detected (in seconds)
        </p>
        <div className="h-80">
          <Line
            data={timeFromFirstChart}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  title: { display: true, text: 'Seconds from first data', color: '#9CA3AF' },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Average Time Bar Chart */}
        <div className="bg-gray-800 rounded-lg p-6 print:bg-white print:border print:border-gray-300">
          <h3 className="text-lg font-semibold mb-2 text-yellow-400 print:text-black">
            Avg Time to Each Data Point
          </h3>
          <p className="text-sm text-gray-500 mb-4 print:text-gray-600">
            Average seconds from first timestamp to each metric
          </p>
          <div className="h-64">
            <Bar
              data={avgTimeChart}
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

        {/* Golfer Comparison */}
        <div className="bg-gray-800 rounded-lg p-6 print:bg-white print:border print:border-gray-300">
          <h3 className="text-lg font-semibold mb-2 text-gray-300 print:text-black">
            Golfer Comparison - Time to Complete Data
          </h3>
          <p className="text-sm text-gray-500 mb-4 print:text-gray-600">
            Average time until all data is received, by golfer
          </p>
          <div className="h-64">
            <Bar
              data={golferComparison}
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
      </div>

      {/* Shot details table */}
      <div className="bg-gray-800 rounded-lg p-6 print:bg-white print:border print:border-gray-300">
        <h3 className="text-lg font-semibold mb-4 text-gray-300 print:text-black">
          Shot Details - Time From First Timestamp
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700 print:text-black print:border-gray-300">
                <th className="pb-3 pr-4">Hole</th>
                <th className="pb-3 pr-4">Stroke</th>
                <th className="pb-3 pr-4">Total Dist</th>
                <th className="pb-3 pr-4 text-red-400 print:text-red-600">Speed</th>
                <th className="pb-3 pr-4 text-orange-400 print:text-orange-600">Launch</th>
                <th className="pb-3 pr-4 text-yellow-400 print:text-yellow-600">Apex</th>
                <th className="pb-3 pr-4 text-green-400 print:text-green-600">Curve</th>
                <th className="pb-3 pr-4 text-blue-400 print:text-blue-600">Carry</th>
                <th className="pb-3 text-purple-400 print:text-purple-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.shots.map((shot, i) => (
                <tr key={i} className="border-b border-gray-700/50 print:border-gray-200">
                  <td className="py-2 pr-4">{shot.holeNumber}</td>
                  <td className="py-2 pr-4">{shot.strokeNumber}</td>
                  <td className="py-2 pr-4 font-semibold text-green-400 print:text-green-600">
                    {shot.totalDistance?.toFixed(0) ?? '-'} yds
                  </td>
                  <td className="py-2 pr-4 text-red-300 print:text-red-600">
                    {shot.timeToBallSpeed !== null ? (shot.timeToBallSpeed / 1000).toFixed(2) : '-'}s
                  </td>
                  <td className="py-2 pr-4 text-orange-300 print:text-orange-600">
                    {shot.timeToLaunchAngle !== null ? (shot.timeToLaunchAngle / 1000).toFixed(2) : '-'}s
                  </td>
                  <td className="py-2 pr-4 text-yellow-300 print:text-yellow-600">
                    {shot.timeToApex !== null ? (shot.timeToApex / 1000).toFixed(2) : '-'}s
                  </td>
                  <td className="py-2 pr-4 text-green-300 print:text-green-600">
                    {shot.timeToCurve !== null ? (shot.timeToCurve / 1000).toFixed(2) : '-'}s
                  </td>
                  <td className="py-2 pr-4 text-blue-300 print:text-blue-600">
                    {shot.timeToCarry !== null ? (shot.timeToCarry / 1000).toFixed(2) : '-'}s
                  </td>
                  <td className="py-2 text-purple-300 print:text-purple-600 font-semibold">
                    {shot.timeToTotal !== null ? (shot.timeToTotal / 1000).toFixed(2) : '-'}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
