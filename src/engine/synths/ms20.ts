import type { PedalDef, FreqPoint } from '../types'
import { lp2Mag, hp2Mag, toDb } from '../math'

// Korg MS-20 dual-section filter (Sallen-Key topology)
// HP section (12dB/oct) feeds LP section (12dB/oct) — independent cutoffs
// Overlapping cutoffs create band-pass character; Peak drives resonance on both sections

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const hpCutoff = knobs.hpCutoff / 10
  const lpCutoff = knobs.lpCutoff / 10
  const peak     = knobs.peak     / 10
  const volume   = knobs.volume   / 10

  const fcHP = 20  * Math.pow(400, hpCutoff)   // 20 Hz → 8 kHz
  const fcLP = 100 * Math.pow(180, lpCutoff)   // 100 Hz → 18 kHz
  const Q    = 0.5 + peak * 14.5

  return freqs.map(f => {
    const hp = hp2Mag(f, fcHP, Q)
    const lp = lp2Mag(f, fcLP, Q)
    return { freq: f, mag: toDb(hp * lp * volume), phase: 0 }
  })
}

export const ms20: PedalDef = {
  id: 'ms20',
  name: 'Korg MS-20 VCF',
  pcbRef: 'Korg MS-20 (MS-01 filter board)',
  category: 'vcf',
  type: 'synth',
  color: '#2d4a2d',
  description: 'Sallen-Key HP → LP in series. Independent cutoffs create band-pass and notch-like characters. Peak adds resonance to both sections.',
  knobs: [
    { id: 'hpCutoff', label: 'HP Cut', min: 0, max: 10, default: 2, taper: 'audio' },
    { id: 'lpCutoff', label: 'LP Cut', min: 0, max: 10, default: 7, taper: 'audio' },
    { id: 'peak',     label: 'Peak',   min: 0, max: 10, default: 3 },
    { id: 'volume',   label: 'Volume', min: 0, max: 10, default: 8, taper: 'audio' },
  ],
  transferFn,
}
