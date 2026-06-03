# Contributing

Contributions are welcome — bug fixes, new circuit modules, improved transfer functions, and documentation improvements.

## Getting started

1. Fork the repository and create a feature branch from `main`
2. `npm install` then `npm run dev` to start the dev server
3. Make your changes and test them in the browser
4. Submit a pull request with a clear description of what changed and why

## Adding a new pedal or synth module

Create a file in `src/engine/pedals/` or `src/engine/synths/` following this pattern:

```ts
import { PedalDef } from '../types'
import { lpMag, hpMag, toDb } from '../math'

function transferFn(knobs: Record<string, number>, freqs: number[]) {
  const gain = knobs.gain / 10  // normalize to 0–1
  return freqs.map(f => ({
    freq: f,
    mag: toDb(gain * lpMag(f, 3000)),
    phase: 0,
  }))
}

export const myCircuit: PedalDef = {
  id: 'unique-id',
  name: 'Circuit Name',
  pcbRef: 'Board or hardware reference',
  category: 'overdrive',   // or 'vcf', 'distortion', etc.
  type: 'pedal',            // or 'synth'
  color: '#4a90d9',
  description: 'One sentence describing the tonal character.',
  knobs: [
    { id: 'gain', label: 'Gain', min: 0, max: 10, default: 5, taper: 'audio' },
  ],
  transferFn,
}
```

Then add it to the appropriate registry in `src/engine/registry.ts` — the UI picks it up automatically.

### Transfer function guidelines

- Derive corner frequencies from actual component values where possible: `fc = 1 / (2π × R × C)`
- Use `lpMag` / `hpMag` for first-order stages, `lp2Mag` / `hp2Mag` / `bpMag` for resonant second-order stages
- Knob values arrive on a 0–10 scale; map to physical ranges inside the function
- Return one `FreqPoint` per input frequency; `phase` may be `0` for linear approximations
- This is small-signal linear analysis — nonlinear clipping appears as gain, not harmonic distortion

## Code style

- TypeScript strict mode; no `any`
- No comments unless the reasoning is non-obvious (hidden constraint, component-value derivation, workaround)
- Keep transfer functions self-contained with no side effects
- Follow the existing file structure and naming conventions

## Commit messages

Short imperative summary (`add Rat distortion module`, `fix Moog resonance peak scaling`). No body needed for small changes.
