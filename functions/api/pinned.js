// CF Pages Function — nguồn "live" cho phần Projects.
// Proxy + parse các repo đang PIN trên profile github.com/<USER> tại edge (server-side),
// trả JSON kèm Access-Control-Allow-Origin: * để cả trang GH Pages (cross-origin) đọc được.
// Không cần GitHub token — quét đúng phần Pinned trên profile như yêu cầu.
//
// Parser dùng chung với build + client (lib/parse-pinned.js) → một chỗ bảo trì khi GitHub đổi HTML.
import { parsePinnedHTML, PROFILE_URL } from '../lib/parse-pinned'

export async function onRequestGet() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json'
  }
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10000)
    const res = await fetch(PROFILE_URL, {
      headers: { 'User-Agent': 'slimu-neet-homepage (cf pages function)' },
      signal: ctrl.signal
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`github profile HTTP ${res.status}`)
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
    return new Response(
      JSON.stringify({ ok: false, error: String((err && err.message) || err) }),
      { headers }
    )
  }
}