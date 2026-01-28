import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3999;

app.use(express.json());

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

interface RawRow {
  timestamp: string;
  golfer: string;
  holeNumber: number;
  strokeNumber: number;
  ballSpeed: number | null;
  launchAngle: number | null;
  apex: number | null;
  curve: number | null;
  carryDistance: number | null;
  totalDistance: number | null;
}

interface ShotTimingData {
  golfer: string;
  holeNumber: number;
  strokeNumber: number;
  firstTimestamp: string;
  ballSpeed: number | null;
  launchAngle: number | null;
  apex: number | null;
  curve: number | null;
  carryDistance: number | null;
  totalDistance: number | null;
  // Time deltas in milliseconds from first row
  timeToBallSpeed: number | null;
  timeToLaunchAngle: number | null;
  timeToApex: number | null;
  timeToCurve: number | null;
  timeToCarry: number | null;
  timeToTotal: number | null;
}

interface GolferStats {
  golfer: string;
  shots: ShotTimingData[];
  avgBallSpeed: number | null;
  avgLaunchAngle: number | null;
  avgApex: number | null;
  avgCarryDistance: number | null;
  avgTotalDistance: number | null;
  maxTotalDistance: number | null;
  // Average time deltas in seconds
  avgTimeToBallSpeed: number | null;
  avgTimeToLaunchAngle: number | null;
  avgTimeToApex: number | null;
  avgTimeToCurve: number | null;
  avgTimeToCarry: number | null;
  avgTimeToTotal: number | null;
}

function parseTimestamp(ts: string): number {
  // Format: HH:MM:SS.mmm
  const parts = ts.split(':');
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const secParts = parts[2].split('.');
  const seconds = parseInt(secParts[0]) || 0;
  const millis = parseInt(secParts[1]) || 0;
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + millis;
}

function parseCSV(csvContent: string): RawRow[] {
  const result = Papa.parse(csvContent, {
    header: false,
    skipEmptyLines: true
  });

  return result.data.map((row: unknown) => {
    const r = row as string[];
    return {
      timestamp: r[0] || '',
      golfer: r[1] || '',
      holeNumber: parseInt(r[2]) || 0,
      strokeNumber: parseInt(r[3]) || 0,
      ballSpeed: r[4] ? parseFloat(r[4]) : null,
      launchAngle: r[5] ? parseFloat(r[5]) : null,
      apex: r[6] ? parseFloat(r[6]) : null,
      curve: r[7] ? parseFloat(r[7]) : null,
      carryDistance: r[8] ? parseFloat(r[8]) : null,
      totalDistance: r[9] ? parseFloat(r[9]) : null
    };
  });
}

function processShotTiming(rows: RawRow[]): ShotTimingData[] {
  // Group rows by unique shot (golfer + hole + stroke)
  const shotMap = new Map<string, RawRow[]>();

  rows.forEach(row => {
    const key = `${row.golfer}|${row.holeNumber}|${row.strokeNumber}`;
    if (!shotMap.has(key)) {
      shotMap.set(key, []);
    }
    shotMap.get(key)!.push(row);
  });

  const shots: ShotTimingData[] = [];

  shotMap.forEach((shotRows) => {
    // Sort by timestamp
    shotRows.sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));

    const firstRow = shotRows[0];
    const firstTime = parseTimestamp(firstRow.timestamp);

    // Track when each field first appears
    let timeToBallSpeed: number | null = null;
    let timeToLaunchAngle: number | null = null;
    let timeToApex: number | null = null;
    let timeToCurve: number | null = null;
    let timeToCarry: number | null = null;
    let timeToTotal: number | null = null;

    // Final values
    let finalBallSpeed: number | null = null;
    let finalLaunchAngle: number | null = null;
    let finalApex: number | null = null;
    let finalCurve: number | null = null;
    let finalCarry: number | null = null;
    let finalTotal: number | null = null;

    shotRows.forEach(row => {
      const rowTime = parseTimestamp(row.timestamp);
      const delta = rowTime - firstTime;

      if (row.ballSpeed !== null && timeToBallSpeed === null) {
        timeToBallSpeed = delta;
        finalBallSpeed = row.ballSpeed;
      }
      if (row.launchAngle !== null && timeToLaunchAngle === null) {
        timeToLaunchAngle = delta;
        finalLaunchAngle = row.launchAngle;
      }
      if (row.apex !== null && timeToApex === null) {
        timeToApex = delta;
        finalApex = row.apex;
      }
      if (row.curve !== null && timeToCurve === null) {
        timeToCurve = delta;
        finalCurve = row.curve;
      }
      if (row.carryDistance !== null && timeToCarry === null) {
        timeToCarry = delta;
        finalCarry = row.carryDistance;
      }
      if (row.totalDistance !== null && timeToTotal === null) {
        timeToTotal = delta;
        finalTotal = row.totalDistance;
      }

      // Update final values (in case they change)
      if (row.ballSpeed !== null) finalBallSpeed = row.ballSpeed;
      if (row.launchAngle !== null) finalLaunchAngle = row.launchAngle;
      if (row.apex !== null) finalApex = row.apex;
      if (row.curve !== null) finalCurve = row.curve;
      if (row.carryDistance !== null) finalCarry = row.carryDistance;
      if (row.totalDistance !== null) finalTotal = row.totalDistance;
    });

    // Only include shots that have at least total distance (completed shots)
    if (finalTotal !== null) {
      shots.push({
        golfer: firstRow.golfer,
        holeNumber: firstRow.holeNumber,
        strokeNumber: firstRow.strokeNumber,
        firstTimestamp: firstRow.timestamp,
        ballSpeed: finalBallSpeed,
        launchAngle: finalLaunchAngle,
        apex: finalApex,
        curve: finalCurve,
        carryDistance: finalCarry,
        totalDistance: finalTotal,
        timeToBallSpeed,
        timeToLaunchAngle,
        timeToApex,
        timeToCurve,
        timeToCarry,
        timeToTotal
      });
    }
  });

  return shots;
}

