import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useBoardStore } from '../store'
import { PedalCard } from './PedalCard'

export function PedalBoard() {
  const { pedals, reorderPedals } = useBoardStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIdx = pedals.findIndex(p => p.uid === active.id)
    const toIdx   = pedals.findIndex(p => p.uid === over.id)
    reorderPedals(fromIdx, toIdx)
  }

  return (
    <div className="pedal-board">
      {pedals.length === 0 ? (
        <div className="board-empty">
          <p>No pedals yet — add one from the toolbar</p>
          <p className="hint">Input → [pedals in order] → Output</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pedals.map(p => p.uid)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="pedal-chain">
              <div className="chain-label input-label">IN</div>
              {pedals.map((p, i) => (
                <React.Fragment key={p.uid}>
                  <div className="chain-wire" />
                  <PedalCard pedal={p} />
                </React.Fragment>
              ))}
              <div className="chain-wire" />
              <div className="chain-label output-label">OUT</div>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
