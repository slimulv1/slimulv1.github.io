// Lấy dữ liệu GitHub TẠI THỜI ĐIỂM BUILD (chỉ chạy ở build, không bundle vào client).
// Trang là static export nên dữ liệu được đổ thẳng vào HTML — khung SSR ban đầu cho Projects.
//
// 3 tầng fallback để build KHÔNG BAO GIỜ vỡ (không cần token nào):
//   1) Scrape profile HTML   — đúng các repo đang PIN (cùng parser với CF function + client)
//   2) REST anonymous         — không cần token, repo public non-fork mới nhất
//   3) Snapshot JSON          — khi GitHub lỗi / rate-limit / build offline
//
// Tên + tagline là TĨNH (thiết kế) — không sync theo GitHub, nên không còn gọi users/{login}.
import snapshotRepos from './pinned-repos.json'
import {
  parsePinnedHTML,
  fetchWithTimeout,
  LANGUAGE_COLORS,
  PROFILE_URL
} from './parse-pinned'

const USER = 'slimulv1'
const MAX_PROJECTS = 6 // GitHub giới hạn tối đa 6 repo pin
const TIMEOUT_MS = 8000
const DEFAULT_COLOR = '#8b949e'

const FALLBACK_PROFILE = {
  name: 'Slimu Neet',
  bio: 'Just a plain human with hobbies and a passion for linux & open source.'
}

const fetchJSON = async (url, options = {}) => {
  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'slimu-neet-homepage',
        ...options.headers
      },
      ...options
    },
    TIMEOUT_MS
  )
  if (!res.ok) throw new Error(`GitHub ${res.status} ${url}`)
  return res.json()
}

// map sang shape giống parse-pinned (màu lấy từ map, không có sẵn như scrape)
const mapRESTRepo = repo => {
  const lang = repo.language || 'Unknown'
  return {
    name: repo.name,
    description: repo.description || '',
    language: {
      name: lang,
      color: LANGUAGE_COLORS[lang] || DEFAULT_COLOR
    },
    stars: repo.stargazers_count,
    url: repo.html_url
  }
}

// Tầng 1: scrape HTML profile — đúng các repo đang PIN, không token.
// KHÔNG cache-bust: để GitHub CDN phục vụ (tránh 429 vì ép origin-render).
const fetchPinnedScrape = async () => {
  const res = await fetchWithTimeout(
    PROFILE_URL,
    { headers: { 'User-Agent': 'slimu-neet-homepage (build)', Accept: 'text/html' } },
    TIMEOUT_MS
  )
  if (!res.ok) throw new Error(`profile HTML ${res.status}`)
  const html = await res.text()
  const pinned = parsePinnedHTML(html)
  if (!pinned.length) throw new Error('no pinned items found')
  return pinned
}

// Tầng 2: REST anonymous — repo public non-fork mới cập nhật nhất.
// REST_EXCLUDE: repo chính của site (slimulv1.github.io) không tự hiện card dẫn về chính nó.
const REST_EXCLUDE = ['slimulv1.github.io']
const fetchProjectsREST = async () => {
  const repos = await fetchJSON(
    `https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`
  )
  return repos
    .filter(r => !r.fork && !r.archived && !REST_EXCLUDE.includes(r.name))
    .slice(0, MAX_PROJECTS)
    .map(mapRESTRepo)
}

export async function fetchGitHubData() {
  let projects = null
  let source = ''

  try {
    projects = await fetchPinnedScrape()
    source = 'github-profile-scrape'
  } catch (err) {
    console.warn('[github-data] profile scrape failed -> rest:', err.message)
  }

  if (!projects) {
    try {
      projects = await fetchProjectsREST()
      source = 'github-rest'
    } catch (err) {
      console.warn('[github-data] rest projects failed -> snapshot:', err.message)
    }
  }

  if (!projects) {
    // Tầng 3: snapshot — copy để không vô tình mutate module import
    projects = snapshotRepos.map(r => ({ ...r, language: { ...r.language } }))
    source = 'snapshot-json'
  }

  console.log(`[github-data] source=${source} projects=${projects.length}`)
  return { profile: { ...FALLBACK_PROFILE }, projects, source }
}