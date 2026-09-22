// CF Pages Function — nguồn "live" cho phần Projects.
// Proxy + parse các repo đang PIN trên profile github.com/<USER> tại edge (server-side),
// trả JSON kèm Access-Control-Allow-Origin: * để cả trang GH Pages (cross-origin) đọc được.
// Không cần GitHub token — quét đúng phần Pinned trên profile như yêu cầu.
const USER = 'slimulv1'
const GH_PROFILE = `https://github.com/${USER}`
const DEFAULT_COLOR = '#8b949e'

const decodeEntities = s =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

const stripTags = s => s.replace(/<[^>]+>/g, '')

// Parse phần `<ol class="...pinned-items-reorder-list">` — cấu trúc profile GitHub hiện tại:
// <li class="...pinned-item-list-item...">
//   <a href="/<user>/<repo>" class="Link ... text-bold ..."><span class="repo">Tên</span></a>
//   <p class="pinned-item-desc ...">Mô tả</p>
//   <p class="...">
//     <span class="repo-language-color" style="background-color: #xxxxxx"></span>
//     <span itemprop="programmingLanguage">C</span>
//     <a class="pinned-item-meta ..."><svg star>...</svg> <N>  ← stargazers đầu tiên
function parsePinnedHTML(html) {
  const out = []
  const liRe = /<li[^>]*pinned-item-list-item[^>]*>([\s\S]*?)<\/li>/g
  let m
  while ((m = liRe.exec(html))) {
    const li = m[1]
    const href = li.match(/<a[^>]*href="\/([^"/]+\/[^"/]+)"/)
    const nameEl = li.match(/<span class="repo">([^<]+)<\/span>/)
    if (!href) continue
    const name = (nameEl ? nameEl[1] : href[1].split('/').pop()).trim()
    const descEl = li.match(/<p class="pinned-item-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/)
    const desc = descEl ? decodeEntities(stripTags(descEl[1]).trim()) : ''
    const langEl = li.match(/itemprop="programmingLanguage">([^<]+)<\/span>/)
    const lang = langEl ? langEl[1].trim() : 'Unknown'
    const colorM = li.match(/repo-language-color[\s\S]{0,120}?background-color:\s*([^;"\s]+)/)
    // star count: trong <a class="...pinned-item-meta..."> chứa svg star rồi tới số
    const starsM = li.match(/pinned-item-meta[^>]*>[\s\S]*?<\/svg>\s*([\d.,]+)/)
    const stars = starsM ? parseInt(starsM[1].replace(/,/g, ''), 10) : 0
    out.push({
      name,
      description: desc,
      language: { name: lang, color: colorM ? colorM[1] : DEFAULT_COLOR },
      stars,
      url: `https://github.com/${href[1]}`
    })
  }
  return out
}

export async function onRequestGet() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json'
  }
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10000)
    const res = await fetch(GH_PROFILE, {
      headers: { 'User-Agent': 'slimu-neet-homepage (cf pages function)' },
      signal: ctrl.signal
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`github profile HTTP ${res.status}`)
    const html = await res.text()
    const pinned = parsePinnedHTML(html)
    if (!pinned.length) throw new Error('no pinned items found')
    return new Response(
      JSON.stringify({ ok: true, pinned, fetchedAt: new Date().toISOString() }),
      { headers }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String((err && err.message) || err) }),
      { headers }
    )
  }
}