// First-order filter magnitude responses
export function lpMag(f: number, fc: number): number {
  const x = f / fc
  return 1 / Math.sqrt(1 + x * x)
}

export function hpMag(f: number, fc: number): number {
  const x = f / fc
  return x / Math.sqrt(1 + x * x)
}

// Second-order resonant LP and HP (biquad / state-variable)
export function lp2Mag(f: number, fc: number, Q: number): number {
  const w = f / fc
  return 1 / Math.sqrt((1 - w * w) ** 2 + (w / Q) ** 2)
}

export function hp2Mag(f: number, fc: number, Q: number): number {
  const w = f / fc
  return (w * w) / Math.sqrt((1 - w * w) ** 2 + (w / Q) ** 2)
}

// Second-order bandpass magnitude (normalized peak = 1/Q at fc)
export function bpMag(f: number, fc: number, Q: number): number {
  const w = f / fc
  return (w / Q) / Math.sqrt((1 - w * w) ** 2 + (w / Q) ** 2)
}

// Second-order notch magnitude
export function notchMag(f: number, fc: number, Q: number): number {
  const w = f / fc
  return Math.abs(1 - w * w) / Math.sqrt((1 - w * w) ** 2 + (w / Q) ** 2)
}

export function toDb(mag: number): number {
  return 20 * Math.log10(Math.max(mag, 1e-10))
}

export function logspace(min = 20, max = 20000, n = 200): number[] {
  const logMin = Math.log10(min)
  const logMax = Math.log10(max)
  return Array.from({ length: n }, (_, i) =>
    Math.pow(10, logMin + (i / (n - 1)) * (logMax - logMin))
  )
}

export const FREQS = logspace()
