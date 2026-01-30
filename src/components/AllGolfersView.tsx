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
import { Bar } from 'react-chartjs-2';
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
  stats: GolferStats[];
  matchInfo: { matchNumber: string; description: string };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#9CA3AF',
        font: { size: 10 }
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#9CA3AF', font: { size: 10 } },
      grid: { color: '#374151' },
    },
    y: {
      ticks: { color: '#9CA3AF', font: { size: 10 } },
      grid: { color: '#374151' },
    },
  },
};

function formatNumber(value: number | null, decimals: number = 1): string {
  if (value === null) return '-';
  return value.toFixed(decimals);
}

export default function AllGolfersView({ stats, matchInfo }: Props) {
  const colors = [
    'rgba(34, 197, 94, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(234, 179, 8, 0.8)',
  ];

  // Time to each data point comparison
  const timeComparisonChart = {
    labels: ['Speed', 'Launch', 'Apex', 'Curve', 'Carry', 'Total'],
    datasets: stats.map((s, i) => ({
      label: s.golfer,
      data: [
        s.avgTimeToBallSpeed,
        s.avgTimeToLaunchAngle,
        s.avgTimeToApex,
        s.avgTimeToCurve,
        s.avgTimeToCarry,
        s.avgTimeToTotal,
      ],
      backgroundColor: colors[i % colors.length],
    })),
  };

  // Total time comparison
  const totalTimeChart = {
    labels: stats.map(s => s.golfer),
    datasets: [{
      label: 'Avg Time to Complete (s)',
      data: stats.map(s => s.avgTimeToTotal),
      backgroundColor: colors.slice(0, stats.length),
    }],
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with print button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-400 print:text-black">{matchInfo.matchNumber}</h2>
          {matchInfo.description && (
            <p className="text-gray-400 print:text-gray-600">{matchInfo.description}</p>
          )}
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors print:hidden"
        >
          Print Comparison
        </button>
      </div>

      {/* Summary Section - All Golfers Stats Table */}
      <div className="print-section bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
        <h3 className="text-lg font-semibold mb-3 text-yellow-400 print:text-black">
          Summary - Time From First Timestamp (seconds)
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700 print:text-black print:border-gray-300 print:bg-gray-100">
              <th className="pb-2 pr-3">Golfer</th>
              <th className="pb-2 pr-3">Shots</th>
              <th className="pb-2 pr-3">Avg Dist</th>
              <th className="pb-2 pr-3 text-red-400 print:text-red-600">Speed</th>
              <th className="pb-2 pr-3 text-orange-400 print:text-orange-600">Launch</th>
              <th className="pb-2 pr-3 text-yellow-400 print:text-yellow-600">Apex</th>
              <th className="pb-2 pr-3 text-green-400 print:text-green-600">Curve</th>
              <th className="pb-2 pr-3 text-blue-400 print:text-blue-600">Carry</th>
              <th className="pb-2 text-purple-400 print:text-purple-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((golfer) => (
              <tr key={golfer.golfer} className="border-b border-gray-700/50 print:border-gray-200">
                <td className="py-2 pr-3 font-semibold text-white print:text-black">{golfer.golfer}</td>
                <td className="py-2 pr-3 text-gray-400 print:text-gray-600">{golfer.shots.length}</td>
                <td className="py-2 pr-3 text-green-400 print:text-green-600">{formatNumber(golfer.avgTotalDistance, 0)} yds</td>
                <td className="py-2 pr-3 text-red-300 print:text-red-600">{formatNumber(golfer.avgTimeToBallSpeed, 2)}</td>
                <td className="py-2 pr-3 text-orange-300 print:text-orange-600">{formatNumber(golfer.avgTimeToLaunchAngle, 2)}</td>
                <td className="py-2 pr-3 text-yellow-300 print:text-yellow-600">{formatNumber(golfer.avgTimeToApex, 2)}</td>
                <td className="py-2 pr-3 text-green-300 print:text-green-600">{formatNumber(golfer.avgTimeToCurve, 2)}</td>
                <td className="py-2 pr-3 text-blue-300 print:text-blue-600">{formatNumber(golfer.avgTimeToCarry, 2)}</td>
                <td className="py-2 text-purple-300 print:text-purple-600 font-bold">{formatNumber(golfer.avgTimeToTotal, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
        <div className="print-section chart-container bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400 print:text-black">
            Time to Each Data Point
          </h3>
          <div className="h-48 print:h-40">
            <Bar
              data={timeComparisonChart}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    title: { display: true, text: 'Seconds', color: '#9CA3AF', font: { size: 9 } },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="print-section chart-container bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400 print:text-black">
            Total Time to Complete Data
          </h3>
          <div className="h-48 print:h-40">
            <Bar
              data={totalTimeChart}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    title: { display: true, text: 'Seconds', color: '#9CA3AF', font: { size: 9 } },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Individual Golfer Shot Details */}
      {stats.map(golfer => (
        <div
          key={golfer.golfer}
          className="golfer-detail-section print-section bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300"
        >
          <h3 className="text-base font-semibold mb-1 text-green-400 print:text-black">
            {golfer.golfer}
          </h3>
          <p className="text-xs text-gray-500 mb-2 print:text-gray-600">
            {golfer.shots.length} shots | Avg: {formatNumber(golfer.avgTotalDistance, 0)} yds |
            Avg Time to Total: {formatNumber(golfer.avgTimeToTotal, 2)}s
          </p>
          <table className="w-full print-compact-table">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700 print:text-black print:border-gray-300 print:bg-gray-100 text-xs">
                <th className="pb-1 pr-2">H</th>
                <th className="pb-1 pr-2">S</th>
                <th className="pb-1 pr-2">Dist</th>
                <th className="pb-1 pr-2 text-red-400 print:text-red-600">Spd</th>
                <th className="pb-1 pr-2 text-orange-400 print:text-orange-600">Lnch</th>
                <th className="pb-1 pr-2 text-yellow-400 print:text-yellow-600">Apex</th>
                <th className="pb-1 pr-2 text-green-400 print:text-green-600">Crv</th>
                <th className="pb-1 pr-2 text-blue-400 print:text-blue-600">Carry</th>
                <th className="pb-1 text-purple-400 print:text-purple-600">Total</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {golfer.shots.map((shot, i) => (
                <tr key={i} className="border-b border-gray-700/50 print:border-gray-200">
                  <td className="py-1 pr-2">{shot.holeNumber}</td>
                  <td className="py-1 pr-2">{shot.strokeNumber}</td>
                  <td className="py-1 pr-2 text-green-400 print:text-green-600">{shot.totalDistance?.toFixed(0) ?? '-'}</td>
                  <td className="py-1 pr-2 text-red-300 print:text-red-600">{shot.timeToBallSpeed !== null ? (shot.timeToBallSpeed / 1000).toFixed(2) : '-'}</td>
                  <td className="py-1 pr-2 text-orange-300 print:text-orange-600">{shot.timeToLaunchAngle !== null ? (shot.timeToLaunchAngle / 1000).toFixed(2) : '-'}</td>
                  <td className="py-1 pr-2 text-yellow-300 print:text-yellow-600">{shot.timeToApex !== null ? (shot.timeToApex / 1000).toFixed(2) : '-'}</td>
                  <td className="py-1 pr-2 text-green-300 print:text-green-600">{shot.timeToCurve !== null ? (shot.timeToCurve / 1000).toFixed(2) : '-'}</td>
                  <td className="py-1 pr-2 text-blue-300 print:text-blue-600">{shot.timeToCarry !== null ? (shot.timeToCarry / 1000).toFixed(2) : '-'}</td>
                  <td className="py-1 text-purple-300 print:text-purple-600">{shot.timeToTotal !== null ? (shot.timeToTotal / 1000).toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
