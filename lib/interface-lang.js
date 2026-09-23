import { createContext, useContext, useEffect, useRef, useState } from 'react'

// Ngôn ngữ giao diện tự xoay vòng: Anh ↔ Nhật, mỗi 10 giây.
// Mỗi lần chuyển, provider bắn CustomEvent:
//   - "rin:lang"   kèm { name, lang } — CornerRin hiện tên ngôn ngữ (viết bằng
//     chính ngôn ngữ đó) trên đầu Rin + đồng bộ ngôn ngữ cho bubble chào.
//   - "rin:greet"  kèm { lang, slot } — CornerRin TỰ hiện câu chào theo đúng
//     ngôn ngữ mới (không cần bấm nút).
// Bong bóng chat của Rin (corner-rin) GIỮ NGUYÊN cơ chế riêng của nó —
// không dùng context này, chỉ nghe sự kiện. Tên "Slimu Neet" là danh xưng, không dịch.
export const LANGS = ['en', 'ja']
export const INTERVAL_MS = 10000

// Tên ngôn ngữ — viết bằng chính ngôn ngữ đó (thông báo khi xoay vòng)
export const LANG_SELF_NAME = {
  en: 'English',
  ja: '日本語'
}

// Khung giờ trong ngày cho lời chào của Rin — đặt chung chỗ này vì provider
// (bắn rin:greet) và corner-rin (bấm nút / tự chào) đều cần.
export const slotOf = h =>
  h < 5
    ? 'night'
    : h < 11
      ? 'morning'
      : h < 17
        ? 'afternoon'
        : h < 22
          ? 'evening'
          : 'night'

const InterfaceLangContext = createContext({ lang: LANGS[0] })

export const useInterfaceLang = () => useContext(InterfaceLangContext)

export const InterfaceLangProvider = ({ children }) => {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(
      () => setIdx(i => (i + 1) % LANGS.length),
      INTERVAL_MS
    )
    return () => clearInterval(t)
  }, [])
  const lang = LANGS[idx]
  // Đồng bộ thuộc tính lang của <html> theo ngôn ngữ đang hiển thị
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])
  // Bắn thông báo mỗi lần CHUYỂN ngôn ngữ (bỏ qua lần render đầu tiên):
  // rin:lang → tên ngôn ngữ trên đầu Rin; rin:greet → Rin tự hiện câu chào
  // theo đúng ngôn ngữ mới (không cần bấm nút).
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rin:lang', {
          detail: { name: LANG_SELF_NAME[lang], lang }
        })
      )
      window.dispatchEvent(
        new CustomEvent('rin:greet', {
          detail: { lang, slot: slotOf(new Date().getHours()) }
        })
      )
    }
  }, [lang])
  return (
    <InterfaceLangContext.Provider value={{ lang }}>
      {children}
    </InterfaceLangContext.Provider>
  )
}