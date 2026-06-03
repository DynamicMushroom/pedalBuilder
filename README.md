# pedal-builder

A browser-based guitar pedal circuit simulator. Build signal chains from the [PedalPCB](https://www.pedalpcb.com) catalog, visualize tone stack frequency response in real time, and explore how overdrive, fuzz, and distortion circuits shape your sound.

![pedal-builder screenshot](docs/screenshot.png)

## Features

- **3D pedalboard** — Three.js / React Three Fiber view of your signal chain; drag to orbit
- **Drag-and-drop chain** — reorder pedals, toggle bypass, mix and match circuits
- **Real-time Bode plot** — frequency response updates instantly as you turn knobs; per-pedal curves plus combined response
- **6 pedal + 4 synth VCF circuits** — analytical transfer functions derived from actual component values:

| Circuit | PedalPCB board | Category |
|---------|---------------|----------|
| Tube Screamer (TS-9) | Green Bean | Overdrive |
| Big Muff Pi | Musket Fuzz | Fuzz |
| Klon Centaur | Castledine | Overdrive |
| Boss DS-1 | Zapper | Distortion |
| Fuzz Face (Ge) | Hairball | Fuzz |
| Marshall Shredmaster | Harbinger One | Distortion |

**Synthesizer VCF modules** (in `src/engine/synths/`):

| Circuit | Hardware reference | Category |
|---------|-------------------|----------|
| Moog 904A VCF | Moog Music 904A | VCF |
| ARP 2600 VCF | ARP 2600 Rev 3.2 | VCF |
| Korg MS-20 VCF | Korg MS-20 (MS-01 filter board) | VCF |
| SH-101 / TB-303 VCF | Roland SH-101 (IR3109) | VCF |

## Getting started

```bash
git clone https://github.com/DynamicMushroom/pedal-builder.git
cd pedal-builder
npm install
npm run dev
```

Requires **Node.js ≥ 20.19** (or 22.12+). If you're on Node 20.x < 20.19, Vite 5 is included — just `npm install` and it will use the pinned version.

## How it works

Each pedal is defined in `src/engine/pedals/` as a `PedalDef` with:
- **knobs** — `KnobDef[]` specifying range, taper, and defaults
- **transferFn** — computes `FreqPoint[]` (magnitude in dB, phase in degrees) from knob values and a frequency array

The math (`src/engine/math.ts`) uses first- and second-order filter primitives (`lpMag`, `hpMag`, `bpMag`, `notchMag`) derived from actual component values (cap + resistor corner frequencies). This is linear small-signal analysis — it shows the tonal character but not the nonlinear clipping saturation.

### Adding a new pedal

```ts
// src/engine/pedals/myPedal.ts
import { PedalDef } from '../types'
import { lpMag, hpMag, toDb } from '../math'

export const myPedal: PedalDef = {
  id: 'mypedal',
  name: 'My Pedal',
  pcbRef: 'Board Name (PedalPCB)',
  category: 'overdrive',
  color: '#4a90d9',
  description: 'Short description.',
  knobs: [
    { id: 'gain', label: 'Gain', min: 0, max: 10, default: 5, taper: 'audio' },
  ],
  transferFn(knobs, freqs) {
    const gain = knobs.gain / 10
    return freqs.map(f => ({
      freq: f,
      mag: toDb(gain * hpMag(f, 300) * lpMag(f, 5000)),
      phase: 0,
    }))
  },
}
```

Then add it to `src/engine/registry.ts`. For synth modules, place the file in `src/engine/synths/`, set `type: 'synth'`, use a synth category (`'vcf'`, `'vca'`, `'oscillator'`), and add it to `SYNTH_REGISTRY` in the registry. See [CONTRIBUTING.md](CONTRIBUTING.md) for transfer function guidelines.

## Roadmap

- [ ] ngspice-wasm integration for full nonlinear SPICE simulation
- [ ] Web Audio API output — hear the filtered signal
- [ ] Export signal chain as SPICE netlist
- [ ] More PedalPCB circuits (modulation, delay, reverb)
- [ ] Impedance mismatch modeling between stages

## License

MIT
