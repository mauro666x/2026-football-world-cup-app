/**
 * Football-Data.org API client
 * Free tier: 10 req/min
 * Docs: https://www.football-data.org/documentation/quickstart
 */

const BASE_URL = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? ''
const COMPETITION_CODE = 'WC' // FIFA World Cup

interface FDMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  minute: number | null
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  score: {
    winner: string | null
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
    regularTime?: { home: number | null; away: number | null }
    extraTime?: { home: number | null; away: number | null }
    penalties?: { home: number | null; away: number | null }
  }
  venue: string | null
}

interface FDTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  coach?: { name: string }
  squad?: FDPlayer[]
}

interface FDPlayer {
  id: number
  name: string
  position: string
  dateOfBirth: string
  nationality: string
}

interface FDStanding {
  stage: string
  type: string
  group: string | null
  table: FDTableEntry[]
}

interface FDTableEntry {
  position: number
  team: { id: number; name: string; shortName: string; tla: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

async function fetchFD<T>(endpoint: string): Promise<T> {
  if (!API_KEY) throw new Error('FOOTBALL_DATA_API_KEY no configurada')

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 60 }, // Cache 60s
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Football-Data API error ${res.status}: ${body}`)
  }

  return res.json()
}

export async function getWorldCupMatches(): Promise<FDMatch[]> {
  const data = await fetchFD<{ matches: FDMatch[] }>(
    `/competitions/${COMPETITION_CODE}/matches`
  )
  return data.matches
}

export async function getLiveMatches(): Promise<FDMatch[]> {
  const data = await fetchFD<{ matches: FDMatch[] }>(
    `/competitions/${COMPETITION_CODE}/matches?status=LIVE`
  )
  return data.matches
}

export async function getMatch(externalId: number): Promise<FDMatch> {
  return fetchFD<FDMatch>(`/matches/${externalId}`)
}

export async function getStandings(): Promise<FDStanding[]> {
  const data = await fetchFD<{ standings: FDStanding[] }>(
    `/competitions/${COMPETITION_CODE}/standings`
  )
  return data.standings
}

export async function getTeam(externalId: number): Promise<FDTeam> {
  return fetchFD<FDTeam>(`/teams/${externalId}`)
}

export async function getWorldCupTeams(): Promise<FDTeam[]> {
  const data = await fetchFD<{ teams: FDTeam[] }>(
    `/competitions/${COMPETITION_CODE}/teams`
  )
  return data.teams
}

/**
 * Mapea el status de Football-Data a nuestro formato interno
 */
export function mapFDStatus(fdStatus: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'SCHEDULED',
    TIMED: 'SCHEDULED',
    IN_PLAY: 'LIVE',
    PAUSED: 'HALFTIME',
    FINISHED: 'FINISHED',
    POSTPONED: 'POSTPONED',
    CANCELLED: 'CANCELLED',
    SUSPENDED: 'POSTPONED',
  }
  return map[fdStatus] ?? 'SCHEDULED'
}

/**
 * Mapea el stage de Football-Data a nuestro formato
 */
export function mapFDStage(fdStage: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE: 'GROUP',
    ROUND_OF_32: 'ROUND_32',
    ROUND_OF_16: 'ROUND_16',
    QUARTER_FINALS: 'QUARTER',
    SEMI_FINALS: 'SEMI',
    THIRD_PLACE: 'THIRD',
    FINAL: 'FINAL',
  }
  return map[fdStage] ?? 'GROUP'
}
