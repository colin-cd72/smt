export interface ShotTimingData {
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
  // Time from start to each metric (cumulative)
  timeToBallSpeed: number | null;
  timeToLaunchAngle: number | null;
  timeToApex: number | null;
  timeToCurve: number | null;
  timeToCarry: number | null;
  timeToTotal: number | null;
  // Sequential deltas (time between each step)
  deltaSpeedToLaunch: number | null;
  deltaLaunchToApex: number | null;
  deltaApexToCurve: number | null;
  deltaCurveToCarry: number | null;
  deltaCarryToTotal: number | null;
}

export interface GolferStats {
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
  // Average sequential deltas
  avgDeltaSpeedToLaunch: number | null;
  avgDeltaLaunchToApex: number | null;
  avgDeltaApexToCurve: number | null;
  avgDeltaCurveToCarry: number | null;
  avgDeltaCarryToTotal: number | null;
}

export interface Match {
  id: number;
  match_number: string;
  description: string;
  created_at: string;
  shot_count: number;
}

export interface UploadResponse {
  success: boolean;
  matchNumber: string;
  totalRows: number;
  completedShots: number;
  golfers: string[];
  stats: GolferStats[];
}

export interface MatchResponse {
  match: {
    matchNumber: string;
    description: string;
    createdAt: string;
  };
  totalShots: number;
  golfers: string[];
  stats: GolferStats[];
}

export interface CompareMatchData {
  matchNumber: string;
  description: string;
  stats: GolferStats[];
}

export interface CompareResponse {
  matchA: CompareMatchData;
  matchB: CompareMatchData;
}

export interface TimingDiffs {
  avgTimeToBallSpeed: number | null;
  avgTimeToLaunchAngle: number | null;
  avgTimeToApex: number | null;
  avgTimeToCurve: number | null;
  avgTimeToCarry: number | null;
  avgTimeToTotal: number | null;
}

export interface GolferComparison {
  golfer: string;
  matchA: GolferStats | null;
  matchB: GolferStats | null;
  diffs: TimingDiffs;
}
