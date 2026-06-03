import type { PedalDef, FreqPoint } from '../types'
import { lpMag, bpMag, toDb } from '../math'

// Moog 904A / Model D transistor ladder — 4-pole (24dB/oct) LP
// Cutoff: log sweep 20 Hz → 16 kHz
// Resonance drives feedback toward self-oscillation; Q 0.5 → 25 at max

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const cutoff    = knobs.cutoff    / 10
  const resonance = knobs.resonance / 10
  const volume    = knobs.volume    / 10

  const fc = 20 * Math.pow(800, cutoff)     // 20 Hz → 16 kHz
  const Q  = 0.5 + resonance * 24.5

  return freqs.map(f => {
    const lp4  = Math.pow(lpMag(f, fc), 4)
    const peak = resonance * bpMag(f, fc, Q) * 4
    return { freq: f, mag: toDb(Math.min(lp4 + peak, 5) * volume), phase: 0 }
  })
}

export const moogLadder: PedalDef = {
  id: 'moog904a',
  name: 'Moog 904A VCF',
  pcbRef: 'Moog Music 904A',
  category: 'vcf',
  type: 'synth',
  color: '#8b5e3c',
  description: 'Transistor ladder — 4-pole LP at 24dB/oct. Classic Moog warmth; Resonance approaches self-oscillation at maximum.',
  knobs: [
    { id: 'cutoff',    label: 'Cutoff',    min: 0, max: 10, default: 5, taper: 'audio' },
    { id: 'resonance', label: 'Resonance', min: 0, max: 10, default: 3 },
    { id: 'volume',    label: 'Volume',    min: 0, max: 10, default: 8, taper: 'audio' },
  ],
  transferFn,
}
