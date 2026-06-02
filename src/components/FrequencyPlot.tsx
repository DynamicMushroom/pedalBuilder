import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useBoardStore } from '../store'
import { PEDAL_MAP } from '../engine/registry'

const LABEL_FREQS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]

function fmtFreq(f: number): string {
  return f >= 1000 ? `${f / 1000}k` : `${f}`
}

function fmtDb(v: number) {
  return `${v.toFixed(1)} dB`
}

export function FrequencyPlot() {
  const { combined, perPedal, pedals } = useBoardStore()

  const data = useMemo(() => {
    return combined.map((pt, i) => {
      const row: Record<string, number> = { freq: pt.freq, combined: pt.mag }
      for (const p of pedals) {
        const pp = perPedal[p.uid]
        if (pp) row[p.uid] = pp[i].mag
      }
      return row
    })
  }, [combined, perPedal, pedals])

  const tickFormatter = (v: number) => fmtFreq(v)

  return (
    <div className="freq-plot">
      <div className="plot-title">Frequency Response</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="freq"
            type="number"
            scale="log"
            domain={[20, 20000]}
            ticks={LABEL_FREQS}
            tickFormatter={tickFormatter}
            stroke="#666"
            tick={{ fill: '#888', fontSize: 10 }}
            label={{ value: 'Hz', position: 'insideBottomRight', offset: -5, fill: '#666', fontSize: 11 }}
          />
          <YAxis
            domain={[-60, 60]}
            tickCount={7}
            stroke="#666"
            tick={{ fill: '#888', fontSize: 10 }}
            tickFormatter={v => `${v}dB`}
          />
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', fontSize: 11 }}
            labelStyle={{ color: '#aaa' }}
            labelFormatter={v => `${fmtFreq(Number(v))} Hz`}
            formatter={(v: number) => fmtDb(v)}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#888' }}
          />

          {/* Per-pedal lines (subtle) */}
          {pedals.map(p => {
            const def = PEDAL_MAP[p.defId]
            return (
              <Line
                key={p.uid}
                type="monotone"
                dataKey={p.uid}
                stroke={def?.color ?? '#555'}
                strokeWidth={1}
                dot={false}
                opacity={0.55}
                name={def?.name ?? p.defId}
              />
            )
          })}

          {/* Combined response — bold */}
          <Line
            type="monotone"
            dataKey="combined"
            stroke="#e8a030"
            strokeWidth={2.5}
            dot={false}
            name="Combined"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
