import { PedalDef } from './types'
import { tubeScreamer } from './pedals/tubeScreamer'
import { bigMuff }      from './pedals/bigMuff'
import { klon }         from './pedals/klon'
import { ds1 }          from './pedals/ds1'
import { fuzzFace }     from './pedals/fuzzFace'
import { shredmaster }  from './pedals/shredmaster'

export const PEDAL_REGISTRY: PedalDef[] = [
  tubeScreamer,
  bigMuff,
  klon,
  ds1,
  fuzzFace,
  shredmaster,
]

export const PEDAL_MAP = Object.fromEntries(
  PEDAL_REGISTRY.map(p => [p.id, p])
) as Record<string, PedalDef>
