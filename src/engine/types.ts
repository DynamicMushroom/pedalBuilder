export type KnobTaper = 'linear' | 'audio'

export interface KnobDef {
  id: string
  label: string
  min: number
  max: number
  default: number
  unit?: string
  taper?: KnobTaper
}

export type PedalCategory = 'fuzz' | 'overdrive' | 'distortion' | 'boost'

export interface PedalDef {
  id: string
  name: string
  pcbRef: string
  category: PedalCategory
  color: string
  knobs: KnobDef[]
  description: string
  transferFn: (knobs: Record<string, number>, freqs: number[]) => FreqPoint[]
}

export interface FreqPoint {
  freq: number
  mag: number    // dB
  phase: number  // degrees
}

export interface BoardPedal {
  uid: string
  defId: string
  knobValues: Record<string, number>
  bypass: boolean
}
