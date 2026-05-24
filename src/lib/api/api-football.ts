/**
 * API-Football (RapidAPI) client — backup y datos estáticos
 * Free tier: 100 req/día
 */

const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3'
const API_KEY = process.env.RAPIDAPI_KEY ?? ''
const WC_2026_ID = 1 // ID del Mundial 2026 en API-Football

interface AFFixture {
  fixture: {
    id: number
    date: string
    status: { short: string; elapsed: number | null }
    venue: { name: string | null; city: string | null }
  }
  league: { round: string }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  goals: { home: number | null; away: number | null }
  score: {
    penalty: { home: number | null; away: number | null }
  }
}

interface AFH2H {
  fixture: { date: string; status: { short: string } }
  league: { name: string }
  teams: {
    home: { id: number; name: string }
    away: { id: number; name: string }
  }
  goals: { home: number | null; away: number | null }
}

interface AFPlayer {
  player: {
    id: number
    name: string
    age: number
    number: number | null
    pos: string
    photo: string
  }
}

async function fetchAF<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_KEY) throw new Error('RAPIDAPI_KEY no configurada')

  const url = new URL(`${BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
    },
    next: { revalidate: 3600 }, // Cache 1h — datos estáticos
  })

  if (!res.ok) throw new Error(`API-Football error ${res.status}`)
  const data = await res.json()
  return data.response
}

export async function getHeadToHead(team1Id: number, team2Id: number): Promise<AFH2H[]> {
  return fetchAF<AFH2H[]>('/fixtures/headtohead', {
    h2h: `${team1Id}-${team2Id}`,
    last: '10',
  })
}

export async function getSquad(teamId: number): Promise<AFPlayer[]> {
  const data = await fetchAF<{ players: AFPlayer[] }[]>('/players/squads', {
    team: String(teamId),
  })
  return data[0]?.players ?? []
}

export async function getWorldCupFixtures(): Promise<AFFixture[]> {
  return fetchAF<AFFixture[]>('/fixtures', {
    league: String(WC_2026_ID),
    season: '2026',
  })
}
