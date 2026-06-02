import { create } from 'zustand'
import { BoardPedal, FreqPoint } from './engine/types'
import { PEDAL_MAP } from './engine/registry'
import { FREQS } from './engine/math'
import { nanoid } from './engine/nanoid'

function defaultKnobs(defId: string): Record<string, number> {
  const def = PEDAL_MAP[defId]
  return Object.fromEntries(def.knobs.map(k => [k.id, k.default]))
}

function computeChain(pedals: BoardPedal[]): FreqPoint[] {
  const active = pedals.filter(p => !p.bypass)
  if (active.length === 0) {
    return FREQS.map(f => ({ freq: f, mag: 0, phase: 0 }))
  }
  return FREQS.map((f, i) => {
    let mag = 0
    for (const p of active) {
      const def = PEDAL_MAP[p.defId]
      if (!def) continue
      const pts = def.transferFn(p.knobValues, FREQS)
      mag += pts[i].mag
    }
    return { freq: f, mag, phase: 0 }
  })
}

function computePerPedal(pedals: BoardPedal[]): Record<string, FreqPoint[]> {
  const out: Record<string, FreqPoint[]> = {}
  for (const p of pedals) {
    const def = PEDAL_MAP[p.defId]
    if (!def) continue
    out[p.uid] = def.transferFn(p.knobValues, FREQS)
  }
  return out
}

interface BoardState {
  pedals: BoardPedal[]
  selectedUid: string | null
  combined: FreqPoint[]
  perPedal: Record<string, FreqPoint[]>

  addPedal: (defId: string) => void
  removePedal: (uid: string) => void
  reorderPedals: (from: number, to: number) => void
  setKnob: (uid: string, knobId: string, value: number) => void
  toggleBypass: (uid: string) => void
  selectPedal: (uid: string | null) => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  pedals: [],
  selectedUid: null,
  combined: FREQS.map(f => ({ freq: f, mag: 0, phase: 0 })),
  perPedal: {},

  addPedal(defId) {
    const uid = nanoid()
    const pedal: BoardPedal = {
      uid,
      defId,
      knobValues: defaultKnobs(defId),
      bypass: false,
    }
    const pedals = [...get().pedals, pedal]
    set({
      pedals,
      selectedUid: uid,
      combined: computeChain(pedals),
      perPedal: computePerPedal(pedals),
    })
  },

  removePedal(uid) {
    const pedals = get().pedals.filter(p => p.uid !== uid)
    const sel = get().selectedUid === uid ? null : get().selectedUid
    set({ pedals, selectedUid: sel, combined: computeChain(pedals), perPedal: computePerPedal(pedals) })
  },

  reorderPedals(from, to) {
    const pedals = [...get().pedals]
    const [item] = pedals.splice(from, 1)
    pedals.splice(to, 0, item)
    set({ pedals, combined: computeChain(pedals), perPedal: computePerPedal(pedals) })
  },

  setKnob(uid, knobId, value) {
    const pedals = get().pedals.map(p =>
      p.uid === uid ? { ...p, knobValues: { ...p.knobValues, [knobId]: value } } : p
    )
    set({ pedals, combined: computeChain(pedals), perPedal: computePerPedal(pedals) })
  },

  toggleBypass(uid) {
    const pedals = get().pedals.map(p =>
      p.uid === uid ? { ...p, bypass: !p.bypass } : p
    )
    set({ pedals, combined: computeChain(pedals), perPedal: computePerPedal(pedals) })
  },

  selectPedal(uid) {
    set({ selectedUid: uid })
  },
}))
