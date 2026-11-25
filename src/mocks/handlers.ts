
import { http, HttpResponse } from 'msw'

export interface MatchRecord {
  id: string
  player: string
  score: number
  duration: number
  reason: 'time' | 'health'
  date: string
}

const STORAGE_KEY = 'pirate-battle-matches'

function getMatches(): MatchRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as MatchRecord[] : []
  } catch {
    return []
  }
}

function saveMatches(matches: MatchRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches))
}

export const handlers = [
  // Consultar histórico
  http.get('/api/matches', () => {
    const matches = getMatches()

    return HttpResponse.json(
      [...matches].sort(
        (a, b) => b.date.localeCompare(a.date),
      ),
    )
  }),

  // Registrar uma partida
  http.post('/api/matches', async ({ request }) => {
    const body = await request.json() as Partial<MatchRecord>

    if (
      typeof body.player !== 'string' ||
      !body.player.trim() ||
      typeof body.score !== 'number' ||
      !Number.isFinite(body.score) ||
      body.score < 0 ||
      typeof body.duration !== 'number' ||
      !Number.isFinite(body.duration) ||
      body.duration < 0 ||
      (body.reason !== 'time' && body.reason !== 'health')
    ) {
      return HttpResponse.json(
        { error: 'Invalid match data' },
        { status: 400 },
      )
    }

    const match: MatchRecord = {
      id: crypto.randomUUID(),
      player: body.player.trim(),
      score: body.score,
      duration: body.duration,
      reason: body.reason,
      date: new Date().toISOString(),
    }

    const matches = getMatches()
    matches.push(match)
    saveMatches(matches)

    return HttpResponse.json(match, { status: 201 })
  }),

  // Consultar ranking
  http.get('/api/ranking', () => {
    const ranking = [...getMatches()]
      .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))

    return HttpResponse.json(ranking)
  }),
]
