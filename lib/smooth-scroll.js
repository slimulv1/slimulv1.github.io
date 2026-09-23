import Lenis from 'lenis'

/**
 * Cuộn mượt chuẩn hiện đại (Lenis 1.x — chuẩn de-facto 2025–26):
 * lerp mượt mọi nguồn cuộn mà KHÔNG phá native scroll API (framer-motion
 * useScroll/useTransform, TrailProgress vẫn tính từ window scroll bình thường).
 *
 * Lenis tự tôn trọng prefers-reduced-motion (kiểm tra bên trong), nhưng ta
 * chủ động kiểm tra luôn để không tạo instance thừa khi người dùng giảm
 * chuyển động.
 *
 * Singleton toàn cục: layout main.js giữ qua mọi route (SPA) → init 1 lần,
 * destroy khi unmount (SSR an toàn: các hàm đều guard typeof window).
 */
let lenis = null
let rafId = 0

const tick = time => {
  if (lenis) lenis.raf(time)
  rafId = requestAnimationFrame(tick)
}

export const initSmoothScroll = () => {
  if (typeof window === 'undefined') return
  if (lenis) return lenis
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6
  })
  rafId = requestAnimationFrame(tick)
  return lenis
}

export const destroySmoothScroll = () => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
  if (lenis) {
    lenis.destroy()
    lenis = null
  }
}