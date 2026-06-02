import { PedalDef, FreqPoint } from '../types'
import { lpMag, hpMag, notchMag, toDb } from '../math'

// Marshall Shredmaster — classic 90s UK high-gain pedal
// Three gain stages, active bass/treble/contour controls
// Bass: shelving boost/cut at ~200 Hz
// Treble: shelving at ~3.5 kHz
// Contour: parametric mid cut/boost (the "Marshall snarl")

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const gain     = knobs.gain     / 10  // 0–1
  const bass     = knobs.bass     / 10  // 0–1  (0.5 = flat)
  const treble   = knobs.treble   / 10  // 0–1
  const contour  = knobs.contour  / 10  // 0–1  (0 = scoop, 1 = boost)
  const volume   = knobs.volume   / 10  // 0–1

  const INPUT_HP = 80   // Hz — stage 1 input cap
  const GAIN_LIN = 1 + gain * 200  // up to 200×

  // LP from cascade of stages (each ~8kHz, two cascaded)
  const LP_STAGE = 7000 - gain * 2000   // slightly compresses highs at max gain

  // Bass: LP shelf at 200 Hz, ±15 dB range
  // bass=0.5 → flat; bass<0.5 → cut; bass>0.5 → boost
  const bass_dB = (bass - 0.5) * 30   // -15 to +15 dB
  const BASS_FC = 200

  // Treble: HP shelf at 3.5 kHz
  const treble_dB = (treble - 0.5) * 24  // -12 to +12 dB
  const TREBLE_FC = 3500

  // Contour (mid): parametric cut at ~700 Hz (classic Marshall mid scoop)
  // contour=0: -12dB at 700Hz (full scoop)
  // contour=1: +8dB at 700Hz (mid boost)
  const MID_FC = 700
  const MID_Q  = 1.2
  const contour_dB = -12 + contour * 20  // -12 to +8 dB

  return freqs.map(f => {
    const hp_in = hpMag(f, INPUT_HP)
    const lp_g  = lpMag(f, LP_STAGE)
    const base  = GAIN_LIN * hp_in * lp_g

    // Bass shelf (first-order approximation)
    const bass_lp = lpMag(f, BASS_FC)
    const bass_hp = hpMag(f, BASS_FC)
    const bass_boost = Math.pow(10, bass_dB / 20)
    const bass_resp = bass_lp * bass_boost + bass_hp  // shelving

    // Treble shelf
    const treb_hp = hpMag(f, TREBLE_FC)
    const treb_lp = lpMag(f, TREBLE_FC)
    const treble_boost = Math.pow(10, treble_dB / 20)
    const treble_resp = treb_hp * treble_boost + treb_lp

    // Mid parametric
    const mid_notch = notchMag(f, MID_FC, MID_Q)
    const mid_boost = Math.pow(10, Math.abs(contour_dB) / 20)
    const mid_resp = contour_dB < 0
      ? mid_notch * mid_boost  // scoop
      : 1 + (1 - mid_notch) * mid_boost  // boost

    const total = base * bass_resp * treble_resp * mid_resp * volume
    return { freq: f, mag: toDb(total), phase: 0 }
  })
}

export const shredmaster: PedalDef = {
  id: 'shredmaster',
  name: 'Shredmaster',
  pcbRef: 'Harbinger One (PedalPCB)',
  category: 'distortion',
  color: '#1a3a6e',
  description: 'Marshall-voiced high-gain distortion with active 3-band EQ. Contour shapes the signature mid response.',
  knobs: [
    { id: 'gain',    label: 'Gain',    min: 0, max: 10, default: 6, taper: 'audio' },
    { id: 'bass',    label: 'Bass',    min: 0, max: 10, default: 5 },
    { id: 'treble',  label: 'Treble',  min: 0, max: 10, default: 5 },
    { id: 'contour', label: 'Contour', min: 0, max: 10, default: 3 },
    { id: 'volume',  label: 'Volume',  min: 0, max: 10, default: 7, taper: 'audio' },
  ],
  transferFn,
}
