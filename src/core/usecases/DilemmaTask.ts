/**
 * DilemmaTask — moral dilemma decision paradigm.
 * Player chooses from options; latency and choice are tracked.
 */

export interface DilemmaOption {
  readonly id: string;
  readonly text: string;
  /** Moral orientation tag for scoring. */
  readonly orientation: 'mercy' | 'justice' | 'care' | 'autonomy';
}

export interface DilemmaTrial {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly DilemmaOption[];
}

export interface DilemmaResponse {
  readonly chosenId: string;
  readonly deliberationMs: number;
}

export interface DilemmaResult {
  readonly chosenOrientation: string;
  readonly deliberationMs: number;
  /** Longer deliberation suggests deeper moral reasoning. */
  readonly deliberationDepth: 'snap' | 'considered' | 'deep';
}

export function scoreDilemma(trial: DilemmaTrial, response: DilemmaResponse): DilemmaResult {
  const chosen = trial.options.find((o) => o.id === response.chosenId);
  const orientation = chosen?.orientation ?? 'autonomy';

  let depth: DilemmaResult['deliberationDepth'];
  if (response.deliberationMs < 2000) depth = 'snap';
  else if (response.deliberationMs < 6000) depth = 'considered';
  else depth = 'deep';

  return { chosenOrientation: orientation, deliberationMs: response.deliberationMs, deliberationDepth: depth };
}
