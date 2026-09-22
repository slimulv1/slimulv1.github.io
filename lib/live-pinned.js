// Client-side: tự quét các repo đang PIN trên profile github.com/<USER> lúc trang chạy.
// Không cần GitHub token, không cần rebuild — mỗi lần load trang là quét lại.
//
// Nguồn chính: CF Pages Function tự host tại https://slimulv1.pages.dev/api/pinned
//   (proxy + parse server-side, trả JSON kèm Access-Control-Allow-Origin: * nên
//   cả trang GH Pages — cross-origin — đọc được).
// Fallback: vài CORS proxy trả raw HTML, parse bằng DOMParser ngay trong trình duyệt.
// Nếu tất cả fail → trả null, caller giữ nguyên dữ liệu build (trang không bao giờ vỡ).

const USER = 'slimulv1'
const PROFILE_URL = `https://github.com/${USER}`
const DEFAULT_COLOR = '#8b949e'

// Màu mặc định theo tên ngôn ngữ (chỉ dùng khi HTML không kèm màu inline)
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Lua: '#000080',
  Vim: '#199f4b',
  Makefile: '#427819',
  Assembly: '#6E4C13',
  Zig: '#ec915c'
}

// Điểm cuối tự host: cùng origin khi đang ở pages.dev, else dùng URL tuyệt đối
// (GH Pages + localhost dev đều gọi cross-origin — function bên pages.dev).
const API_URL =
  typeof window !== 'undefined' && window.location.hostname.endsWith('pages.dev')
    ? '/api/pinned'
    : 'https://slimulv1.pages.dev/api/pinned'

// CORS proxy trả raw HTML (fallback nếu function bận/lỗi). May fail từ một vài mạng —
// giữ trong chuỗi vì IP/ISP khác nhau sẽ tới được.
const RAW_PROXIES = [
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
]

const fetchText = async (url, ms = 9000) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// Bình thường hóa field giống dữ liệu build (lib/github-data.js)
const normalize = repo => ({
  name: String(repo.name || '').trim(),
  description: String(repo.description || '').trim(),
  language: {
    name: (repo.language && repo.language.name) || 'Unknown',
    color:
      (repo.language && repo.language.color) ||
      LANGUAGE_COLORS[repo.language && repo.language.name] ||
      DEFAULT_COLOR
  },
  stars: Number(repo.stars) || 0,
  url: repo.url || `${PROFILE_URL}/${repo.name}`
})

// --- Parse raw profile HTML bằng DOMParser (dùng cho fallback proxy) ---
export function parsePinnedHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const out = []
  const items = doc.querySelectorAll('li.pinned-item-list-item, li.js-pinned-item-list-item')
  items.forEach(li => {
    const a = li.querySelector(`a[href^="/${USER}/"]`)
    if (!a) return
    const nameEl = li.querySelector('.repo')
    const name = (nameEl ? nameEl : a).textContent.trim()
    const descEl = li.querySelector('.pinned-item-desc')
    const desc = descEl ? descEl.textContent.trim() : ''
    const langEl = li.querySelector('[itemprop="programmingLanguage"]')
    const lang = langEl ? langEl.textContent.trim() : 'Unknown'
    const colorEl = li.querySelector('.repo-language-color')
    let color = ''
    if (colorEl) {
      color = colorEl.style && colorEl.style.backgroundColor
        ? colorEl.style.backgroundColor // trình duyệt chuẩn hóa thành rgb(...)
        : (colorEl.getAttribute('style') || '')
    }
    const starsEl = li.querySelector('a.pinned-item-meta')
    const stars = starsEl
      ? parseInt((starsEl.textContent.match(/\d[\d.,]*/) || ['0'])[0].replace(/,/g, ''), 10)
      : 0
    out.push(
      normalize({
        name,
        description: desc,
        language: { name: lang, color: color || undefined },
        stars,
        url: a.href
      })
    )
  })
  return out
}

// --- Nguồn chính: CF Pages Function tự host ---
const fetchFromCF = async () => {
  const res = await fetch(API_URL, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`cf function HTTP ${res.status}`)
  const json = await res.json()
  if (!json || json.ok !== true || !Array.isArray(json.pinned) || !json.pinned.length) {
    throw new Error('cf function: empty/invalid payload')
  }
  return json.pinned.map(normalize)
}

// Trả về danh sách pinned mới, hoặc null nếu không lấy được (giữ dữ liệu cũ).
export async function fetchLivePinned() {
  // 1) Function tự host — nhanh, ổn định, parse server-side (giữ cả màu ngôn ngữ)
  try {
    return await fetchFromCF()
  } catch (err) {
    console.warn('[live-pinned] cf function unavailable:', err && err.message)
  }
  // 2) CORS proxy raw HTML — parse ngay trên client
  for (const makeUrl of RAW_PROXIES) {
    try {
      const html = await fetchText(makeUrl(PROFILE_URL))
      const parsed = parsePinnedHTML(html)
      if (parsed.length) return parsed
    } catch (err) {
      console.warn('[live-pinned] proxy fallback failed:', err && err.message)
    }
  }
  return null
}