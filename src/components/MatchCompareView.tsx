import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CompareResponse, GolferStats, GolferComparison, TimingDiffs } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: CompareResponse;
}

function diff(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null;
  return b - a;
}

function buildComparisons(statsA: GolferStats[], statsB: GolferStats[]): GolferComparison[] {
  const allGolfers = new Set<string>();
  statsA.forEach(s => allGolfers.add(s.golfer));
  statsB.forEach(s => allGolfers.add(s.golfer));

  const mapA = new Map(statsA.map(s => [s.golfer, s]));
  const mapB = new Map(statsB.map(s => [s.golfer, s]));

  return Array.from(allGolfers).sort().map(golfer => {
    const a = mapA.get(golfer) || null;
    const b = mapB.get(golfer) || null;

    return {
      golfer,
      matchA: a,
      matchB: b,
      diffs: {
        avgTimeToBallSpeed: diff(a?.avgTimeToBallSpeed ?? null, b?.avgTimeToBallSpeed ?? null),
        avgTimeToLaunchAngle: diff(a?.avgTimeToLaunchAngle ?? null, b?.avgTimeToLaunchAngle ?? null),
        avgTimeToApex: diff(a?.avgTimeToApex ?? null, b?.avgTimeToApex ?? null),
        avgTimeToCurve: diff(a?.avgTimeToCurve ?? null, b?.avgTimeToCurve ?? null),
        avgTimeToCarry: diff(a?.avgTimeToCarry ?? null, b?.avgTimeToCarry ?? null),
        avgTimeToTotal: diff(a?.avgTimeToTotal ?? null, b?.avgTimeToTotal ?? null),
      },
    };
  });
}

function formatNum(value: number | null, decimals: number = 2): string {
  if (value === null) return '-';
  return value.toFixed(decimals);
}

