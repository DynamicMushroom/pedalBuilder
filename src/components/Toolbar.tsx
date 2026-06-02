import React, { useState } from 'react'
import { PEDAL_REGISTRY } from '../engine/registry'
import { useBoardStore } from '../store'

const CATEGORY_LABELS: Record<string, string> = {
  overdrive: 'Overdrive',
  distortion: 'Distortion',
  fuzz: 'Fuzz',
  boost: 'Boost',
}

export function Toolbar() {
  const [open, setOpen] = useState(false)
  const { addPedal } = useBoardStore()

  const byCategory = PEDAL_REGISTRY.reduce<Record<string, typeof PEDAL_REGISTRY>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <>
      <button className="add-pedal-btn" onClick={() => setOpen(o => !o)}>
        {open ? '✕ Close' : '＋ Add Pedal'}
      </button>

      {open && (
        <div className="toolbar-drawer">
          <div className="drawer-title">PedalPCB Circuit Catalog</div>
          {Object.entries(byCategory).map(([cat, pedals]) => (
            <div key={cat} className="catalog-group">
              <div className="catalog-group-label">{CATEGORY_LABELS[cat] ?? cat}</div>
              <div className="catalog-pedals">
                {pedals.map(p => (
                  <button
                    key={p.id}
                    className="catalog-pedal-btn"
                    style={{ borderLeftColor: p.color }}
                    onClick={() => { addPedal(p.id); setOpen(false) }}
                  >
                    <span className="catalog-name">{p.name}</span>
                    <span className="catalog-pcb">{p.pcbRef}</span>
                    <span className="catalog-desc">{p.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
