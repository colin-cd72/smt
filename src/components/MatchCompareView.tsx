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

function formatMs(value: number | null): string {
  if (value === null) return '-';
  return (value / 1000).toFixed(2);
}

// Determine if a diff value is an outlier (> threshold * avg absolute diff)
function isOutlier(value: number | null, avgAbsDiff: number | null, threshold: number = 2.0): boolean {
  if (value === null || avgAbsDiff === null || avgAbsDiff === 0) return false;
  return Math.abs(value) > threshold * avgAbsDiff;
}

function DiffCell({ value, outlier }: { value: number | null; outlier?: boolean }) {
  if (value === null) return <td className="col-diff py-2 pr-2 text-gray-500">-</td>;
  const improved = value < -0.005;
  const worse = value > 0.005;
  const color = improved
    ? 'text-green-400 print:text-green-600'
    : worse
    ? 'text-red-400 print:text-red-600'
    : 'text-gray-400 print:text-gray-500';
  const prefix = improved ? '' : worse ? '+' : '';
  return (
    <td className={`col-diff py-2 pr-2 font-bold ${color}`}>
      {outlier && <span className="mr-0.5" title="Outlier">!</span>}
      {prefix}{value.toFixed(2)}
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

  // Average of absolute values (for outlier detection)
  const avgAbsDiff = (field: keyof TimingDiffs) => {
    const vals = matched.map(c => c.diffs[field]).filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + Math.abs(b), 0) / vals.length : null;
  };

  const avgDiffs: TimingDiffs = {
    timeToBallSpeed: avgDiff('timeToBallSpeed'),
    timeToLaunchAngle: avgDiff('timeToLaunchAngle'),
    timeToApex: avgDiff('timeToApex'),
    timeToCurve: avgDiff('timeToCurve'),
    timeToCarry: avgDiff('timeToCarry'),
    timeToTotal: avgDiff('timeToTotal'),
  };

  const avgAbsDiffs: Record<keyof TimingDiffs, number | null> = {
    timeToBallSpeed: avgAbsDiff('timeToBallSpeed'),
    timeToLaunchAngle: avgAbsDiff('timeToLaunchAngle'),
    timeToApex: avgAbsDiff('timeToApex'),
    timeToCurve: avgAbsDiff('timeToCurve'),
    timeToCarry: avgAbsDiff('timeToCarry'),
    timeToTotal: avgAbsDiff('timeToTotal'),
  };

  // Overall verdict based on Total time diff
  const overallDiff = avgDiffs.timeToTotal;
  const overallFaster = overallDiff !== null && overallDiff < -0.005;
  const overallSlower = overallDiff !== null && overallDiff > 0.005;

  // Count outlier shots (any metric > 2x avg absolute diff)
  const outlierFields: (keyof TimingDiffs)[] = [
    'timeToBallSpeed', 'timeToLaunchAngle', 'timeToApex',
    'timeToCurve', 'timeToCarry', 'timeToTotal',
  ];

  const isRowOutlier = (c: ShotPositionComparison) => {
    return outlierFields.some(field =>
      isOutlier(c.diffs[field], avgAbsDiffs[field], 2.0)
    );
  };

  const outlierCount = matched.filter(isRowOutlier).length;

  // Count how many shots B was faster vs slower (using timeToTotal)
  const bFasterCount = matched.filter(c => c.diffs.timeToTotal !== null && c.diffs.timeToTotal < -0.005).length;
  const bSlowerCount = matched.filter(c => c.diffs.timeToTotal !== null && c.diffs.timeToTotal > 0.005).length;
  const tiedCount = matched.length - bFasterCount - bSlowerCount;

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
      {/* Verdict Banner */}
      <div className={`print-verdict rounded-xl p-6 text-center print:border-2 ${
        overallFaster
          ? 'bg-green-900/40 border border-green-500/50 print:bg-green-50 print:border-green-500'
          : overallSlower
          ? 'bg-red-900/40 border border-red-500/50 print:bg-red-50 print:border-red-500'
          : 'bg-gray-800 border border-gray-600 print:bg-gray-50 print:border-gray-400'
      }`}>
        <div className="verdict-sub text-sm uppercase tracking-wider text-gray-400 print:text-gray-600 mb-1">
          Overall Verdict — <span className="text-blue-400 print:text-blue-600">A: {data.matchA.matchNumber}</span> vs <span className="text-orange-400 print:text-orange-600">B: {data.matchB.matchNumber}</span>
        </div>
        <div className={`verdict-title text-3xl font-black mb-2 ${
          overallFaster
            ? 'text-green-400 print:text-green-700'
            : overallSlower
            ? 'text-red-400 print:text-red-700'
            : 'text-gray-300 print:text-gray-600'
        }`}>
          {overallDiff !== null
            ? overallFaster
              ? `B was ${Math.abs(overallDiff).toFixed(2)}s faster on avg`
              : overallSlower
              ? `B was ${Math.abs(overallDiff).toFixed(2)}s slower on avg`
              : 'No significant difference'
            : 'Insufficient data for comparison'}
        </div>
        <div className="verdict-sub text-sm text-gray-400 print:text-gray-600">
          {matched.length} matched positions |
          <span className="text-green-400 print:text-green-600 font-bold ml-1">{bFasterCount}</span> faster in B,
          <span className="text-red-400 print:text-red-600 font-bold ml-1">{bSlowerCount}</span> slower,
          <span className="font-bold ml-1">{tiedCount}</span> tied
          {outlierCount > 0 && (
            <span className="text-yellow-400 print:text-yellow-700 ml-2">| {outlierCount} outlier{outlierCount > 1 ? 's' : ''} (!)</span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">
            Match Comparison by Shot Position
          </h2>
          <div className="mt-2 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-blue-500"></span>
              <span className="text-blue-400 font-semibold">
                A: {data.matchA.matchNumber}
              </span>
              {data.matchA.description && (
                <span className="text-gray-500">- {data.matchA.description}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-orange-500"></span>
              <span className="text-orange-400 font-semibold">
                B: {data.matchB.matchNumber}
              </span>
              {data.matchB.description && (
                <span className="text-gray-500">- {data.matchB.description}</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Green = faster in B (improved) | Red = slower in B (worse) | ! = outlier
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Print Comparison
        </button>
      </div>

      {/* Average Diffs Summary */}
      <div className="print-section bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
        <h3 className="text-lg font-semibold mb-3 text-yellow-400 print:text-black print:text-sm print:mb-1">
          Avg Time Diff (B - A)
        </h3>
        <div className="print-avg-cards grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {([
            ['Speed', avgDiffs.timeToBallSpeed],
            ['Launch', avgDiffs.timeToLaunchAngle],
            ['Apex', avgDiffs.timeToApex],
            ['Curve', avgDiffs.timeToCurve],
            ['Carry', avgDiffs.timeToCarry],
            ['Total', avgDiffs.timeToTotal],
          ] as [string, number | null][]).map(([label, val]) => {
            const improved = val !== null && val < -0.005;
            const worse = val !== null && val > 0.005;
            const color = improved ? 'text-green-400' : worse ? 'text-red-400' : 'text-gray-400';
            const prefix = val !== null ? (improved ? '' : worse ? '+' : '') : '';
            return (
              <div key={label} className="bg-gray-700/50 rounded-lg p-3 print:bg-gray-50 print:border print:border-gray-200">
                <div className="avg-label text-gray-400 text-sm mb-1 print:text-gray-600">{label}</div>
                <div className={`avg-value text-2xl font-bold ${color}`}>
                  {val !== null ? `${prefix}${val.toFixed(2)}s` : '-'}
                </div>
                <div className="avg-label text-xs text-gray-500 mt-1">
                  {val !== null
                    ? improved ? 'B faster' : worse ? 'B slower' : 'Same'
                    : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shot Position Comparison Table */}
      <div className="print-section-flow bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300 print:rounded-none">
        <h3 className="text-lg font-semibold mb-1 text-yellow-400 print:text-black print:text-sm">
          Shot-by-Shot Comparison (seconds from first timestamp)
        </h3>
        <p className="text-xs text-gray-500 mb-3 print:text-gray-600 print:mb-1" style={{ fontSize: '0.6rem' }}>
          Yellow rows = outliers (! marker) | Green diff = B faster | Red diff = B slower
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs compare-table">
            <thead>
              <tr className="text-left text-gray-400 border-b-2 border-gray-600 print:text-black print:border-gray-400">
                <th className="col-pos pb-2 pr-2" rowSpan={2}>Pos</th>
                <th className="col-golfer pb-2 pr-2" rowSpan={2}>A</th>
                <th className="col-golfer pb-2 pr-2" rowSpan={2}>B</th>
                <th className="pb-1 pr-2 text-center text-red-400 print:text-red-600" colSpan={3}>Speed</th>
                <th className="pb-1 pr-2 text-center text-orange-400 print:text-orange-600" colSpan={3}>Launch</th>
                <th className="pb-1 pr-2 text-center text-yellow-400 print:text-yellow-600" colSpan={3}>Apex</th>
                <th className="pb-1 pr-2 text-center text-green-400 print:text-green-600" colSpan={3}>Curve</th>
                <th className="pb-1 pr-2 text-center text-blue-400 print:text-blue-600" colSpan={3}>Carry</th>
                <th className="pb-1 text-center text-purple-400 print:text-purple-600" colSpan={3}>Total</th>
              </tr>
              <tr className="text-left text-gray-500 border-b border-gray-700 print:text-gray-600 print:border-gray-300" style={{ fontSize: '0.6rem' }}>
                <th className="col-val pb-1 pr-1 text-blue-400">A</th>
                <th className="col-val pb-1 pr-1 text-orange-400">B</th>
                <th className="col-diff pb-1 pr-2">Diff</th>
                <th className="col-val pb-1 pr-1 text-blue-400">A</th>
                <th className="col-val pb-1 pr-1 text-orange-400">B</th>
                <th className="col-diff pb-1 pr-2">Diff</th>
                <th className="col-val pb-1 pr-1 text-blue-400">A</th>
                <th className="col-val pb-1 pr-1 text-orange-400">B</th>
                <th className="col-diff pb-1 pr-2">Diff</th>
                <th className="col-val pb-1 pr-1 text-blue-400">A</th>
                <th className="col-val pb-1 pr-1 text-orange-400">B</th>
                <th className="col-diff pb-1 pr-2">Diff</th>
                <th className="col-val pb-1 pr-1 text-blue-400">A</th>
                <th className="col-val pb-1 pr-1 text-orange-400">B</th>
                <th className="col-diff pb-1 pr-2">Diff</th>
                <th className="col-val pb-1 pr-1 text-blue-400">A</th>
                <th className="col-val pb-1 pr-1 text-orange-400">B</th>
                <th className="col-diff pb-1">Diff</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c, i) => {
                const onlyA = c.shotA && !c.shotB;
                const onlyB = !c.shotA && c.shotB;
                const rowIsOutlier = c.shotA && c.shotB && isRowOutlier(c);

                return (
                  <tr
                    key={i}
                    className={`border-b border-gray-700/50 print:border-gray-200
                      ${(onlyA || onlyB) ? 'opacity-50' : ''}
                      ${rowIsOutlier ? 'bg-yellow-900/30 print:bg-yellow-50' : ''}`}
                  >
                    <td className={`col-pos py-1 pr-2 font-semibold text-white print:text-black ${rowIsOutlier ? 'text-yellow-300 print:text-yellow-700' : ''}`}>
                      {rowIsOutlier && <span className="mr-0.5 text-yellow-400 print:text-yellow-600" title="Outlier">!</span>}
                      H{c.holeNumber}S{c.strokeNumber}
                    </td>
                    <td className="col-golfer py-1 pr-2 text-blue-300 print:text-blue-600 truncate" title={c.shotA?.golfer ?? ''}>
                      {c.shotA?.golfer ?? '-'}
                    </td>
                    <td className="col-golfer py-1 pr-2 text-orange-300 print:text-orange-600 truncate" title={c.shotB?.golfer ?? ''}>
                      {c.shotB?.golfer ?? '-'}
                    </td>
                    {/* Speed */}
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToBallSpeed ?? null)}</td>
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToBallSpeed ?? null)}</td>
                    <DiffCell value={c.diffs.timeToBallSpeed} outlier={isOutlier(c.diffs.timeToBallSpeed, avgAbsDiffs.timeToBallSpeed)} />
                    {/* Launch */}
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToLaunchAngle ?? null)}</td>
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToLaunchAngle ?? null)}</td>
                    <DiffCell value={c.diffs.timeToLaunchAngle} outlier={isOutlier(c.diffs.timeToLaunchAngle, avgAbsDiffs.timeToLaunchAngle)} />
                    {/* Apex */}
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToApex ?? null)}</td>
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToApex ?? null)}</td>
                    <DiffCell value={c.diffs.timeToApex} outlier={isOutlier(c.diffs.timeToApex, avgAbsDiffs.timeToApex)} />
                    {/* Curve */}
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToCurve ?? null)}</td>
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToCurve ?? null)}</td>
                    <DiffCell value={c.diffs.timeToCurve} outlier={isOutlier(c.diffs.timeToCurve, avgAbsDiffs.timeToCurve)} />
                    {/* Carry */}
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToCarry ?? null)}</td>
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToCarry ?? null)}</td>
                    <DiffCell value={c.diffs.timeToCarry} outlier={isOutlier(c.diffs.timeToCarry, avgAbsDiffs.timeToCarry)} />
                    {/* Total */}
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotA?.timeToTotal ?? null)}</td>
                    <td className="col-val py-1 pr-1 text-gray-400">{formatMs(c.shotB?.timeToTotal ?? null)}</td>
                    <DiffCell value={c.diffs.timeToTotal} outlier={isOutlier(c.diffs.timeToTotal, avgAbsDiffs.timeToTotal)} />
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
          <p className="text-xs text-gray-500 mb-2">Below 0 = faster in B (improved)</p>
          <div className="h-56 print:h-44">
            <Bar
              data={diffChart}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    title: { display: true, text: 'Seconds (B - A)', color: '#9CA3AF', font: { size: 9 } },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="print-section chart-container bg-gray-800 rounded-lg p-4 print:bg-white print:border print:border-gray-300">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400 print:text-black">
            Time to Total — {data.matchA.matchNumber} vs {data.matchB.matchNumber}
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
