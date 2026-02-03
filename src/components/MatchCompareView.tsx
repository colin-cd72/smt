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
import { CompareResponse, ShotTimingData, ShotPositionComparison, TimingDiffs } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: CompareResponse;
}

function diffVal(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null;
  return b - a;
}

function getAllShots(stats: CompareResponse['matchA']['stats']): ShotTimingData[] {
  return stats.flatMap(g => g.shots);
}

function buildPositionComparisons(
  shotsA: ShotTimingData[],
  shotsB: ShotTimingData[]
): ShotPositionComparison[] {
  // Build maps keyed by "hole-stroke"
  const mapA = new Map<string, ShotTimingData>();
  const mapB = new Map<string, ShotTimingData>();

  shotsA.forEach(s => mapA.set(`${s.holeNumber}-${s.strokeNumber}`, s));
  shotsB.forEach(s => mapB.set(`${s.holeNumber}-${s.strokeNumber}`, s));

  const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);

  const comparisons: ShotPositionComparison[] = [];

  Array.from(allKeys)
    .sort((a, b) => {
      const [ah, as_] = a.split('-').map(Number);
      const [bh, bs] = b.split('-').map(Number);
      return ah !== bh ? ah - bh : as_ - bs;
    })
    .forEach(key => {
      const shotA = mapA.get(key) || null;
      const shotB = mapB.get(key) || null;
      const [holeNumber, strokeNumber] = key.split('-').map(Number);

      // Convert ms to seconds for diffs
      const toSec = (v: number | null) => v !== null ? v / 1000 : null;

      const diffs: TimingDiffs = {
        timeToBallSpeed: diffVal(toSec(shotA?.timeToBallSpeed ?? null), toSec(shotB?.timeToBallSpeed ?? null)),
        timeToLaunchAngle: diffVal(toSec(shotA?.timeToLaunchAngle ?? null), toSec(shotB?.timeToLaunchAngle ?? null)),
        timeToApex: diffVal(toSec(shotA?.timeToApex ?? null), toSec(shotB?.timeToApex ?? null)),
        timeToCurve: diffVal(toSec(shotA?.timeToCurve ?? null), toSec(shotB?.timeToCurve ?? null)),
        timeToCarry: diffVal(toSec(shotA?.timeToCarry ?? null), toSec(shotB?.timeToCarry ?? null)),
        timeToTotal: diffVal(toSec(shotA?.timeToTotal ?? null), toSec(shotB?.timeToTotal ?? null)),
      };

      comparisons.push({ holeNumber, strokeNumber, shotA, shotB, diffs });
    });

  return comparisons;
}

function formatNum(value: number | null, decimals: number = 2): string {
  if (value === null) return '-';
  return value.toFixed(decimals);
}

function formatMs(value: number | null): string {
  if (value === null) return '-';
  return (value / 1000).toFixed(2);
}

function DiffCell({ value }: { value: number | null }) {
  if (value === null) return <td className="py-2 pr-2 text-gray-500">-</td>;
  const improved = value < -0.005;
  const worse = value > 0.005;
  const color = improved
    ? 'text-green-400 print:text-green-600'
    : worse
    ? 'text-red-400 print:text-red-600'
    : 'text-gray-400 print:text-gray-500';
  const prefix = improved ? '' : worse ? '+' : '';
  return (
    <td className={`py-2 pr-2 font-bold ${color}`}>
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
      ticks: { color: '#9CA3AF', font: { size: 9 } },
      grid: { color: '#374151' },
    },
    y: {
      ticks: { color: '#9CA3AF', font: { size: 9 } },
      grid: { color: '#374151' },
    },
  },
};

