import { PedalDef, FreqPoint } from '../types'
import { lpMag, hpMag, toDb } from '../math'

// Boss DS-1 Distortion
// Hard-clipping asymmetric diodes (1 silicon + 1 LED)
// Tone: second-order RC filter sweeping from bassy to bright
// Distortion: controls gain, also shifts LP corner slightly

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const dist  = knobs.dist  / 10  // 0–1
  const tone  = knobs.tone  / 10  // 0–1
  const level = knobs.level / 10  // 0–1

  // Input HP: 22nF × 10kΩ → fc ≈ 723 Hz
  const INPUT_HP = 723

  // Distortion stage: gain 10 to ~10000, LP corner drops with more dist
  const gain = 10 + dist * 9990
  const LP_DIST = 8000 - dist * 4000  // higher dist → more bandwidth limiting

  // Tone control: DS-1 uses an RC low-pass/high-pass blend
  // tone=0: all LP (woolly/dark) fc ≈ 800 Hz
  // tone=1: all HP (bright/harsh) fc ≈ 6 kHz
  const tone_lp_fc = 300  + (1 - tone) * 5000
  const tone_hp_fc = 500  + tone       * 5500

  return freqs.map(f => {
    const hp_in    = hpMag(f, INPUT_HP)
    const lp_dist  = lpMag(f, LP_DIST)
    const gain_sig = gain * hp_in * lp_dist

    // Tone is primarily a shelving filter
    const t_lp = lpMag(f, tone_lp_fc)
    const t_hp = hpMag(f, tone_hp_fc)
    const tone_resp = (1 - tone) * t_lp * 0.9 + tone * t_hp * 0.9 + 0.1

    const total = gain_sig * tone_resp * level
    return { freq: f, mag: toDb(total), phase: 0 }
  })
}

export const ds1: PedalDef = {
  id: 'ds1',
  name: 'DS-1 Distortion',
  pcbRef: 'Zapper (PedalPCB)',
  category: 'distortion',
  color: '#e07020',
  description: 'Aggressive hard-clipping distortion. Distortion controls gain; Tone sweeps brightness.',
  knobs: [
    { id: 'dist',  label: 'Dist',  min: 0, max: 10, default: 5, taper: 'audio' },
    { id: 'tone',  label: 'Tone',  min: 0, max: 10, default: 5 },
    { id: 'level', label: 'Level', min: 0, max: 10, default: 7, taper: 'audio' },
  ],
  transferFn,
}
