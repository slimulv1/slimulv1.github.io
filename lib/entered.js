import { useEffect, useState } from 'react'

/**
 * Tín hiệu "đã vào trại" (enter gesture) — dùng để dàn dựng choreography:
 * các entrance animation của trang (hero, Section, stamp chips…) chạy ĐÚNG
 * lúc người dùng bấm qua màn che EnterOverlay, thay vì chạy phía sau veil
 * (lỗi cũ: mọi animation chạy ở mount, người dùng chỉ thấy veil fade).
 *
 * Cơ chế:
 *  - EnterOverlay khi click → thêm class `site-entered` vào <html> +
 *    bắn CustomEvent `site:entered` trên window.
 *  - useEntered() lắng nghe sự kiện; nếu class đã có (đã vào từ trước) →
 *    true ngay. Trang KHÔNG có overlay (vd /404) → tự coi như đã vào sau
 *    1 frame (để content 404 không kẹt ẩn vĩnh viễn).
 *
 * Giữ nhất quán SSR/hydration: initial = false ở cả server lẫn client →
 * không gây hydration mismatch khi component animate từ hidden.
 */
export const ENTER_EVENT = 'site:entered'
export const ENTER_CLASS = 'site-entered'

export const markEntered = () => {
  if (typeof window === 'undefined') return
  document.documentElement.classList.add(ENTER_CLASS)
  window.dispatchEvent(new CustomEvent(ENTER_EVENT))
}

export const useEntered = () => {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const on = () => setEntered(true)
    const raf = requestAnimationFrame(() => {
      if (document.documentElement.classList.contains(ENTER_CLASS)) {
        setEntered(true)
        return
      }
      // Không có overlay trên trang (vd /404) → xem như đã vào, chạy reveal
      if (!document.querySelector('[data-testid="enter-overlay"]')) {
        setEntered(true)
      }
    })
    window.addEventListener(ENTER_EVENT, on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener(ENTER_EVENT, on)
    }
  }, [])

  return entered
}