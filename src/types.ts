export interface ShotData {
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

export interface GolferStats {
  golfer: string;
  shots: ShotData[];
  avgBallSpeed: number | null;
  avgLaunchAngle: number | null;
  avgApex: number | null;
  avgCarryDistance: number | null;
  avgTotalDistance: number | null;
  maxTotalDistance: number | null;
}

export interface UploadResponse {
  success: boolean;
  totalRows: number;
  golfers: string[];
  stats: GolferStats[];
}
