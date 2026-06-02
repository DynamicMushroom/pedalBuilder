import { PedalDef, FreqPoint } from '../types'
import { lpMag, hpMag, notchMag, toDb } from '../math'

// EHX Big Muff Pi — two clipping stages + classic V-shaped tone stack
// Tone stack: 100kΩ pot with 100nF (bass side) and 4.7nF (treble side)
// Creates a notorious mid-scoop: even at neutral the mids are dipped

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const sustain = knobs.sustain / 10  // 0–1
  const tone    = knobs.tone    / 10  // 0–1
  const volume  = knobs.volume  / 10  // 0–1

  // Two clipping stages, each band-limited
  // Stage hp: ~100 Hz (10µF input cap into 15kΩ)
  // Stage lp: ~5 kHz (39pF feedback)
  const STAGE_HP = 100
  const STAGE_LP = 5000 + sustain * 3000  // slightly more treble at higher sustain

  const gain = 1 + sustain * 150  // ~0 to 150× per stage, cascaded

  // Tone stack: LP (bass cap 100nF) vs HP (treble cap 4.7nF)
  // At tone=0: LP dominates → fc ≈ 1/(2π × 50kΩ × 100nF) ≈ 32 Hz ... too low, pot is log
  // Practical sweep: 200 Hz (full bass) to 5 kHz (full treble)
  const bass_fc   = 200  + (1 - tone) * 1500
  const treble_fc = 800  + tone       * 4200

  // Signature mid-scoop: notch at ~700–900 Hz, always present
  const NOTCH_FC = 750
  const NOTCH_Q  = 1.5
  const notch_depth = 0.35 + tone * 0.25  // deeper notch at more treble

  return freqs.map(f => {
    const hp_stage = hpMag(f, STAGE_HP)
    const lp_stage = lpMag(f, STAGE_LP)
    const clip_gain = gain * hp_stage * lp_stage

    // Tone blend: (1-tone)→LP side, tone→HP side
    const lp_t = lpMag(f, bass_fc)
    const hp_t = hpMag(f, treble_fc)
    const tone_blend = (1 - tone) * lp_t + tone * hp_t + 0.15

    // Apply the mid notch
    const notch = 1 - notch_depth * (1 - notchMag(f, NOTCH_FC, NOTCH_Q))

    const total = clip_gain * tone_blend * notch * volume
    return { freq: f, mag: toDb(total), phase: 0 }
  })
}

export const bigMuff: PedalDef = {
  id: 'bigmuff',
  name: 'Big Muff Pi',
  pcbRef: 'Musket Fuzz (PedalPCB)',
  category: 'fuzz',
  color: '#7b3a1e',
  description: 'Thick sustaining fuzz with a scooped mid tone stack. Sustain controls gain; Tone sweeps bass/treble.',
  knobs: [
    { id: 'sustain', label: 'Sustain', min: 0, max: 10, default: 6, taper: 'audio' },
    { id: 'tone',    label: 'Tone',    min: 0, max: 10, default: 5 },
    { id: 'volume',  label: 'Volume',  min: 0, max: 10, default: 7, taper: 'audio' },
  ],
  transferFn,
}
