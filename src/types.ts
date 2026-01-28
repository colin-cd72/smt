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
  // Time deltas in milliseconds from first row
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
  // Average time deltas in seconds
  avgTimeToBallSpeed: number | null;
  avgTimeToLaunchAngle: number | null;
  avgTimeToApex: number | null;
  avgTimeToCurve: number | null;
  avgTimeToCarry: number | null;
  avgTimeToTotal: number | null;
}

export interface UploadResponse {
  success: boolean;
  totalRows: number;
  completedShots: number;
  golfers: string[];
  stats: GolferStats[];
}