export default function MatchCompareView({ data }: Props) {
  const shotsA = getAllShots(data.matchA.stats);
  const shotsB = getAllShots(data.matchB.stats);
  const comparisons = buildPositionComparisons(shotsA, shotsB);
  const matched = comparisons.filter(c => c.shotA && c.shotB);

  // Compute averages for matched positions
  const avgDiff = (field: keyof TimingDiffs) => {
    const vals = matched.map(c => c.diffs[field]).filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const avgDiffs: TimingDiffs = {
    timeToBallSpeed: avgDiff('timeToBallSpeed'),
    timeToLaunchAngle: avgDiff('timeToLaunchAngle'),
    timeToApex: avgDiff('timeToApex'),
    timeToCurve: avgDiff('timeToCurve'),
    timeToCarry: avgDiff('timeToCarry'),
    timeToTotal: avgDiff('timeToTotal'),
  };

  // Diff chart per matched shot position
  const shotLabels = matched.map(c => `H${c.holeNumber}-S${c.strokeNumber}`);

  const diffChart = {
    labels: shotLabels,
    datasets: [
      { label: 'Speed', data: matched.map(c => c.diffs.timeToBallSpeed), backgroundColor: 'rgba(239, 68, 68, 0.7)' },
      { label: 'Launch', data: matched.map(c => c.diffs.timeToLaunchAngle), backgroundColor: 'rgba(249, 115, 22, 0.7)' },
      { label: 'Apex', data: matched.map(c => c.diffs.timeToApex), backgroundColor: 'rgba(234, 179, 8, 0.7)' },
      { label: 'Curve', data: matched.map(c => c.diffs.timeToCurve), backgroundColor: 'rgba(34, 197, 94, 0.7)' },
      { label: 'Carry', data: matched.map(c => c.diffs.timeToCarry), backgroundColor: 'rgba(59, 130, 246, 0.7)' },
      { label: 'Total', data: matched.map(c => c.diffs.timeToTotal), backgroundColor: 'rgba(168, 85, 247, 0.7)' },
    ],
  };

  // Side-by-side total time per position
  const sideBySideChart = {
    labels: shotLabels,
    datasets: [
      {
        label: data.matchA.matchNumber,
        data: matched.map(c => c.shotA!.timeToTotal !== null ? c.shotA!.timeToTotal / 1000 : null),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: data.matchB.matchNumber,
        data: matched.map(c => c.shotB!.timeToTotal !== null ? c.shotB!.timeToTotal / 1000 : null),
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
            Match Comparison by Shot Position
          </h2>
          <p className="text-gray-400 print:text-gray-600 mt-1">
            <span className="text-blue-400 print:text-blue-600 font-semibold">A: {data.matchA.matchNumber}</span>
            {data.matchA.description && ` - ${data.matchA.description}`}
            <span className="mx-2">vs</span>
            <span className="text-orange-400 print:text-orange-600 font-semibold">B: {data.matchB.matchNumber}</span>
            {data.matchB.description && ` - ${data.matchB.description}`}
          </p>
          <p className="text-xs text-gray-500 mt-1 print:text-gray-600">
            Matched by Hole + Stroke number | Green = faster in B | Red = slower in B
          </p>
          <p className="text-xs text-gray-500 print:text-gray-600">
            {matched.length} matched positions | {comparisons.length - matched.length} unmatched
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors print:hidden"
        >
          Print Comparison
        </button>
      </div>

      {/* Average Diffs Summary */}
      <div className="print-section bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
        <h3 className="text-lg font-semibold mb-3 text-yellow-400 print:text-black">
          Average Time Difference Across All Matched Positions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {([
            ['Speed', avgDiffs.timeToBallSpeed, 'text-red-400 print:text-red-600'],
            ['Launch', avgDiffs.timeToLaunchAngle, 'text-orange-400 print:text-orange-600'],
            ['Apex', avgDiffs.timeToApex, 'text-yellow-400 print:text-yellow-600'],
            ['Curve', avgDiffs.timeToCurve, 'text-green-400 print:text-green-600'],
            ['Carry', avgDiffs.timeToCarry, 'text-blue-400 print:text-blue-600'],
            ['Total', avgDiffs.timeToTotal, 'text-purple-400 print:text-purple-600'],
          ] as [string, number | null, string][]).map(([label, val, _labelColor]) => {
            const improved = val !== null && val < -0.005;
            const worse = val !== null && val > 0.005;
            const color = improved ? 'text-green-400' : worse ? 'text-red-400' : 'text-gray-400';
            const prefix = val !== null ? (improved ? '' : worse ? '+' : '') : '';
            return (
              <div key={label} className="bg-gray-700/50 rounded-lg p-3 print:bg-gray-50 print:border print:border-gray-200">
                <div className="text-gray-400 text-sm mb-1 print:text-gray-600">{label}</div>
                <div className={`text-2xl font-bold ${color}`}>
                  {val !== null ? `${prefix}${val.toFixed(2)}s` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shot Position Comparison Table */}
      <div className="print-section bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
        <h3 className="text-lg font-semibold mb-3 text-yellow-400 print:text-black">
          Shot-by-Shot Comparison (seconds from first timestamp)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs compare-table">
            <thead>
              <tr className="text-left text-gray-400 border-b-2 border-gray-600 print:text-black print:border-gray-400">
                <th className="pb-2 pr-2" rowSpan={2}>Pos</th>
                <th className="pb-2 pr-2" rowSpan={2}>Golfer A</th>
                <th className="pb-2 pr-2" rowSpan={2}>Golfer B</th>
                <th className="pb-1 pr-2 text-center text-red-400 print:text-red-600" colSpan={3}>Speed</th>
                <th className="pb-1 pr-2 text-center text-orange-400 print:text-orange-600" colSpan={3}>Launch</th>
                <th className="pb-1 pr-2 text-center text-yellow-400 print:text-yellow-600" colSpan={3}>Apex</th>
                <th className="pb-1 pr-2 text-center text-green-400 print:text-green-600" colSpan={3}>Curve</th>
                <th className="pb-1 pr-2 text-center text-blue-400 print:text-blue-600" colSpan={3}>Carry</th>
                <th className="pb-1 text-center text-purple-400 print:text-purple-600" colSpan={3}>Total</th>
              </tr>
              <tr className="text-left text-gray-500 border-b border-gray-700 print:text-gray-600 print:border-gray-300" style={{ fontSize: '0.6rem' }}>
                <th className="pb-1 pr-1 text-blue-400">A</th>
                <th className="pb-1 pr-1 text-orange-400">B</th>
                <th className="pb-1 pr-2">Δ</th>
                <th className="pb-1 pr-1 text-blue-400">A</th>
                <th className="pb-1 pr-1 text-orange-400">B</th>
                <th className="pb-1 pr-2">Δ</th>
                <th className="pb-1 pr-1 text-blue-400">A</th>
                <th className="pb-1 pr-1 text-orange-400">B</th>
                <th className="pb-1 pr-2">Δ</th>
                <th className="pb-1 pr-1 text-blue-400">A</th>
                <th className="pb-1 pr-1 text-orange-400">B</th>
                <th className="pb-1 pr-2">Δ</th>
                <th className="pb-1 pr-1 text-blue-400">A</th>
                <th className="pb-1 pr-1 text-orange-400">B</th>
                <th className="pb-1 pr-2">Δ</th>
                <th className="pb-1 pr-1 text-blue-400">A</th>
                <th className="pb-1 pr-1 text-orange-400">B</th>
                <th className="pb-1">Δ</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c, i) => {
                const onlyA = c.shotA && !c.shotB;
                const onlyB = !c.shotA && c.shotB;

                return (
                  <tr
                    key={i}
                    className={`border-b border-gray-700/50 print:border-gray-200
                      ${(onlyA || onlyB) ? 'opacity-50' : ''}`}
                  >
                    <td className="py-1 pr-2 font-semibold text-white print:text-black">
                      H{c.holeNumber}-S{c.strokeNumber}
                    </td>
                    <td className="py-1 pr-2 text-blue-300 print:text-blue-600">
                      {c.shotA?.golfer ?? '-'}
                    </td>
                    <td className="py-1 pr-2 text-orange-300 print:text-orange-600">
                      {c.shotB?.golfer ?? '-'}
                    </td>
                    {/* Speed */}
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToBallSpeed ?? null)}</td>
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToBallSpeed ?? null)}</td>
                    <DiffCell value={c.diffs.timeToBallSpeed} />
                    {/* Launch */}
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToLaunchAngle ?? null)}</td>
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToLaunchAngle ?? null)}</td>
                    <DiffCell value={c.diffs.timeToLaunchAngle} />
                    {/* Apex */}
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToApex ?? null)}</td>
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToApex ?? null)}</td>
                    <DiffCell value={c.diffs.timeToApex} />
                    {/* Curve */}
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToCurve ?? null)}</td>
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToCurve ?? null)}</td>
                    <DiffCell value={c.diffs.timeToCurve} />
                    {/* Carry */}
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToCarry ?? null)}</td>
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToCarry ?? null)}</td>
                    <DiffCell value={c.diffs.timeToCarry} />
                    {/* Total */}
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToTotal ?? null)}</td>
                    <td className="py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToTotal ?? null)}</td>
                    <DiffCell value={c.diffs.timeToTotal} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
        <div className="print-section chart-container bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400 print:text-black">
            Timing Differences by Shot Position (B - A)
          </h3>
          <p className="text-xs text-gray-500 mb-2">Below 0 = faster in B</p>
          <div className="h-56 print:h-44">
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

        <div className="print-section chart-container bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400 print:text-black">
            Time to Total - Side by Side
          </h3>
          <div className="h-56 print:h-44">
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
    </div>
  );
}
