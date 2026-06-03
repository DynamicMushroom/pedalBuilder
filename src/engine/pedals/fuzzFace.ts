import type { PedalDef, FreqPoint } from '../types'
import { lpMag, hpMag, toDb } from '../math'

// Germanium Fuzz Face (Dallas Arbiter style)
// Two PNP germanium transistors (NKT275 style)
// Strong bass roll-off, warm LP character, very input-impedance dependent
// Fuzz: controls gain via bias point — also shifts tone character

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const fuzz   = knobs.fuzz   / 10  // 0–1
  const volume = knobs.volume / 10  // 0–1

  // Base input HP: 2.2µF × 33kΩ → very low fc, effectively DC-blocked
  // The real coloration is from transistor input impedance
  const INPUT_HP = 40   // hz — the vintage low end roll

  // Stage 1 LP: 68pF base-collector cap
  // At low fuzz → transistor less saturated → wider BW
  // At high fuzz → saturated, compresses highs
  const LP1 = 12000 - fuzz * 5000   // 12kHz down to 7kHz

  // Stage 2 (output transistor) LP: adds more roll
  const LP2 = 8000 - fuzz * 3000    // 8kHz down to 5kHz

  // Inter-stage: small cap (4.7µF) creates a HP that shifts with fuzz
  const INTER_HP = 50 + fuzz * 150   // 50–200 Hz

  // Gain characteristic: roughly 0 to ~100× (but clipping hard above 0.3)
  const gain = 1 + fuzz * 80

  return freqs.map(f => {
    const hp1 = hpMag(f, INPUT_HP)
    const lp1 = lpMag(f, LP1)
    const hp2 = hpMag(f, INTER_HP)
    const lp2 = lpMag(f, LP2)

    const sig = gain * hp1 * lp1 * hp2 * lp2

    const total = sig * volume
    return { freq: f, mag: toDb(total), phase: 0 }
  })
}

export const fuzzFace: PedalDef = {
  id: 'fuzzface',
  name: 'Fuzz Face',
  pcbRef: 'Hairball (PedalPCB)',
  category: 'fuzz',
  type: 'pedal',
  color: '#c0392b',
  description: 'Germanium two-transistor fuzz. Vintage warmth with heavy saturation. Fuzz controls bias and gain.',
  knobs: [
    { id: 'fuzz',   label: 'Fuzz',   min: 0, max: 10, default: 7, taper: 'audio' },
    { id: 'volume', label: 'Volume', min: 0, max: 10, default: 8, taper: 'audio' },
  ],
  transferFn,
}
