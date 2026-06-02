import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BoardPedal } from '../engine/types'
import { PEDAL_MAP } from '../engine/registry'
import { useBoardStore } from '../store'
import { Knob } from './Knob'

interface PedalCardProps {
  pedal: BoardPedal
}

export function PedalCard({ pedal }: PedalCardProps) {
  const def = PEDAL_MAP[pedal.defId]
  const { setKnob, toggleBypass, removePedal, selectPedal, selectedUid } = useBoardStore()
  const isSelected = selectedUid === pedal.uid

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pedal.uid,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (!def) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pedal-card ${pedal.bypass ? 'bypassed' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => selectPedal(pedal.uid)}
    >
      {/* Drag handle */}
      <div className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        ⠿
      </div>

      {/* Enclosure color strip */}
      <div className="pedal-color-strip" style={{ background: def.color }} />

      <div className="pedal-header">
        <span className="pedal-name">{def.name}</span>
        <span className="pedal-pcb">{def.pcbRef}</span>
      </div>

      <div className="pedal-knobs">
        {def.knobs.map(knobDef => (
          <Knob
            key={knobDef.id}
            def={knobDef}
            value={pedal.knobValues[knobDef.id] ?? knobDef.default}
            onChange={v => setKnob(pedal.uid, knobDef.id, v)}
          />
        ))}
      </div>

      <div className="pedal-footer">
        <button
          className={`bypass-btn ${pedal.bypass ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); toggleBypass(pedal.uid) }}
        >
          {pedal.bypass ? 'BYPASSED' : 'ON'}
        </button>
        <button
          className="remove-btn"
          onClick={e => { e.stopPropagation(); removePedal(pedal.uid) }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
