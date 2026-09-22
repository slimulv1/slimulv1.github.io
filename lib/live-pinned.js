// Client-side: tự quét các repo đang PIN trên profile github.com/<USER> lúc trang chạy.
// Không cần GitHub token, không cần rebuild — mỗi lần load trang là quét lại
// (component tự poll 5 phút + refresh khi focus tab).
//
// Nguồn chính: CF Pages Function tự host tại https://slimulv1.pages.dev/api/pinned
//   (proxy + parse server-side, trả JSON kèm Access-Control-Allow-Origin: * nên
//   cả trang GH Pages — cross-origin — đọc được).
// Fallback: vài CORS proxy trả raw HTML, parse bằng CÙNG parser regex (lib/parse-pinned.js).
// Nếu tất cả fail → trả null, caller giữ nguyên dữ liệu build (trang không bao giờ vỡ).
import { normalizeRepo, parsePinnedHTML, fetchWithTimeout, PROFILE_URL } from './parse-pinned'

// Điểm cuối tự host: cùng origin khi đang ở pages.dev, else dùng URL tuyệt đối
// (GH Pages + localhost dev đều gọi cross-origin — function bên pages.dev).
const API_URL =
  typeof window !== 'undefined' && window.location.hostname.endsWith('pages.dev')
    ? '/api/pinned'
    : 'https://slimulv1.pages.dev/api/pinned'

// CORS proxy trả raw HTML (fallback nếu function bận/lỗi). May fail từ một vài mạng —
// giữ nhiều nguồn trong chuỗi vì IP/ISP khác nhau sẽ tới được (đôi lúc cả 2 proxy cũ
// cùng chết — đã thấy 522 — nên có thêm nguồn thứ 3).
const RAW_PROXIES = [
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`
]

const fetchText = async (url, ms = 9000) => {
  const res = await fetchWithTimeout(url, {}, ms)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// --- Nguồn chính: CF Pages Function tự host ---
const fetchFromCF = async () => {
  const res = await fetchWithTimeout(API_URL, {}, 10000)
  if (!res.ok) throw new Error(`cf function HTTP ${res.status}`)
  const json = await res.json()
  // ok:true kèm pinned mảng có item — mới là payload hợp lệ. Nếu function trả lỗi (giữ data cũ
  // vì không phân biệt được "hết pin" vs "parser vỡ") → ném để đi tiếp tầng fallback.
  if (!json || json.ok !== true || !Array.isArray(json.pinned) || !json.pinned.length) {
    throw new Error('cf function: empty/invalid payload')
  }
  return json.pinned.map(normalizeRepo)
}

// Trả về danh sách pinned mới, hoặc null nếu không lấy được (giữ dữ liệu cũ).
export async function fetchLivePinned() {
  // 1) Function tự host — nhanh, ổn định, parse server-side (giữ cả màu ngôn ngữ)
  try {
    return await fetchFromCF()
  } catch (err) {
    console.warn('[live-pinned] cf function unavailable:', err && err.message)
  }
  // 2) Thử lại function sau 1.2s — CF function hay bị 429/trục trặc nhất thời, và các
  //    proxy raw HTML thường xuyên chết (allorigins/codetabs hay 522) nên function là
  //    nguồn sống đáng tin cậy duy nhất. Không để trạng thái lỗi làm trang dính SSR cũ.
  try {
    await new Promise(r => setTimeout(r, 1200))
    return await fetchFromCF()
  } catch (err) {
    console.warn('[live-pinned] cf function retry failed:', err && err.message)
  }
  // 3) CORS proxy raw HTML — parse bằng cùng parser regex
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