function calculateGolferStats(shots: ShotTimingData[]): GolferStats[] {
  const golferMap = new Map<string, ShotTimingData[]>();

  shots.forEach(shot => {
    if (!golferMap.has(shot.golfer)) {
      golferMap.set(shot.golfer, []);
    }
    golferMap.get(shot.golfer)!.push(shot);
  });

  const stats: GolferStats[] = [];

  const avg = (arr: (number | null)[]): number | null => {
    const valid = arr.filter((v): v is number => v !== null);
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };

  const max = (arr: (number | null)[]): number | null => {
    const valid = arr.filter((v): v is number => v !== null);
    return valid.length > 0 ? Math.max(...valid) : null;
  };

  // Convert ms to seconds for averages
  const avgToSeconds = (val: number | null): number | null => {
    return val !== null ? val / 1000 : null;
  };

  golferMap.forEach((golferShots, golfer) => {
    stats.push({
      golfer,
      shots: golferShots,
      avgBallSpeed: avg(golferShots.map(s => s.ballSpeed)),
      avgLaunchAngle: avg(golferShots.map(s => s.launchAngle)),
      avgApex: avg(golferShots.map(s => s.apex)),
      avgCarryDistance: avg(golferShots.map(s => s.carryDistance)),
      avgTotalDistance: avg(golferShots.map(s => s.totalDistance)),
      maxTotalDistance: max(golferShots.map(s => s.totalDistance)),
      avgTimeToBallSpeed: avgToSeconds(avg(golferShots.map(s => s.timeToBallSpeed))),
      avgTimeToLaunchAngle: avgToSeconds(avg(golferShots.map(s => s.timeToLaunchAngle))),
      avgTimeToApex: avgToSeconds(avg(golferShots.map(s => s.timeToApex))),
      avgTimeToCurve: avgToSeconds(avg(golferShots.map(s => s.timeToCurve))),
      avgTimeToCarry: avgToSeconds(avg(golferShots.map(s => s.timeToCarry))),
      avgTimeToTotal: avgToSeconds(avg(golferShots.map(s => s.timeToTotal)))
    });
  });

  return stats.sort((a, b) => a.golfer.localeCompare(b.golfer));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Upload and parse CSV
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const rawRows = parseCSV(csvContent);
    const shots = processShotTiming(rawRows);
    const golferStats = calculateGolferStats(shots);

    res.json({
      success: true,
      totalRows: rawRows.length,
      completedShots: shots.length,
      golfers: golferStats.map(g => g.golfer),
      stats: golferStats
    });
  } catch (error) {
    console.error('Error parsing CSV:', error);
    res.status(500).json({ error: 'Failed to parse CSV' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
