import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Column definitions for the CSV
const COLUMNS = [
  'timestamp',
  'golfer',
  'holeNumber',
  'strokeNumber',
  'ballSpeed',
  'launchAngle',
  'apex',
  'curve',
  'carryDistance',
  'totalDistance'
];

interface ShotData {
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

interface GolferStats {
  golfer: string;
  shots: ShotData[];
  avgBallSpeed: number | null;
  avgLaunchAngle: number | null;
  avgApex: number | null;
  avgCarryDistance: number | null;
  avgTotalDistance: number | null;
  maxTotalDistance: number | null;
}

function parseCSV(csvContent: string): ShotData[] {
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

function getCompletedShots(shots: ShotData[]): ShotData[] {
  // Filter to only shots with complete data (totalDistance present)
  return shots.filter(shot => shot.totalDistance !== null);
}

function calculateGolferStats(shots: ShotData[]): GolferStats[] {
  const golferMap = new Map<string, ShotData[]>();

  // Group shots by golfer
  shots.forEach(shot => {
    if (!golferMap.has(shot.golfer)) {
      golferMap.set(shot.golfer, []);
    }
    golferMap.get(shot.golfer)!.push(shot);
  });

  // Calculate stats for each golfer
  const stats: GolferStats[] = [];
  golferMap.forEach((golferShots, golfer) => {
    const completedShots = getCompletedShots(golferShots);

    const avg = (arr: (number | null)[]): number | null => {
      const valid = arr.filter((v): v is number => v !== null);
      return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    };

    const max = (arr: (number | null)[]): number | null => {
      const valid = arr.filter((v): v is number => v !== null);
      return valid.length > 0 ? Math.max(...valid) : null;
    };

    stats.push({
      golfer,
      shots: completedShots,
      avgBallSpeed: avg(completedShots.map(s => s.ballSpeed)),
      avgLaunchAngle: avg(completedShots.map(s => s.launchAngle)),
      avgApex: avg(completedShots.map(s => s.apex)),
      avgCarryDistance: avg(completedShots.map(s => s.carryDistance)),
      avgTotalDistance: avg(completedShots.map(s => s.totalDistance)),
      maxTotalDistance: max(completedShots.map(s => s.totalDistance))
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
    const shots = parseCSV(csvContent);
    const golferStats = calculateGolferStats(shots);

    res.json({
      success: true,
      totalRows: shots.length,
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
