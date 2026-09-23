import { useEffect, useRef } from 'react'

const TRACK_SRC = '/music/loch-to-tabibito.flac'
const TRACK_FALLBACK_SRC = '/music/loch-to-tabibito.m4a'

/**
 * Nhạc nền tự chạy, không có bất kỳ điều khiển hiển thị nào.
 *
 * Lưu ý về chính sách autoplay của trình duyệt: hầu hết trình duyệt
 * (Chrome/Firefox/Safari) chặn phát âm thanh tự động khi vào trang —
 * người dùng phải tương tác ít nhất 1 lần (click/tap/phím bất kỳ đâu).
 * Vì vậy:
 *  1. Thử play ngay khi load — nếu trình duyệt cho phép (whitelist,
 *     engagement cao) thì nhạc chạy từ giây đầu.
 *  2. Nếu bị chặn: mở khóa bằng *tương tác đầu tiên bất kỳ đâu trên
 *     trang* (pointerdown/keydown/touchstart) — không hiện nút gì cả.
 */
const BgMusic = () => {
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // 0.75 = tăng từ 0.45 lên 0.75 (volume nhạc nền theo yêu cầu)
    audio.volume = 0.75

    let unlocked = false

    const tryPlay = () => {
      if (unlocked) return
      audio.play().then(() => {
        unlocked = true
        cleanup()
      }).catch(() => {
        // Bị chặn bởi autoplay policy — chờ tương tác người dùng
      })
    }

    const events = ['pointerdown', 'keydown', 'touchstart', 'click']
    const cleanup = () => {
      events.forEach(e =>
        window.removeEventListener(e, tryPlay, { capture: true })
      )
    }
    events.forEach(e => window.addEventListener(e, tryPlay, { capture: true }))

    // 1. Thử autoplay trực tiếp
    tryPlay()

    return () => cleanup()
  }, [])

  return (
    <audio ref={audioRef} loop preload="metadata" aria-hidden="true">
      {/* FLAC lossless (GH Pages); fallback AAC cho nền tảng giới hạn
          dung lượng file (Cloudflare Pages: 25MB/file) */}
      <source src={TRACK_SRC} type="audio/flac" />
      <source src={TRACK_FALLBACK_SRC} type="audio/mp4" />
    </audio>
  )
}

export default BgMusic