function DiffCell({ value }: { value: number | null }) {
  if (value === null) return <td className="py-2 pr-3 text-gray-500">-</td>;
  const improved = value < -0.005;
  const worse = value > 0.005;
  const color = improved
    ? 'text-green-400 print:text-green-600'
    : worse
    ? 'text-red-400 print:text-red-600'
    : 'text-gray-400 print:text-gray-500';
  const prefix = improved ? '' : worse ? '+' : '';
  return (
    <td className={`py-2 pr-3 font-bold ${color}`}>
      {prefix}{value.toFixed(2)}s
    </td>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#9CA3AF', font: { size: 10 } },
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

export default function MatchCompareView({ data }: Props) {
  const comparisons = buildComparisons(data.matchA.stats, data.matchB.stats);
  const bothMatches = comparisons.filter(c => c.matchA && c.matchB);

  // Diff chart - bars above/below zero
  const diffChart = {
    labels: bothMatches.map(c => c.golfer),
    datasets: [
      {
        label: 'Speed',
        data: bothMatches.map(c => c.diffs.avgTimeToBallSpeed),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Launch',
        data: bothMatches.map(c => c.diffs.avgTimeToLaunchAngle),
        backgroundColor: 'rgba(249, 115, 22, 0.7)',
      },
      {
        label: 'Apex',
        data: bothMatches.map(c => c.diffs.avgTimeToApex),
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
      },
      {
        label: 'Curve',
        data: bothMatches.map(c => c.diffs.avgTimeToCurve),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
      {
        label: 'Carry',
        data: bothMatches.map(c => c.diffs.avgTimeToCarry),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'Total',
        data: bothMatches.map(c => c.diffs.avgTimeToTotal),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
      },
    ],
  };

  // Side-by-side total time
  const sideBySideChart = {
    labels: bothMatches.map(c => c.golfer),
    datasets: [
      {
        label: data.matchA.matchNumber,
        data: bothMatches.map(c => c.matchA!.avgTimeToTotal),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: data.matchB.matchNumber,
        data: bothMatches.map(c => c.matchB!.avgTimeToTotal),
        backgroundColor: 'rgba(249, 115, 22, 0.7)',
      },
    ],
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400 print:text-black">
            Match Comparison
          </h2>
          <p className="text-gray-400 print:text-gray-600 mt-1">
            <span className="text-blue-400 print:text-blue-600 font-semibold">A: {data.matchA.matchNumber}</span>
            {data.matchA.description && ` - ${data.matchA.description}`}
            <span className="mx-2">vs</span>
            <span className="text-orange-400 print:text-orange-600 font-semibold">B: {data.matchB.matchNumber}</span>
            {data.matchB.description && ` - ${data.matchB.description}`}
          </p>
          <p className="text-xs text-gray-500 mt-1 print:text-gray-600">
            Negative (green) = faster in B | Positive (red) = slower in B
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors print:hidden"
        >
          Print Comparison
        </button>
      </div>

      {/* Comparison Summary Table */}
      <div className="print-section bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
        <h3 className="text-lg font-semibold mb-3 text-yellow-400 print:text-black">
          Timing Differences (seconds)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm compare-table">
            <thead>
              <tr className="text-left text-gray-400 border-b-2 border-gray-600 print:text-black print:border-gray-400">
                <th className="pb-2 pr-3" rowSpan={2}>Golfer</th>
                <th className="pb-1 pr-3 text-center text-red-400 print:text-red-600" colSpan={3}>Speed</th>
                <th className="pb-1 pr-3 text-center text-orange-400 print:text-orange-600" colSpan={3}>Launch</th>
                <th className="pb-1 pr-3 text-center text-yellow-400 print:text-yellow-600" colSpan={3}>Apex</th>
                <th className="pb-1 pr-3 text-center text-green-400 print:text-green-600" colSpan={3}>Curve</th>
                <th className="pb-1 pr-3 text-center text-blue-400 print:text-blue-600" colSpan={3}>Carry</th>
                <th className="pb-1 text-center text-purple-400 print:text-purple-600" colSpan={3}>Total</th>
              </tr>
              <tr className="text-left text-gray-500 border-b border-gray-700 print:text-gray-600 print:border-gray-300 text-xs">
                <th className="pb-2 pr-2 text-blue-400 print:text-blue-600">A</th>
                <th className="pb-2 pr-2 text-orange-400 print:text-orange-600">B</th>
                <th className="pb-2 pr-3">Diff</th>
                <th className="pb-2 pr-2 text-blue-400 print:text-blue-600">A</th>
                <th className="pb-2 pr-2 text-orange-400 print:text-orange-600">B</th>
                <th className="pb-2 pr-3">Diff</th>
                <th className="pb-2 pr-2 text-blue-400 print:text-blue-600">A</th>
                <th className="pb-2 pr-2 text-orange-400 print:text-orange-600">B</th>
                <th className="pb-2 pr-3">Diff</th>
                <th className="pb-2 pr-2 text-blue-400 print:text-blue-600">A</th>
                <th className="pb-2 pr-2 text-orange-400 print:text-orange-600">B</th>
                <th className="pb-2 pr-3">Diff</th>
                <th className="pb-2 pr-2 text-blue-400 print:text-blue-600">A</th>
                <th className="pb-2 pr-2 text-orange-400 print:text-orange-600">B</th>
                <th className="pb-2 pr-3">Diff</th>
                <th className="pb-2 pr-2 text-blue-400 print:text-blue-600">A</th>
                <th className="pb-2 pr-2 text-orange-400 print:text-orange-600">B</th>
                <th className="pb-2">Diff</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map(c => (
                <tr key={c.golfer} className="border-b border-gray-700/50 print:border-gray-200 text-xs">
                  <td className="py-2 pr-3 font-semibold text-white print:text-black text-sm">
                    {c.golfer}
                    {!c.matchA && <span className="text-gray-500 text-xs ml-1">(B only)</span>}
                    {!c.matchB && <span className="text-gray-500 text-xs ml-1">(A only)</span>}
                  </td>
                  {/* Speed */}
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchA?.avgTimeToBallSpeed ?? null)}</td>
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchB?.avgTimeToBallSpeed ?? null)}</td>
                  <DiffCell value={c.diffs.avgTimeToBallSpeed} />
                  {/* Launch */}
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchA?.avgTimeToLaunchAngle ?? null)}</td>
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchB?.avgTimeToLaunchAngle ?? null)}</td>
                  <DiffCell value={c.diffs.avgTimeToLaunchAngle} />
                  {/* Apex */}
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchA?.avgTimeToApex ?? null)}</td>
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchB?.avgTimeToApex ?? null)}</td>
                  <DiffCell value={c.diffs.avgTimeToApex} />
                  {/* Curve */}
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchA?.avgTimeToCurve ?? null)}</td>
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchB?.avgTimeToCurve ?? null)}</td>
                  <DiffCell value={c.diffs.avgTimeToCurve} />
                  {/* Carry */}
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchA?.avgTimeToCarry ?? null)}</td>
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchB?.avgTimeToCarry ?? null)}</td>
                  <DiffCell value={c.diffs.avgTimeToCarry} />
                  {/* Total */}
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchA?.avgTimeToTotal ?? null)}</td>
                  <td className="py-2 pr-2 text-gray-400">{formatNum(c.matchB?.avgTimeToTotal ?? null)}</td>
                  <DiffCell value={c.diffs.avgTimeToTotal} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
        {/* Diff chart */}
        <div className="print-section chart-container bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400 print:text-black">
            Timing Differences (B - A)
          </h3>
          <p className="text-xs text-gray-500 mb-2">Below 0 = faster in B</p>
          <div className="h-48 print:h-40">
            <Bar
              data={diffChart}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    title: { display: true, text: 'Seconds (Δ)', color: '#9CA3AF', font: { size: 9 } },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Side-by-side total */}
        <div className="print-section chart-container bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400 print:text-black">
            Total Time to Complete Data
          </h3>
          <div className="h-48 print:h-40">
            <Bar
              data={sideBySideChart}
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
      </div>

      {/* Per-Golfer Detail Cards */}
      {comparisons.filter(c => c.matchA && c.matchB).map(c => (
        <div
          key={c.golfer}
          className="golfer-detail-section print-section bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300"
        >
          <h3 className="text-base font-semibold mb-2 text-green-400 print:text-black">{c.golfer}</h3>
          <div className="grid grid-cols-6 gap-3 text-xs">
            {([
              ['Speed', c.matchA!.avgTimeToBallSpeed, c.matchB!.avgTimeToBallSpeed, c.diffs.avgTimeToBallSpeed],
              ['Launch', c.matchA!.avgTimeToLaunchAngle, c.matchB!.avgTimeToLaunchAngle, c.diffs.avgTimeToLaunchAngle],
              ['Apex', c.matchA!.avgTimeToApex, c.matchB!.avgTimeToApex, c.diffs.avgTimeToApex],
              ['Curve', c.matchA!.avgTimeToCurve, c.matchB!.avgTimeToCurve, c.diffs.avgTimeToCurve],
              ['Carry', c.matchA!.avgTimeToCarry, c.matchB!.avgTimeToCarry, c.diffs.avgTimeToCarry],
              ['Total', c.matchA!.avgTimeToTotal, c.matchB!.avgTimeToTotal, c.diffs.avgTimeToTotal],
            ] as [string, number | null, number | null, number | null][]).map(([label, valA, valB, d]) => {
              const improved = d !== null && d < -0.005;
              const worse = d !== null && d > 0.005;
              const diffColor = improved ? 'text-green-400 print:text-green-600' : worse ? 'text-red-400 print:text-red-600' : 'text-gray-400';
              const prefix = improved ? '' : worse ? '+' : '';

              return (
                <div key={label} className="bg-gray-700/50 rounded p-2 print:bg-gray-50 print:border print:border-gray-200">
                  <div className="text-gray-400 print:text-gray-600 mb-1">{label}</div>
                  <div className="text-gray-300 print:text-gray-700">
                    <span className="text-blue-400 print:text-blue-600">A:</span> {formatNum(valA)}s
                  </div>
                  <div className="text-gray-300 print:text-gray-700">
                    <span className="text-orange-400 print:text-orange-600">B:</span> {formatNum(valB)}s
                  </div>
                  <div className={`font-bold mt-1 ${diffColor}`}>
                    {d !== null ? `${prefix}${d.toFixed(2)}s` : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
