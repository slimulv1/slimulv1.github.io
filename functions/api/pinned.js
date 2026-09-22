// CF Pages Function — nguồn "live" cho phần Projects.
// Proxy + parse các repo đang PIN trên profile github.com/<USER> tại edge (server-side),
// trả JSON kèm Access-Control-Allow-Origin: * để cả trang GH Pages (cross-origin) đọc được.
// Không cần GitHub token — quét đúng phần Pinned trên profile như yêu cầu.
//
// LƯU Ý deploy: Pages Functions (direct upload) CHỈ bundle được file nằm trong functions/.
// Parser dùng chung (lib/parse-pinned.js) phải được COPY vào functions/api/_shared/
// bởi scripts/deploy-cf.sh trước khi deploy — bản thân file này import './_shared/parse-pinned'.
// Nếu thấy "Could not resolve ../lib/parse-pinned" → đang deploy sai cách (xem scripts/deploy-cf.sh).
//
// Chống rate-limit (đã từng dính GitHub 429 vì ép origin-render mỗi request):
//  - KHÔNG cache-bust: để GitHub CDN phục vụ HTML (mới đủ, cũ chỉ vài chục giây).
//  - Kết quả THÀNH CÔNG được edge-cache 30s (s-maxage) → tối đa 1 lần gọi GitHub / 30s.
//  - Retry 1 lần khi 429/5xx/timeout — rate-limit nhất thời.
import { parsePinnedHTML, PROFILE_URL } from './_shared/parse-pinned'

const GITHUB_FETCH_MS = 10000

// GitHub có thể 429/5xx nhất thời (nhất là từ IP datacenter của CF edge) — thử lại 1 lần.
async function fetchGithubProfile() {
  let lastErr = null
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), GITHUB_FETCH_MS)
    try {
      const res = await fetch(PROFILE_URL, {
        headers: { 'User-Agent': 'slimu-neet-homepage (cf pages function)' },
        signal: ctrl.signal
      })
      if (res.ok) return res
      if (attempt === 0 && (res.status === 429 || res.status >= 500)) {
        await new Promise(r => setTimeout(r, 400)) // chờ chút rồi thử lại
        continue
      }
      throw new Error(`github profile HTTP ${res.status}`)
    } catch (err) {
      if (attempt === 0 && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
        lastErr = err
        await new Promise(r => setTimeout(r, 400))
        continue
      }
      throw err
    }
  }
  throw lastErr || new Error('github profile unavailable')
}

export async function onRequestGet() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=0, s-maxage=30', // edge 30s; browser luôn lấy mới
    'Content-Type': 'application/json'
  }
  try {
    const res = await fetchGithubProfile()
    const html = await res.text()
    const pinned = parsePinnedHTML(html)
    // 0 item = markup đổi hoặc profile không có pin — trả lỗi để client giữ dữ liệu cũ
    // (quan trọng: KHÔNG trả ok:true kèm [] vì không phân biệt được "hết pin" vs "parser vỡ").
    if (!pinned.length) throw new Error('no pinned items found')
    return new Response(
      JSON.stringify({ ok: true, pinned, fetchedAt: new Date().toISOString() }),
      { headers }
    )
  } catch (err) {
    // Kết quả lỗi KHÔNG được edge-cache — nếu không, 30s "đóng băng" trạng thái hỏng,
    // mà lẽ ra client phải được phép thử lại (retry + poll 5p + focus).
    return new Response(
      JSON.stringify({ ok: false, error: String((err && err.message) || err) }),
      { headers: { ...headers, 'Cache-Control': 'no-store' } }
    )
  }
}