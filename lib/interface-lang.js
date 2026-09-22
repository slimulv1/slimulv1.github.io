import { createContext, useContext, useEffect, useState } from 'react'

// Ngôn ngữ giao diện tự xoay vòng: Việt → Anh → Nhật, mỗi 15 giây.
// Bong bóng chat của Rin (corner-rin) GIỮ NGUYÊN cơ chế riêng của nó —
// không dùng context này. Tên "Slimu Neet" là danh xưng, không dịch.
export const LANGS = ['vi', 'en', 'ja']
export const INTERVAL_MS = 15000

const InterfaceLangContext = createContext({ lang: 'vi' })

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
  return (
    <InterfaceLangContext.Provider value={{ lang }}>
      {children}
    </InterfaceLangContext.Provider>
  )
}
