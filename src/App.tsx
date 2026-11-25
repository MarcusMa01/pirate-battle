
import { useState } from 'react'
import Game from './Game'
import './App.css'

type Screen = 'menu' | 'ranking' | 'history' | 'options' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [gameDuration, setGameDuration] = useState(120)
  const [spawnInterval, setSpawnInterval] = useState(5)

  return (
    <main className="app">
      <header className="topbar">
        <div className="logo">☠ PIRATE BATTLE</div>
        <span className="version">BROWSER GAME · MVP</span>
      </header>

      {screen === 'game' ? (
        <Game
        onExit={() => setScreen('menu')}
        duration={gameDuration}
        spawnInterval={spawnInterval}
        />
      ) : (
        <section className="hero">
          <div className="eyebrow">⚓ THE SEVEN SEAS AWAIT</div>

          <h1>
            PIRATE <span>BATTLE</span>
          </h1>

          <p className="subtitle">
            Command your ship. Survive the battle. Become a legend.
          </p>

          {screen === 'menu' && (
            <div className="menu">
              <button
                className="primary-button"
                onClick={() => setScreen('game')}
              >
                ▶ PLAY GAME
              </button>

              <button onClick={() => setScreen('options')}>
                ⚙ OPTIONS
              </button>

              <button onClick={() => setScreen('ranking')}>
                🏆 RANKING
              </button>

              <button onClick={() => setScreen('history')}>
                📜 MATCH HISTORY
              </button>
            </div>
          )}

          {screen === 'options' && (
            <div className="panel">
              <h2>GAME OPTIONS</h2>

              <label>
                Match duration: {gameDuration} seconds
                <input
                  type="range"
                  min="60"
                  max="180"
                  step="30"
                  value={gameDuration}
                  onChange={(event) =>
                    setGameDuration(Number(event.target.value))
                  }
                />
              </label>

              <label>
                Enemy spawn interval: {spawnInterval} seconds
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={spawnInterval}
                  onChange={(event) =>
                    setSpawnInterval(Number(event.target.value))
                  }
                />
              </label>

              <button
                className="primary-button"
                onClick={() => setScreen('menu')}
              >
                SAVE AND RETURN
              </button>
            </div>
          )}

          {screen === 'ranking' && (
            <div className="panel">
              <h2>🏆 RANKING</h2>
              <p>
                Leaderboard will be connected to the mock API.
              </p>
              <button onClick={() => setScreen('menu')}>
                BACK TO MENU
              </button>
            </div>
          )}

          {screen === 'history' && (
            <div className="panel">
              <h2>📜 MATCH HISTORY</h2>
              <p>
                Your completed matches will appear here.
              </p>
              <button onClick={() => setScreen('menu')}>
                BACK TO MENU
              </button>
            </div>
          )}
        </section>
      )}

      <footer>
        <span>PIRATE BATTLE</span>
        <span>BUILD YOUR LEGEND · 2026</span>
      </footer>
    </main>
  )
}

export default App
