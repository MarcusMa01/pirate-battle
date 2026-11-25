
import axios from 'axios'
import type { MatchRecord } from '../mocks/handlers'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export type NewMatch = Pick<
  MatchRecord,
  'player' | 'score' | 'duration' | 'reason'
>

export async function getMatches(): Promise<MatchRecord[]> {
  const response = await api.get<MatchRecord[]>('/matches')
  return response.data
}

export async function getRanking(): Promise<MatchRecord[]> {
  const response = await api.get<MatchRecord[]>('/ranking')
  return response.data
}

export async function registerMatch(
  match: NewMatch,
): Promise<MatchRecord> {
  const response = await api.post<MatchRecord>('/matches', match)
  return response.data
}
