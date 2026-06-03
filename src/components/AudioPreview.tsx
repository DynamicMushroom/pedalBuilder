import { useState } from 'react'
import { useBoardStore } from '../store'
import { playChain, stopAudio } from '../audio/audioEngine'

export function AudioPreview() {
  const [playing, setPlaying] = useState(false)
  const combined = useBoardStore(s => s.combined)

  async function toggle() {
    if (playing) {
      stopAudio()
      setPlaying(false)
      return
    }
    setPlaying(true)
    try {
      await playChain(combined, () => setPlaying(false))
    } catch {
      setPlaying(false)
    }
  }

  return (
    <button
      type="button"
      className={`audio-btn${playing ? ' playing' : ''}`}
      onClick={toggle}
      title="Play pink noise through the active signal chain"
    >
      {playing ? '⏹ Stop' : '▶ Preview'}
    </button>
  )
}
