import type { PedalDef, FreqPoint } from '../types'
import { lpMag, hpMag, toDb } from '../math'

// Klon Centaur — "transparent" overdrive with internal clean/dirt blend
// The key feature: clean signal mixes with the clipped signal
// Treble boost network on the input; Gain sets clip level; Treble roll-off

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const gain    = knobs.gain    / 10  // 0–1
  const treble  = knobs.treble  / 10  // 0–1
  const output  = knobs.output  / 10  // 0–1

  // Clean path: high-pass at ~100 Hz, essentially flat
  const CLEAN_HP = 100

  // Dirty path: band-pass character
  // Input treble boost: HP at ~600 Hz (the famous "presence" enhancement)
  const DIRT_HP = 600
  // LP at ~3 kHz (48pF cap in feedback)
  const DIRT_LP = 3000 + gain * 4000  // extends slightly at higher gain

  const dirt_gain = 1 + gain * 80  // 1× to 81×

  // Internal blend: at gain=0 almost all clean; at gain=1 more dirt
  const blend = 0.1 + gain * 0.8   // clean fraction is (1-blend)

  // Treble control: shelving LP, rolls off high end
  // treble=1 → flat; treble=0 → LP at ~2kHz
  const treble_lp_fc = 600 + treble * 15000

  return freqs.map(f => {
    // Clean path contribution
    const clean = hpMag(f, CLEAN_HP) * (1 - blend)

    // Dirty path contribution
    const hp_d = hpMag(f, DIRT_HP)
    const lp_d = lpMag(f, DIRT_LP)
    const dirt  = dirt_gain * hp_d * lp_d * blend

    // Mix
    const mixed = clean + dirt

    // Output treble roll
    const treble_resp = lpMag(f, treble_lp_fc)

    const total = mixed * treble_resp * output
    return { freq: f, mag: toDb(total), phase: 0 }
  })
}

export const klon: PedalDef = {
  id: 'klon',
  name: 'Klon Centaur',
  pcbRef: 'Castledine (PedalPCB)',
  category: 'overdrive',
  type: 'pedal',
  color: '#c8a020',
  description: 'Transparent overdrive blending clean and clipped signals. Gain sweeps from clean boost to full drive.',
  knobs: [
    { id: 'gain',   label: 'Gain',   min: 0, max: 10, default: 4, taper: 'audio' },
    { id: 'treble', label: 'Treble', min: 0, max: 10, default: 7 },
    { id: 'output', label: 'Output', min: 0, max: 10, default: 7, taper: 'audio' },
  ],
  transferFn,
}
