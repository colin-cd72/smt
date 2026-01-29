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
  // Sequential deltas chart - PRIMARY VIEW
  // Shows time between each data step (Speed→Launch→Apex→Curve→Carry→Total)
  const sequentialDeltasChart = {
    labels: stats.shots.map((s, i) => `H${s.holeNumber}-S${s.strokeNumber}`),
    datasets: [
      {
        label: 'Speed → Launch',
        data: stats.shots.map(s => s.deltaSpeedToLaunch !== null ? s.deltaSpeedToLaunch / 1000 : null),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Launch → Apex',
        data: stats.shots.map(s => s.deltaLaunchToApex !== null ? s.deltaLaunchToApex / 1000 : null),
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Apex → Curve',
        data: stats.shots.map(s => s.deltaApexToCurve !== null ? s.deltaApexToCurve / 1000 : null),
        borderColor: 'rgba(234, 179, 8, 1)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Curve → Carry',
        data: stats.shots.map(s => s.deltaCurveToCarry !== null ? s.deltaCurveToCarry / 1000 : null),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Carry → Total',
        data: stats.shots.map(s => s.deltaCarryToTotal !== null ? s.deltaCarryToTotal / 1000 : null),
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Average sequential deltas bar chart
  const avgDeltasChart = {
    labels: ['Speed→Launch', 'Launch→Apex', 'Apex→Curve', 'Curve→Carry', 'Carry→Total'],
    datasets: [
      {
        label: 'Avg Time Between Steps (seconds)',
        data: [
          stats.avgDeltaSpeedToLaunch,
          stats.avgDeltaLaunchToApex,
          stats.avgDeltaApexToCurve,
          stats.avgDeltaCurveToCarry,
          stats.avgDeltaCarryToTotal,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(168, 85, 247, 0.7)',
        ],
      },
    ],
  };

  // Stacked bar showing cumulative time breakdown per shot
  const stackedTimeChart = {
    labels: stats.shots.map((s, i) => `H${s.holeNumber}-S${s.strokeNumber}`),
    datasets: [
      {
        label: 'To Ball Speed',
        data: stats.shots.map(s => s.timeToBallSpeed !== null ? s.timeToBallSpeed / 1000 : 0),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Speed → Launch',
        data: stats.shots.map(s => s.deltaSpeedToLaunch !== null ? s.deltaSpeedToLaunch / 1000 : 0),
        backgroundColor: 'rgba(249, 115, 22, 0.7)',
      },
      {
        label: 'Launch → Apex',
        data: stats.shots.map(s => s.deltaLaunchToApex !== null ? s.deltaLaunchToApex / 1000 : 0),
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
      },
      {
        label: 'Apex → Curve',
        data: stats.shots.map(s => s.deltaApexToCurve !== null ? s.deltaApexToCurve / 1000 : 0),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
      {
        label: 'Curve → Carry',
        data: stats.shots.map(s => s.deltaCurveToCarry !== null ? s.deltaCurveToCarry / 1000 : 0),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'Carry → Total',
        data: stats.shots.map(s => s.deltaCarryToTotal !== null ? s.deltaCarryToTotal / 1000 : 0),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
      },
    ],
  };

  // Golfer comparison - average time to total
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

  return (
    <div className="space-y-8">
      {/* Sequential Deltas - PRIMARY CHART */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-2 text-yellow-400">Time Between Data Points</h3>
        <p className="text-sm text-gray-500 mb-4">
          Shows the time gap (in seconds) between each successive data point arriving.
          Speed→Launch means time from Ball Speed to Launch Angle.
        </p>
        <div className="h-80">
          <Line
            data={sequentialDeltasChart}
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
        {/* Average Deltas Bar Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-yellow-400">Avg Time Between Steps</h3>
          <p className="text-sm text-gray-500 mb-4">Average seconds between each data stage</p>
          <div className="h-64">
            <Bar
              data={avgDeltasChart}
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
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Golfer Comparison - Total Time</h3>
          <p className="text-sm text-gray-500 mb-4">Average time to receive all data by golfer</p>
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
      </div>

      {/* Stacked Time Breakdown */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Time Breakdown per Shot (Stacked)</h3>
        <p className="text-sm text-gray-500 mb-4">Shows how total time is distributed across each data stage</p>
        <div className="h-64">
          <Bar
            data={stackedTimeChart}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: { ...chartOptions.scales.x, stacked: true },
                y: {
                  ...chartOptions.scales.y,
                  stacked: true,
                  title: { display: true, text: 'Seconds', color: '#9CA3AF' },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Shot details table with deltas */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Shot Details - Sequential Timing</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 pr-4">Hole</th>
                <th className="pb-3 pr-4">Stroke</th>
                <th className="pb-3 pr-4">Total Dist</th>
                <th className="pb-3 pr-4 text-red-400">→Speed</th>
                <th className="pb-3 pr-4 text-orange-400">→Launch</th>
                <th className="pb-3 pr-4 text-yellow-400">→Apex</th>
                <th className="pb-3 pr-4 text-green-400">→Curve</th>
                <th className="pb-3 pr-4 text-blue-400">→Carry</th>
                <th className="pb-3 text-purple-400">→Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.shots.map((shot, i) => (
                <tr key={i} className="border-b border-gray-700/50">
                  <td className="py-2 pr-4">{shot.holeNumber}</td>
                  <td className="py-2 pr-4">{shot.strokeNumber}</td>
                  <td className="py-2 pr-4 font-semibold text-green-400">{shot.totalDistance?.toFixed(0) ?? '-'} yds</td>
                  <td className="py-2 pr-4 text-red-300">{shot.timeToBallSpeed !== null ? (shot.timeToBallSpeed / 1000).toFixed(2) : '-'}s</td>
                  <td className="py-2 pr-4 text-orange-300">{shot.deltaSpeedToLaunch !== null ? (shot.deltaSpeedToLaunch / 1000).toFixed(2) : '-'}s</td>
                  <td className="py-2 pr-4 text-yellow-300">{shot.deltaLaunchToApex !== null ? (shot.deltaLaunchToApex / 1000).toFixed(2) : '-'}s</td>
                  <td className="py-2 pr-4 text-green-300">{shot.deltaApexToCurve !== null ? (shot.deltaApexToCurve / 1000).toFixed(2) : '-'}s</td>
                  <td className="py-2 pr-4 text-blue-300">{shot.deltaCurveToCarry !== null ? (shot.deltaCurveToCarry / 1000).toFixed(2) : '-'}s</td>
                  <td className="py-2 text-purple-300 font-semibold">{shot.deltaCarryToTotal !== null ? (shot.deltaCarryToTotal / 1000).toFixed(2) : '-'}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
