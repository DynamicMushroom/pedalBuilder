import type { PedalDef, FreqPoint } from '../types'
import { lpMag, bpMag, toDb } from '../math'

// Roland SH-101 / TB-303 VCF — IR3109 chip, 4-pole (24dB/oct) LP
// Acid-characteristic resonance: sharper and higher-amplitude peak than the Moog ladder
// Env Amount models a partially-swept cutoff position (static snapshot of envelope mid-flight)

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const cutoff    = knobs.cutoff    / 10
  const resonance = knobs.resonance / 10
  const env       = knobs.env       / 10
  const volume    = knobs.volume    / 10

  const fcBase = 20 * Math.pow(900, cutoff)             // 20 Hz → 18 kHz
  const fc     = Math.min(fcBase * (1 + env * 3), 20000) // env opens filter up to 4×
  const Q      = 0.5 + resonance * 29.5                  // sharper than Moog: Q → 30

  return freqs.map(f => {
    const lp4  = Math.pow(lpMag(f, fc), 4)
    const peak = resonance * bpMag(f, fc, Q) * 5
    return { freq: f, mag: toDb((lp4 + peak) * volume), phase: 0 }
  })
}

export const sh101: PedalDef = {
  id: 'sh101',
  name: 'SH-101 / TB-303 VCF',
  pcbRef: 'Roland SH-101 (IR3109)',
  category: 'vcf',
  type: 'synth',
  color: '#a62020',
  description: 'IR3109 4-pole LP at 24dB/oct. Squelchy acid resonance sharper than the Moog ladder. Env Amount offsets the cutoff frequency.',
  knobs: [
    { id: 'cutoff',    label: 'Cutoff',  min: 0, max: 10, default: 4, taper: 'audio' },
    { id: 'resonance', label: 'Reson',   min: 0, max: 10, default: 5 },
    { id: 'env',       label: 'Env Amt', min: 0, max: 10, default: 3 },
    { id: 'volume',    label: 'Volume',  min: 0, max: 10, default: 8, taper: 'audio' },
  ],
  transferFn,
}
