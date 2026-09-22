// Parser profile-github DÙNG CHUNG cho 3 môi trường:
//   - CF Pages Function (Workers)     → functions/api/pinned.js
//   - Build (Node)                    → lib/github-data.js (getStaticProps)
//   - Client (trình duyệt)            → lib/live-pinned.js
// Thuần regex + string, KHÔNG phụ thuộc DOM → một parser duy nhất, hành vi nhất quán,
// chỉ cần bảo trì MỘT chỗ khi GitHub đổi markup. Không dùng token.

export const USER = 'slimulv1'
export const PROFILE_URL = `https://github.com/${USER}`
export const DEFAULT_COLOR = '#8b949e'

// Màu linguist dùng khi HTML không kèm màu inline (REST fallback + normalize)
export const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Lua: '#000080',
  Vim: '#199f4b',
  'Vim Script': '#199f4b',
  Makefile: '#427819',
  Assembly: '#6E4C13',
  Zig: '#ec915c',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Nix: '#7e7eff',
  R: '#198CE7',
  Dockerfile: '#384d54',
  PowerShell: '#012456'
}

// fetch có timeout bằng AbortController + setTimeout.
// (KHÔNG dùng AbortSignal.timeout: trình duyệt cũ Safari < 16.4 không hỗ trợ → TypeError,
// trong khi private mode trên Safari cũ còn ném AbortError bí hiểm. AbortController thì phổ quát.)
export function fetchWithTimeout(url, options = {}, ms = 8000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(timer))
}

export const decodeEntities = s =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

// Bình thường hóa field của 1 repo về đúng shape card cần — mọi nguồn (scrape/REST/snapshot)
// đều đi qua đây để không có field thiếu sót đổ vào React.
export const normalizeRepo = repo => ({
  name: String((repo && repo.name) || '').trim(),
  description: String((repo && repo.description) || '').trim(),
  language: {
    name: (repo && repo.language && repo.language.name) || 'Unknown',
    color:
      (repo && repo.language && repo.language.color) ||
      LANGUAGE_COLORS[repo && repo.language && repo.language.name] ||
      DEFAULT_COLOR
  },
  stars: Number((repo && repo.stars) || 0),
  url:
    (repo && repo.url) ||
    (repo && repo.name ? `${PROFILE_URL}/${repo.name}` : PROFILE_URL)
})

// Parse phần `<ol class="...pinned-items-reorder-list">` của profile GitHub (HTML hiện tại):
// <li class="...pinned-item-list-item js-pinned-item-list-item ...">
//   <a href="/<user>/<repo>" class="Link ... text-bold ..."><span class="repo">Tên</span></a>
//   <p class="pinned-item-desc ...">Mô tả</p>
//   <p class="mb-0 mt-2 f6 color-fg-muted">
//     <span class="repo-language-color" style="background-color: #xxxxxx"></span>
//     <span itemprop="programmingLanguage">C</span>
//     <a class="pinned-item-meta ..."><svg star>...</svg> <N>   ← stargazers là meta đầu tiên
//
// Bỏ qua "li ảo" (template của UI kéo-thả) vì chúng không chứa `<a href="/owner/repo">`.
export function parsePinnedHTML(html) {
  const out = []
  const liRe = /<li[^>]*pinned-item-list-item[^>]*>([\s\S]*?)<\/li>/g
  let m
  while ((m = liRe.exec(html))) {
    const li = m[1]
    // Link repo đầu tiên trong card (href đang ở dạng relative "/owner/repo")
    const hrefM = li.match(/<a[^>]*href="\/([^"/]+\/[^"/]+)"/)
    if (!hrefM) continue
    const slug = hrefM[1].split('/').pop()
    const nameM = li.match(/<span class="repo">([^<]+)<\/span>/)
    const name = (nameM ? nameM[1] : slug).trim()
    const descM = li.match(/<p class="pinned-item-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/)
    const desc = descM ? decodeEntities(descM[1].replace(/<[^>]+>/g, '')).trim() : ''
    const langM = li.match(/itemprop="programmingLanguage">([^<]+)<\/span>/)
    const lang = langM ? langM[1].trim() : 'Unknown'
    const colorM = li.match(/repo-language-color[\s\S]{0,120}?background-color:\s*([^;"\s]+)/)
    const starsM = li.match(/pinned-item-meta[^>]*>[\s\S]*?<\/svg>\s*([\d.,]+)/)
    const stars = starsM ? parseInt(starsM[1].replace(/,/g, ''), 10) : 0
    out.push(
      normalizeRepo({
        name,
        description: desc,
        language: { name: lang, color: colorM ? colorM[1] : undefined },
        stars,
        url: `https://github.com/${hrefM[1]}`
      })
    )
  }
  return out
}