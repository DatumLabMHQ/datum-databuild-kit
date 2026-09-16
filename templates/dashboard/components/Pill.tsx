export type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info';
export function Pill({ tone = 'neutral', dot = false, children }: { tone?: Tone; dot?: boolean; children: React.ReactNode }) {
  return <span className={`pill ${tone === 'neutral' ? '' : tone}`}>{dot ? <span className="dot" /> : null}{children}</span>;
}
export const riskTone = (r: 'safe' | 'moderate' | 'high'): Tone => (r === 'safe' ? 'ok' : r === 'moderate' ? 'warn' : 'bad');
