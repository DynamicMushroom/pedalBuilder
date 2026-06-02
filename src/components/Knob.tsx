import React, { useRef, useCallback } from 'react'
import { KnobDef } from '../engine/types'

interface KnobProps {
  def: KnobDef
  value: number
  onChange: (v: number) => void
}

// Map knob value to rotation angle (-135° to +135°)
function valToAngle(value: number, min: number, max: number): number {
  return -135 + ((value - min) / (max - min)) * 270
}

export function Knob({ def, value, onChange }: KnobProps) {
  const startY = useRef<number | null>(null)
  const startVal = useRef<number>(value)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startY.current = e.clientY
    startVal.current = value
    e.preventDefault()

    const onMove = (me: MouseEvent) => {
      if (startY.current === null) return
      const delta = (startY.current - me.clientY) / 150  // pixels per full range
      const range = def.max - def.min
      const next = Math.max(def.min, Math.min(def.max, startVal.current + delta * range))
      onChange(Math.round(next * 10) / 10)
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [value, def, onChange])

  const handleDoubleClick = useCallback(() => {
    onChange(def.default)
  }, [def.default, onChange])

  const angle = valToAngle(value, def.min, def.max)
  const rad = (angle * Math.PI) / 180
  const cx = 20, cy = 20, r = 14
  const ix = cx + r * Math.sin(rad)
  const iy = cy - r * Math.cos(rad)

  // Track arc
  const startRad = (-135 * Math.PI) / 180
  const endRad   = rad
  const arcR = 16
  const ax1 = cx + arcR * Math.sin(startRad)
  const ay1 = cy - arcR * Math.cos(startRad)
  const ax2 = cx + arcR * Math.sin(endRad)
  const ay2 = cy - arcR * Math.cos(endRad)
  const largeArc = (angle + 135) > 180 ? 1 : 0

  return (
    <div className="knob-wrap" onDoubleClick={handleDoubleClick}>
      <svg
        width={40}
        height={40}
        onMouseDown={handleMouseDown}
        style={{ cursor: 'ns-resize', userSelect: 'none' }}
      >
        {/* Track (full arc) */}
        <path
          d={`M ${cx + arcR * Math.sin((-135 * Math.PI) / 180)} ${cy - arcR * Math.cos((-135 * Math.PI) / 180)}
              A ${arcR} ${arcR} 0 1 1 ${cx + arcR * Math.sin((135 * Math.PI) / 180)} ${cy - arcR * Math.cos((135 * Math.PI) / 180)}`}
          fill="none"
          stroke="#333"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Active arc */}
        {angle > -135 && (
          <path
            d={`M ${ax1} ${ay1} A ${arcR} ${arcR} 0 ${largeArc} 1 ${ax2} ${ay2}`}
            fill="none"
            stroke="#e8a030"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}
        {/* Knob body */}
        <circle cx={cx} cy={cy} r={r} fill="#2a2a2a" stroke="#444" strokeWidth={1} />
        {/* Indicator */}
        <line
          x1={cx} y1={cy}
          x2={ix} y2={iy}
          stroke="#e8e8e8"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <div className="knob-label">{def.label}</div>
      <div className="knob-value">{value.toFixed(1)}</div>
    </div>
  )
}
