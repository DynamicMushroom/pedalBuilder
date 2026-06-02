import { BoardScene } from './three/BoardScene'
import { PedalBoard } from './components/PedalBoard'
import { FrequencyPlot } from './components/FrequencyPlot'
import { Toolbar } from './components/Toolbar'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="title-icon">⬡</span>
          pedal-builder
        </div>
        <div className="app-subtitle">Guitar pedal circuit simulator — PedalPCB catalog</div>
        <div className="header-actions">
          <Toolbar />
        </div>
      </header>

      <main className="app-main">
        <div className="top-row">
          <BoardScene />
          <FrequencyPlot />
        </div>
        <PedalBoard />
      </main>
    </div>
  )
}
