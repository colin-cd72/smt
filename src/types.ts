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
  timeToBallSpeed: number | null;
  timeToLaunchAngle: number | null;
  timeToApex: number | null;
  timeToCurve: number | null;
  timeToCarry: number | null;
  timeToTotal: number | null;
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
