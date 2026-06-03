import type { PedalDef, FreqPoint } from '../types'
import { lpMag, hpMag, toDb, FREQS } from '../math'

// TS-9 Tube Screamer style
// Clipping stage: inverting amp with 4.7kΩ input R, 47nF input cap, 47pF feedback cap
// Drive pot (500kΩ) sets feedback R → gain and LP corner
// Tone: 20kΩ pot + 220nF cap → sweeping shelving EQ

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const drive = knobs.drive / 10   // 0–1
  const tone  = knobs.tone  / 10   // 0–1
  const level = knobs.level / 10   // 0–1

  // Input high-pass: 4.7kΩ × 47nF → fc ≈ 720 Hz
  const HP_FC = 720

  // Drive: Rf from 51 Ω to ~500 kΩ; feedback LP at 1/(2π Rf Cf)
  const Rf = 51 + drive * 499_949
  const LP_FC = 1 / (2 * Math.PI * Rf * 47e-12)

  // Gain from drive stage (clamped for visualisation purposes)
  const gainLin = Math.min(1 + drive * 100, 120)

  // Tone: blend LP (bass) ↔ HP (treble) — neutral at tone=0.5
  const lp_fc = 300 + (1 - tone) * 4000   // bass shelf moves with CW
  const hp_fc = 80  + tone        * 3000   // treble shelf moves with CW

  return freqs.map(f => {
    const hp_in    = hpMag(f, HP_FC)
    const lp_clip  = lpMag(f, LP_FC)
    const gain_sig = gainLin * hp_in * lp_clip

    const lp_t = lpMag(f, lp_fc)
    const hp_t = hpMag(f, hp_fc)
    const tone_resp = (1 - tone) * lp_t + tone * hp_t + 0.25

    const total = gain_sig * tone_resp * level
    return { freq: f, mag: toDb(total), phase: 0 }
  })
}

export const tubeScreamer: PedalDef = {
  id: 'ts9',
  name: 'Tube Screamer',
  pcbRef: 'Green Bean (PedalPCB)',
  category: 'overdrive',
  type: 'pedal',
  color: '#3a7d35',
  description: 'Warm mid-boosting overdrive. Drive focuses the midrange; Tone sweeps bass/treble balance.',
  knobs: [
    { id: 'drive', label: 'Drive',  min: 0, max: 10, default: 5, taper: 'audio' },
    { id: 'tone',  label: 'Tone',   min: 0, max: 10, default: 5 },
    { id: 'level', label: 'Level',  min: 0, max: 10, default: 7, taper: 'audio' },
  ],
  transferFn,
}

// Allow re-computing at any freq set
tubeScreamer.transferFn = transferFn
