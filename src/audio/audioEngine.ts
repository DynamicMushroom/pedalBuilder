import type { FreqPoint } from '../engine/types'

const FFT_SIZE = 4096
const DURATION = 3  // seconds of pink noise

// Radix-2 Cooley-Tukey FFT in-place
function fft(re: Float64Array, im: Float64Array, inverse: boolean): void {
  const n = re.length
  let j = 0
  for (let i = 1; i < n; i++) {
    let bit = n >> 1
    while (j & bit) { j ^= bit; bit >>= 1 }
    j ^= bit
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr
      const ti = im[i]; im[i] = im[j]; im[j] = ti
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (inverse ? 2 : -2) * Math.PI / len
    const wRe = Math.cos(ang)
    const wIm = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let ur = 1, ui = 0
      for (let k = 0; k < (len >> 1); k++) {
        const a = i + k, b = a + (len >> 1)
        const tr = ur * re[b] - ui * im[b]
        const ti = ur * im[b] + ui * re[b]
        re[b] = re[a] - tr; im[b] = im[a] - ti
        re[a] += tr; im[a] += ti
        const nr = ur * wRe - ui * wIm
        ui = ur * wIm + ui * wRe
        ur = nr
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n }
}

// Log-frequency interpolation of dB magnitude, returned as linear
function magAt(pts: FreqPoint[], f: number): number {
  if (f <= 0) return 0
  if (f <= pts[0].freq) return Math.pow(10, pts[0].mag / 20)
  const last = pts[pts.length - 1]
  if (f >= last.freq) return Math.pow(10, last.mag / 20)
  let lo = 0, hi = pts.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >>> 1
    if (pts[mid].freq <= f) lo = mid; else hi = mid
  }
  const t = (Math.log10(f) - Math.log10(pts[lo].freq)) /
            (Math.log10(pts[hi].freq) - Math.log10(pts[lo].freq))
  const db = pts[lo].mag + t * (pts[hi].mag - pts[lo].mag)
  return Math.pow(10, Math.min(db, 60) / 20)  // cap at +60 dB
}

// Build a normalized linear-phase impulse response from the frequency response
function buildIR(pts: FreqPoint[], sampleRate: number): Float32Array {
  const bins = FFT_SIZE / 2 + 1
  const nyquist = sampleRate / 2
  const re = new Float64Array(FFT_SIZE)
  const im = new Float64Array(FFT_SIZE)

  for (let k = 0; k < bins; k++) {
    re[k] = magAt(pts, (k / (bins - 1)) * nyquist)
  }
  for (let k = 1; k < FFT_SIZE / 2; k++) re[FFT_SIZE - k] = re[k]

  fft(re, im, true)

  // Circular-shift by FFT_SIZE/2 to center, apply Hann window, then normalize
  const h = new Float32Array(FFT_SIZE)
  const half = FFT_SIZE / 2
  let peak = 0
  for (let i = 0; i < FFT_SIZE; i++) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1))
    h[i] = re[(i + half) % FFT_SIZE] * w
    if (Math.abs(h[i]) > peak) peak = Math.abs(h[i])
  }
  if (peak > 0) for (let i = 0; i < FFT_SIZE; i++) h[i] /= peak
  return h
}

let ctx: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null

export function stopAudio(): void {
  try { currentSource?.stop() } catch { /* already stopped */ }
  currentSource = null
}

export async function playChain(pts: FreqPoint[], onEnded: () => void): Promise<void> {
  stopAudio()
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') await ctx.resume()

  const { sampleRate } = ctx

  // Impulse response from frequency response
  const h = buildIR(pts, sampleRate)
  const irBuf = ctx.createBuffer(1, h.length, sampleRate)
  irBuf.copyToChannel(h, 0)
  const convolver = ctx.createConvolver()
  convolver.normalize = false
  convolver.buffer = irBuf

  // Pink noise source (Paul Kellett's algorithm)
  const nLen = Math.ceil(DURATION * sampleRate)
  const noiseBuf = ctx.createBuffer(1, nLen, sampleRate)
  const nd = noiseBuf.getChannelData(0)
  let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0
  for (let i = 0; i < nLen; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886*b0 + w*0.0555179;  b1 = 0.99332*b1 + w*0.0750759
    b2 = 0.96900*b2 + w*0.1538520;  b3 = 0.86650*b3 + w*0.3104856
    b4 = 0.55000*b4 + w*0.5329522;  b5 = -0.7616*b5 - w*0.0168980
    nd[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) / 10
    b6 = w * 0.115926
  }

  // Gain with 50ms fade-in/out to prevent clicks
  const gain = ctx.createGain()
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.7, now + 0.05)
  gain.gain.setValueAtTime(0.7, now + DURATION - 0.15)
  gain.gain.linearRampToValueAtTime(0, now + DURATION)

  currentSource = ctx.createBufferSource()
  currentSource.buffer = noiseBuf
  currentSource.connect(convolver)
  convolver.connect(gain)
  gain.connect(ctx.destination)
  currentSource.onended = () => { currentSource = null; onEnded() }
  currentSource.start()
}
