

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Game from './Game'
import type { GameResult } from './Game'
import { getMatches, getRanking, registerMatch } from './api/matches'
import './App.css'


type Screen = 'menu' | 'ranking' | 'history' | 'options' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  
const [gameDuration, setGameDuration] = useState<number>(() => {
  const saved = localStorage.getItem('pirate-battle-duration')
  const value = saved === null ? 120 : Number(saved)

  return Number.isFinite(value) &&
    value >= 60 &&
    value <= 180 &&
    value % 30 === 0
    ? value
    : 120
})

const [spawnInterval, setSpawnInterval] = useState<number>(() => {
  const saved = localStorage.getItem('pirate-battle-spawn')
  const value = saved === null ? 5 : Number(saved)

  return Number.isInteger(value) && value >= 2 && value <= 15
    ? value
    : 5
})


  // Pagination
  const [rankingPage, setRankingPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  
  const PAGE_SIZE = 5

  // Save game settings automatically
  useEffect(() => {
  localStorage.setItem(
    'pirate-battle-duration',
    String(gameDuration)
  )
}, [gameDuration])

useEffect(() => {
  localStorage.setItem(
    'pirate-battle-spawn',
    String(spawnInterval)
  )
}, [spawnInterval])

const queryClient = useQueryClient()

const rankingQuery = useQuery({
  queryKey: ['ranking'],
  queryFn: getRanking,
  enabled: screen === 'ranking',
})

const historyQuery = useQuery({
  queryKey: ['matches'],
  queryFn: getMatches,
  enabled: screen === 'history',
})

const rankingMatches = rankingQuery.data ?? []
const historyMatches = historyQuery.data ?? []

const rankingTotalPages = Math.max(
  1,
  Math.ceil(rankingMatches.length / PAGE_SIZE),
)

const historyTotalPages = Math.max(
  1,
  Math.ceil(historyMatches.length / PAGE_SIZE),
)

const paginatedRanking = rankingMatches.slice(
  (rankingPage - 1) * PAGE_SIZE,
  rankingPage * PAGE_SIZE,
)

const paginatedHistory = historyMatches.slice(
  (historyPage - 1) * PAGE_SIZE,
  historyPage * PAGE_SIZE,
)

const matchMutation = useMutation({
  mutationFn: registerMatch,
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: ['matches'] })
    void queryClient.invalidateQueries({ queryKey: ['ranking'] })
  },
})

function handlePlayAgain() {
  matchMutation.reset()
}

function handleGameComplete(result: GameResult) {
   // Save the last completed match
   localStorage.setItem(
    'pirate-battle-last-match',
    JSON.stringify({
      score: result.score,
      duration: result.played,
      reason: result.reason,
      date: new Date().toISOString(),
    })
  )

  // Register the match through the mocked API
  matchMutation.mutate({
    player: 'Captain Marcus',
    score: result.score,
    duration: result.played,
    reason: result.reason,
  })
}


  return (
    <main className="app">
      <header className="topbar">
        <div className="logo">☠ PIRATE BATTLE</div>
        <span className="version">BROWSER GAME · MVP</span>
      </header>

      {screen === 'game' ? (
        <Game
        onExit={() => setScreen('menu')}
        onComplete={handleGameComplete}
        duration={gameDuration}
        spawnInterval={spawnInterval}
        saveStatus={
          matchMutation.isPending
            ? 'saving'
            : matchMutation.isError
              ? 'failed'
              : matchMutation.isSuccess
                ? 'saved'
                : 'idle'
        }
        onRestart={handlePlayAgain}
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

    {rankingQuery.isPending && (
      <p>Loading ranking...</p>
    )}

    {rankingQuery.isError && (
      <p>Failed to load ranking.</p>
    )}

    {rankingQuery.isSuccess &&
      rankingQuery.data.length === 0 && (
        <p>No completed matches yet.</p>
      )}

    {rankingQuery.isSuccess &&
      rankingQuery.data.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Player</th>
                <th>Score</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRanking.map((match, index) => (
                <tr key={match.id}>
                  <td>
                    #{(rankingPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td>{match.player}</td>
                  <td>{match.score}</td>
                  <td>{match.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={rankingPage === 1}
              onClick={() => setRankingPage((page) => page - 1)}
            >
              PREVIOUS
            </button>

            <span>
              Page {rankingPage} of {rankingTotalPages}
            </span>

            <button
              disabled={rankingPage >= rankingTotalPages}
              onClick={() => setRankingPage((page) => page + 1)}
            >
              NEXT
            </button>
          </div>
        </div>
      )}

    <button onClick={() => setScreen('menu')}>
      BACK TO MENU
    </button>
  </div>
)}

         
{screen === 'history' && (
  <div className="panel">
    <h2>📜 MATCH HISTORY</h2>

    {historyQuery.isPending && (
      <p>Loading match history...</p>
    )}

    {historyQuery.isError && (
      <p>Failed to load match history.</p>
    )}

    {historyQuery.isSuccess &&
      historyQuery.data.length === 0 && (
        <p>No completed matches yet.</p>
      )}

    {historyQuery.isSuccess &&
      historyQuery.data.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Player</th>
                <th>Score</th>
                <th>Time</th>
                <th>Result</th>
              </tr>
            </thead>

            <tbody>
              {paginatedHistory.map((match) => (
                <tr key={match.id}>
                  <td>
                    {new Date(match.date).toLocaleDateString('en-US')}
                  </td>
                  <td>{match.player}</td>
                  <td>{match.score}</td>
                  <td>{match.duration}s</td>
                  <td>
                    {match.reason === 'health'
                      ? 'Ship destroyed'
                      : 'Time expired'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
  <button
    disabled={historyPage === 1}
    onClick={() => setHistoryPage((page) => page - 1)}
  >
    PREVIOUS
  </button>

  <span>Page {historyPage} of {historyTotalPages}</span>

  <button
    disabled={historyPage >= historyTotalPages}
    onClick={() => setHistoryPage((page) => page + 1)}
  >
    NEXT
  </button>
</div>
        </div>
      )}

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
