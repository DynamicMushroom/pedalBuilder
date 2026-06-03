import React, { useState } from 'react'
import { DEVICE_REGISTRY } from '../engine/registry'
import { useBoardStore } from '../store'

const CATEGORY_LABELS: Record<string, string> = {
  overdrive:  'Overdrive',
  distortion: 'Distortion',
  fuzz:       'Fuzz',
  boost:      'Boost',
  vcf:        'Voltage-Controlled Filter',
  vca:        'Voltage-Controlled Amplifier',
  oscillator: 'Oscillator',
}

export function Toolbar() {
  const [open, setOpen] = useState(false)
  const [tab, setTab]   = useState<'pedal' | 'synth'>('pedal')
  const { addPedal }    = useBoardStore()

  const catalog = DEVICE_REGISTRY.filter(p => p.type === tab)
  const byCategory = catalog.reduce<Record<string, typeof catalog>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <>
      <button type="button" className="add-pedal-btn" onClick={() => setOpen(o => !o)}>
        {open ? '✕ Close' : '＋ Add Module'}
      </button>

      {open && (
        <div className="toolbar-drawer">
          <div className="drawer-title">Circuit Catalog</div>
          <div className="drawer-tabs">
            <button
              type="button"
              className={`drawer-tab${tab === 'pedal' ? ' active' : ''}`}
              onClick={() => setTab('pedal')}
            >Pedals</button>
            <button
              type="button"
              className={`drawer-tab${tab === 'synth' ? ' active' : ''}`}
              onClick={() => setTab('synth')}
            >Synths</button>
          </div>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="catalog-group">
              <div className="catalog-group-label">{CATEGORY_LABELS[cat] ?? cat}</div>
              <div className="catalog-pedals">
                {items.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    className="catalog-pedal-btn"
                    style={{ '--catalog-color': p.color } as React.CSSProperties}
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
