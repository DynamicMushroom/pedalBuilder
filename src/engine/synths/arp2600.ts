import type { PedalDef, FreqPoint } from '../types'
import { lp2Mag, hp2Mag, bpMag, toDb } from '../math'

// ARP 2600 state variable filter — 2-pole (12dB/oct), simultaneous LP/BP/HP outputs
// Mode knob selects output: 0 = LP, 5 = BP, 10 = HP (parabolic crossfade)

function transferFn(knobs: Record<string, number>, freqs: number[]): FreqPoint[] {
  const cutoff    = knobs.cutoff    / 10
  const resonance = knobs.resonance / 10
  const mode      = knobs.mode      / 10  // 0=LP, 0.5=BP, 1=HP
  const volume    = knobs.volume    / 10

  const fc = 20 * Math.pow(900, cutoff)         // 20 Hz → 18 kHz
  const Q  = Math.max(0.5, 0.5 + resonance * 19.5)

  // Parabolic crossfade: LP at 0, BP at 0.5, HP at 1
  const lpW = Math.max(0, 1 - 2 * mode)
  const hpW = Math.max(0, 2 * mode - 1)
  const bpW = 1 - lpW - hpW

  return freqs.map(f => {
    const out = lpW * lp2Mag(f, fc, Q) + hpW * hp2Mag(f, fc, Q) + bpW * bpMag(f, fc, Q)
    return { freq: f, mag: toDb(out * volume), phase: 0 }
  })
}

export const arp2600: PedalDef = {
  id: 'arp2600',
  name: 'ARP 2600 VCF',
  pcbRef: 'ARP 2600 Rev 3.2',
  category: 'vcf',
  type: 'synth',
  color: '#2c5282',
  description: 'State variable filter, 2-pole 12dB/oct. Mode sweeps LP → BP → HP. Resonance peaks at cutoff.',
  knobs: [
    { id: 'cutoff',    label: 'Cutoff',    min: 0, max: 10, default: 5, taper: 'audio' },
    { id: 'resonance', label: 'Resonance', min: 0, max: 10, default: 3 },
    { id: 'mode',      label: 'Mode',      min: 0, max: 10, default: 0 },
    { id: 'volume',    label: 'Volume',    min: 0, max: 10, default: 8, taper: 'audio' },
  ],
  transferFn,
}
