import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { flushSync } from 'react-dom'
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { SunIcon, MoonIcon } from '@chakra-ui/icons'

/**
 * ThemeToggleButton — đổi ngày ⇄ đêm trại.
 *
 * Công nghệ mới nhất: View Transitions API (Chrome/Edge 111+, Safari 18+).
 * Bấm nút → toàn trang chuyển đổi theo hình tròn lan từ vị trí nút bấm
 * (--vt-x/--vt-y ghi vào <html>, CSS trong view-transition-styles.js).
 * Chakra v2 ghi class color-mode + data-theme ĐỒNG BỘ trong toggleColorMode,
 * nên bọc trong flushSync() → startViewTransition bắt đúng snapshot 2 bối
 * cảnh (ngày → đêm / đêm → ngày).
 *
 * Fallback: trình duyệt chưa hỗ trợ hoặc prefers-reduced-motion → toggle
 * trực tiếp (không transition). Icon vẫn giữ micro-animation trượt+xoay cũ.
 */
const ThemeToggleButton = () => {
  const { toggleColorMode } = useColorMode()
  // prefers-reduced-motion: bỏ trượt lên/xuống khi đổi icon, chỉ còn fade
  const reduced = useReducedMotion()

  const handleToggle = e => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const doc = typeof window !== 'undefined' ? window.document : null
    if (doc && !reduce && typeof doc.startViewTransition === 'function') {
      const r = e.currentTarget.getBoundingClientRect()
      doc.documentElement.style.setProperty(
        '--vt-x',
        `${Math.round(r.left + r.width / 2)}px`
      )
      doc.documentElement.style.setProperty(
        '--vt-y',
        `${Math.round(r.top + r.height / 2)}px`
      )
      doc.startViewTransition(() => {
        flushSync(() => toggleColorMode())
      })
    } else {
      toggleColorMode()
    }
  }

  return (
    <AnimatePresence mode='wait' initial={false}>
      <motion.div
        style={{ display: 'inline-block', position: 'relative' }}
        key={useColorModeValue('light', 'dark')}
        initial={{ y: reduced ? 0 : -20, rotate: reduced ? 0 : -45, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        exit={{ y: reduced ? 0 : 20, rotate: reduced ? 0 : 45, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <IconButton
          aria-label="Toggle theme"
          colorScheme={useColorModeValue('teal', 'orange')}
          icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
          onClick={handleToggle}
          // Chặn trì hoãn 300ms của double-tap-zoom trên mobile Safari
          touchAction="manipulation"
          // Vùng chạm ≥44px (WCAG 2.5.8): IconButton mặc định 40px → nới
          // 44px rồi margin âm -2px HOÀN LẠI, nên navbar giữ nguyên chiều cao.
          minW="44px"
          minH="44px"
          m="-2px"
        ></IconButton>
      </motion.div>
    </AnimatePresence>
  )
}

export default ThemeToggleButton