import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3999;

app.use(express.json());

// Database setup
const dbPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../data/smt.db')
  : path.join(__dirname, '../smt.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_number TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    golfer TEXT NOT NULL,
    hole_number INTEGER NOT NULL,
    stroke_number INTEGER NOT NULL,
    first_timestamp TEXT,
    ball_speed REAL,
    launch_angle REAL,
    apex REAL,
    curve REAL,
    carry_distance REAL,
    total_distance REAL,
    time_to_ball_speed INTEGER,
    time_to_launch_angle INTEGER,
    time_to_apex INTEGER,
    time_to_curve INTEGER,
    time_to_carry INTEGER,
    time_to_total INTEGER,
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );

  CREATE INDEX IF NOT EXISTS idx_shots_match ON shots(match_id);
  CREATE INDEX IF NOT EXISTS idx_shots_golfer ON shots(golfer);
`);

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
  avgTimeToBallSpeed: number | null;
  avgTimeToLaunchAngle: number | null;
  avgTimeToApex: number | null;
  avgTimeToCurve: number | null;
  avgTimeToCarry: number | null;
  avgTimeToTotal: number | null;
}

function parseTimestamp(ts: string): number {
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
    shotRows.sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));

    const firstRow = shotRows[0];
    const firstTime = parseTimestamp(firstRow.timestamp);

    let timeToBallSpeed: number | null = null;
    let timeToLaunchAngle: number | null = null;
    let timeToApex: number | null = null;
    let timeToCurve: number | null = null;
    let timeToCarry: number | null = null;
    let timeToTotal: number | null = null;

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

      if (row.ballSpeed !== null) finalBallSpeed = row.ballSpeed;
      if (row.launchAngle !== null) finalLaunchAngle = row.launchAngle;
      if (row.apex !== null) finalApex = row.apex;
      if (row.curve !== null) finalCurve = row.curve;
      if (row.carryDistance !== null) finalCarry = row.carryDistance;
      if (row.totalDistance !== null) finalTotal = row.totalDistance;
    });

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

// Get all matches
app.get('/api/matches', (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT m.*, COUNT(s.id) as shot_count
      FROM matches m
      LEFT JOIN shots s ON s.match_id = m.id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `).all();
    res.json({ matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get a specific match with stats
app.get('/api/matches/:matchNumber', (req, res) => {
  try {
    const { matchNumber } = req.params;

    const match = db.prepare('SELECT * FROM matches WHERE match_number = ?').get(matchNumber) as any;
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const shotsRows = db.prepare('SELECT * FROM shots WHERE match_id = ?').all(match.id) as any[];

    const shots: ShotTimingData[] = shotsRows.map(row => ({
      golfer: row.golfer,
      holeNumber: row.hole_number,
      strokeNumber: row.stroke_number,
      firstTimestamp: row.first_timestamp,
      ballSpeed: row.ball_speed,
      launchAngle: row.launch_angle,
      apex: row.apex,
      curve: row.curve,
      carryDistance: row.carry_distance,
      totalDistance: row.total_distance,
      timeToBallSpeed: row.time_to_ball_speed,
      timeToLaunchAngle: row.time_to_launch_angle,
      timeToApex: row.time_to_apex,
      timeToCurve: row.time_to_curve,
      timeToCarry: row.time_to_carry,
      timeToTotal: row.time_to_total
    }));

    const golferStats = calculateGolferStats(shots);

    res.json({
      match: {
        matchNumber: match.match_number,
        description: match.description,
        createdAt: match.created_at
      },
      totalShots: shots.length,
      golfers: golferStats.map(g => g.golfer),
      stats: golferStats
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// Upload and save to match
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const matchNumber = req.body.matchNumber;
    const description = req.body.description || '';

    if (!matchNumber) {
      return res.status(400).json({ error: 'Match number is required' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const rawRows = parseCSV(csvContent);
    const shots = processShotTiming(rawRows);

    // Create or get match
    let match = db.prepare('SELECT * FROM matches WHERE match_number = ?').get(matchNumber) as any;

    if (!match) {
      const result = db.prepare('INSERT INTO matches (match_number, description) VALUES (?, ?)').run(matchNumber, description);
      match = { id: result.lastInsertRowid, match_number: matchNumber };
    }

    // Delete existing shots for this match (replace mode)
    db.prepare('DELETE FROM shots WHERE match_id = ?').run(match.id);

    // Insert new shots
    const insertShot = db.prepare(`
      INSERT INTO shots (
        match_id, golfer, hole_number, stroke_number, first_timestamp,
        ball_speed, launch_angle, apex, curve, carry_distance, total_distance,
        time_to_ball_speed, time_to_launch_angle, time_to_apex,
        time_to_curve, time_to_carry, time_to_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((shots: ShotTimingData[]) => {
      for (const shot of shots) {
        insertShot.run(
          match.id,
          shot.golfer,
          shot.holeNumber,
          shot.strokeNumber,
          shot.firstTimestamp,
          shot.ballSpeed,
          shot.launchAngle,
          shot.apex,
          shot.curve,
          shot.carryDistance,
          shot.totalDistance,
          shot.timeToBallSpeed,
          shot.timeToLaunchAngle,
          shot.timeToApex,
          shot.timeToCurve,
          shot.timeToCarry,
          shot.timeToTotal
        );
      }
    });

    insertMany(shots);

    const golferStats = calculateGolferStats(shots);

    res.json({
      success: true,
      matchNumber,
      totalRows: rawRows.length,
      completedShots: shots.length,
      golfers: golferStats.map(g => g.golfer),
      stats: golferStats
    });
  } catch (error) {
    console.error('Error uploading:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Delete a match
app.delete('/api/matches/:matchNumber', (req, res) => {
  try {
    const { matchNumber } = req.params;

    const match = db.prepare('SELECT * FROM matches WHERE match_number = ?').get(matchNumber) as any;
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    db.prepare('DELETE FROM shots WHERE match_id = ?').run(match.id);
    db.prepare('DELETE FROM matches WHERE id = ?').run(match.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
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
