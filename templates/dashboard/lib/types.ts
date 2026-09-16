// The normalised shapes every page reads. lib/data.ts fills them from the platform (or from
// lib/sample.ts when no key is set), so pages never depend on a resource's raw column names.
export type Point = { day: string; [k: string]: number | string };
export type Share = { name: string; value: number; color?: string };
export type Market = {
  id: string; protocol: string; chain: string; collateral: string; loan: string;
  supplied: number; borrowed: number; utilization: number; supply_apy: number; borrow_apy: number; lltv: number;
  risk: 'safe' | 'moderate' | 'high';
};
export type Overview = {
  asOf: string; sample: boolean;
  kpis: { supplied: number; borrowed: number; suppliedChange7d: number; borrowedChange7d: number; markets: number; utilization: number; supplyApy: number };
  history: Point[]; rates: Point[]; byChain: Share[]; byProtocol: Share[]; markets: Market[];
  reconciliation: { ours: number; theirs: number; theirsSource: string; note: string } | null;
};
