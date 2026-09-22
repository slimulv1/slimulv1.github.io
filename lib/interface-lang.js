import { createContext, useContext, useEffect, useRef, useState } from 'react'

// Ngôn ngữ giao diện tự xoay vòng: Anh → Nhật → Việt, mỗi 10 giây.
// Mỗi lần chuyển, provider bắn CustomEvent "rin:lang" kèm tên ngôn ngữ viết
// bằng chính ngôn ngữ đó — CornerRin hiện thông báo trên đầu Rin.
// Bong bóng chat của Rin (corner-rin) GIỮ NGUYÊN cơ chế riêng của nó —
// không dùng context này. Tên "Slimu Neet" là danh xưng, không dịch.
export const LANGS = ['en', 'ja', 'vi']
export const INTERVAL_MS = 10000

// Tên ngôn ngữ — viết bằng chính ngôn ngữ đó (thông báo khi xoay vòng)
export const LANG_SELF_NAME = {
  en: 'English',
  ja: '日本語',
  vi: 'Tiếng Việt'
}

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
  // CornerRin hiện tên ngôn ngữ trên đầu Rin, giống tooltip "Say hi".
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rin:lang', { detail: LANG_SELF_NAME[lang] })
      )
    }
  }, [lang])
  return (
    <InterfaceLangContext.Provider value={{ lang }}>
      {children}
    </InterfaceLangContext.Provider>
  )
}
