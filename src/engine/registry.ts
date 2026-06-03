import type { PedalDef } from './types'
import { tubeScreamer } from './pedals/tubeScreamer'
import { bigMuff }      from './pedals/bigMuff'
import { klon }         from './pedals/klon'
import { ds1 }          from './pedals/ds1'
import { fuzzFace }     from './pedals/fuzzFace'
import { shredmaster }  from './pedals/shredmaster'
import { moogLadder }   from './synths/moogLadder'
import { arp2600 }      from './synths/arp2600'
import { ms20 }         from './synths/ms20'
import { sh101 }        from './synths/sh101'

export const PEDAL_REGISTRY: PedalDef[] = [
  tubeScreamer,
  bigMuff,
  klon,
  ds1,
  fuzzFace,
  shredmaster,
]

export const SYNTH_REGISTRY: PedalDef[] = [
  moogLadder,
  arp2600,
  ms20,
  sh101,
]

export const DEVICE_REGISTRY: PedalDef[] = [...PEDAL_REGISTRY, ...SYNTH_REGISTRY]

export const PEDAL_MAP = Object.fromEntries(
  PEDAL_REGISTRY.map(p => [p.id, p])
) as Record<string, PedalDef>

export const DEVICE_MAP = Object.fromEntries(
  DEVICE_REGISTRY.map(p => [p.id, p])
) as Record<string, PedalDef>
