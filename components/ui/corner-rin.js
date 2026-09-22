import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Text,
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'

// Lời chào theo khung giờ trong ngày, mỗi khung có 3 ngôn ngữ (3 câu mỗi ngôn ngữ)
const GREETINGS = {
  morning: {
    vi: ['Buổi sáng tốt lành', 'Trà sáng nhé?', 'Đi cắm trại thôi'],
    en: ['Good morning!', 'A cup of tea?', "Let's go camping!"],
    ja: ['おはよう', 'お茶にする？', 'キャンプ行こう！']
  },
  afternoon: {
    vi: ['Chào buổi chiều', 'Thời tiết đẹp ghê', 'Nghỉ ngơi chút nào'],
    en: ['Good afternoon!', 'The weather is so nice.', 'Take a little break.'],
    ja: ['こんにちは', '天気がいいね', 'ちょっと休もう']
  },
  evening: {
    vi: ['Buổi tối vui vẻ', 'Đốt lửa trại nha', 'Nghe nhạc nền đi ~'],
    en: ['Good evening!', 'Campfire time.', 'Enjoy the background music ~'],
    ja: ['こんばんは', '焚き火の時間だよ', '音楽を聴こう〜']
  },
  night: {
    vi: ['Ngủ ngon nhé', 'Còn thức à?', 'Mai gặp lại nhé'],
    en: ['Good night...', 'Still awake?', 'See you tomorrow!'],
    ja: ['おやすみ...', 'まだ起きてるの？', 'また明日ね']
  }
}

const slotOf = h =>
  h < 5
    ? 'night'
    : h < 11
      ? 'morning'
      : h < 17
        ? 'afternoon'
        : h < 22
          ? 'evening'
          : 'night'

// Vòng lặp trong khung giờ: vi[0..2] → en[0..2] → ja[0..2] → quay lại vi[0]
const pool = slot => [
  ...GREETINGS[slot].vi,
  ...GREETINGS[slot].en,
  ...GREETINGS[slot].ja
]

/**
 * Nhân vật góc: Rin (Yuru Camp△) cố định góc dưới-phải — hover
 * thấy tooltip "Say hi" trên đầu, click → bounce + speech bubble chào theo
 * khung giờ trong ngày, bấm liên tục chạy hết câu Việt → Anh → Nhật → lại Việt.
 * Rin có idle-float nhẹ ("thở") và entrance mượt khi load; mọi chuyển động
 * tôn trọng prefers-reduced-motion.
 *
 * Ngoài ra lắng nghe sự kiện hover từ phần Projects (CustomEvent rìn:peek / rin:clear):
 * hover vào card project → bubble hiện tên project đó (「tên」), rời chuột → ẩn ngay.
 */
const CornerRin = () => {
  const [bubble, setBubble] = useState(null)
  // Render-reactive (không phải ref): idle-float/entrance/sparkle quyết định theo
  // prefers-reduced-motion ngay ở render, không bị chờ mount.
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const controls = useAnimationControls()
  const idx = useRef(0)
  const slotRef = useRef(null)
  const bubbleTimer = useRef(null)
  // Entrance chạy sau mount 1 frame: server và client hydrate cùng render
  // opacity 0 (khớp style) → setMounted(true) mới animate — tránh React
  // hydration mismatch warning khi framer lỡ animate giữa SSR và hydrate.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const imgH = useBreakpointValue({ base: 72, sm: 96, md: 128 })
  const inset = useBreakpointValue({ base: '8px', sm: '16px', md: '16px' })
  const bubbleBg = useColorModeValue(
    'rgba(255, 252, 247, 0.88)', // light: sữa ấm trong suốt → blur(10px) hiện rõ, hòa nền cream #f0e7db
    'rgba(23, 25, 42, 0.92)'
  )
  const bubbleBorder = useColorModeValue(
    'rgba(0, 0, 0, 0.5)',
    'rgba(255, 255, 255, 0.55)'
  )
  // Light: double-outline manga — [viền ink 2px] + [gap trắng 3px] + [viền ngoài ink 6px] + bóng mềm.
  // Dark: giữ nguyên ring màu thân + bóng cũ.
  const bubbleShadow = useColorModeValue(
    '0 0 0 3px rgba(255,255,255,0.95), 0 0 0 6px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.7)',
    '0 0 0 3px rgba(23,25,42,0.92), 0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)'
  )
  const bubbleText = useColorModeValue('#3d342a', 'whiteAlpha.900')
  const bubbleSheen = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0) 60%)',
    'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 55%)'
  )

  // ms mặc định 3000 — lời chào (greet/auto) giữ nguyên như cũ; riêng peek hover ngắn hơn
  const showBubble = (text, ms = 3000) => {
    setBubble(text)
    clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), ms)
  }

  const greet = () => {
    // bounce — cùng keyframes nade-bounce của nadeshiko, thêm xoay nhẹ cho "bồng bềnh"
    if (!reduced) {
      controls.start({
        y: [0, -14, 0, -5, 0],
        scale: [1, 1.06, 0.97, 1.02, 1],
        rotate: [0, -3, 2, 0],
        transition: { duration: 0.55, ease: 'easeInOut' }
      })
    }
    const slot = slotOf(new Date().getHours())
    const p = pool(slot)
    // sang khung giờ mới → bắt đầu lại từ câu Việt đầu tiên của khung này
    if (slotRef.current !== slot) {
      slotRef.current = slot
      idx.current = 0
    } else {
      idx.current = (idx.current + 1) % p.length
    }
    showBubble(p[idx.current])
  }

  useEffect(() => {
    // tự chào 1 lần: ngẫu nhiên một câu VI trong khung giờ hiện tại (như nadeshiko)
    const t = setTimeout(() => {
      const slot = slotOf(new Date().getHours())
      slotRef.current = slot
      idx.current = Math.floor(Math.random() * GREETINGS[slot].vi.length)
      showBubble(pool(slot)[idx.current])
    }, 500)
    return () => {
      clearTimeout(t)
      clearTimeout(bubbleTimer.current)
      controls.stop()
    }
  }, [])

  // Lắng nghe hover từ Projects: hover card → bubble hiện tên; rời → ẩn ngay.
  // Dùng CustomEvent window (không cần prop, không đụng layout/ctx).
  useEffect(() => {
    const onPeek = e => {
      const name = e && e.detail
      if (name) showBubble(`「${name}」`, 2500)
    }
    const onClear = () => {
      clearTimeout(bubbleTimer.current)
      setBubble(null)
    }
    window.addEventListener('rin:peek', onPeek)
    window.addEventListener('rin:clear', onClear)
    return () => {
      window.removeEventListener('rin:peek', onPeek)
      window.removeEventListener('rin:clear', onClear)
      clearTimeout(bubbleTimer.current)
    }
  }, [])

  return (
    <Box
      position="fixed"
      right={inset}
      bottom={`calc(${inset} + env(safe-area-inset-bottom))`}
      zIndex={30}
      css={{
        '& button:focus-visible': {
          outline: '2px solid #73daca',
          outlineOffset: 4,
          borderRadius: 12
        },
        // tooltip "Say hi" hiện trên đầu khi hover
        '& [data-tooltip]::before': {
          content: 'attr(data-tooltip)',
          marginBottom: '8px',
          padding: '6px 12px',
          borderRadius: 10,
          background: bubbleBg,
          color: bubbleText,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(8px)',
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s ease, transform 0.2s ease, visibility 0.2s',
          pointerEvents: 'none',
          zIndex: 32
        },
        '& [data-tooltip]::after': {
          content: "''",
          marginBottom: '-2px',
          border: '5px solid transparent',
          borderTopColor: bubbleBg,
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(8px)',
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s ease, transform 0.2s ease, visibility 0.2s',
          pointerEvents: 'none',
          zIndex: 32
        },
        '& [data-tooltip]:hover::before, & [data-tooltip]:hover::after': {
          opacity: 1,
          visibility: 'visible',
          transform: 'translateX(-50%) translateY(0)'
        }
      }}
    >
      <motion.div
        initial={
          reduced || mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
        }
        animate={
          reduced
            ? { opacity: 1, y: 0 }
            : mounted
              ? {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: 'easeOut' }
                }
              : { opacity: 0, y: 24 }
        }
        whileHover={{
          y: -6,
          transition: { type: 'spring', stiffness: 220, damping: 16 }
        }}
        whileTap={{
          scale: 0.98,
          transition: { type: 'spring', stiffness: 220, damping: 16 }
        }}
      >
        <motion.button
          animate={controls}
          type="button"
          data-tooltip="Say hi"
          aria-label="Nói chuyện với Rin"
          onClick={greet}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              greet()
            }
          }}
          style={{
            position: 'relative',
            padding: 0,
            border: 0,
            background: 'none',
            cursor: 'pointer',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
          }}
        >
          {/* idle-float: Rin "thở" nhẹ liên tục; lớp riêng quanh img nên không
              xung đột với bounce (controls trên button) hay hover/tap */}
          <motion.div
            animate={reduced ? { y: 0 } : { y: [0, -3, 0] }}
            transition={
              reduced
                ? undefined
                : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ willChange: 'transform' }}
          >
            <img
              src="/images/rin.png"
              alt="Rin — Yuru Camp△"
              draggable={false}
              decoding="async"
              style={{ display: 'block', height: imgH, width: 'auto' }}
            />
          </motion.div>
          <AnimatePresence>
            {bubble && (
              <motion.div
                key="rin-bubble"
                initial={{ opacity: 0, scale: 0.6, y: 14, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.94,
                  y: 6,
                  rotate: 0,
                  transition: { duration: 0.16, ease: 'easeOut' }
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                style={{
                  position: 'absolute',
                  right: 'calc(100% + 14px)',
                  bottom: '35%',
                  transformOrigin: 'right center',
                  pointerEvents: 'none',
                  zIndex: 31
                }}
              >
                <Box
                  position="relative"
                  maxWidth={240}
                  borderRadius="18px 18px 18px 6px"
                  bg={bubbleBg}
                  border="2px solid"
                  borderColor={bubbleBorder}
                  backdropFilter="blur(10px)"
                  boxShadow={bubbleShadow}
                  px={4}
                  py={2.5}
                  // Mobile hẹp: cho wrap (tên repo dài không bao giờ tràn màn hình);
                  // từ sm trở lên giữ nowrap 1 dòng như cũ.
                  whiteSpace={{ base: 'normal', sm: 'nowrap' }}
                  css={{
                    // đuôi bong bóng: lớp viền
                    '&::before': {
                      content: "''",
                      position: 'absolute',
                      right: '-12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderTop: '9px solid transparent',
                      borderBottom: '9px solid transparent',
                      borderLeft: `12px solid ${bubbleBorder}`,
                      zIndex: -10
                    },
                    // đuôi bong bóng: lớp lõi (cùng màu thân, tạo viền cho đuôi)
                    '&::after': {
                      content: "''",
                      position: 'absolute',
                      right: '-9px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderTop: '7.5px solid transparent',
                      borderBottom: '7.5px solid transparent',
                      borderLeft: `10px solid ${bubbleBg}`,
                      zIndex: -10
                    }
                  }}
                >
                  {/* highlight mềm phía trên thân bubble */}
                  <Box
                    position="absolute"
                    inset={0}
                    borderRadius="inherit"
                    background={bubbleSheen}
                    pointerEvents="none"
                  />
                  {/* kirakira ✦ — chấm sao anime góc bubble, pop theo bubble (decor, không chặn click) */}
                  {!reduced && (
                    <motion.span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: -11,
                        right: -7,
                        fontSize: 15,
                        lineHeight: 1,
                        color: '#f0bc4e',
                        pointerEvents: 'none',
                        zIndex: 32
                      }}
                      initial={{ scale: 0, rotate: -40, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 16,
                        delay: 0.06
                      }}
                    >
                      ✦
                    </motion.span>
                  )}
                  <Text
                    fontSize="13.5px"
                    lineHeight="1.35"
                    fontWeight="semibold"
                    color={bubbleText}
                    userSelect="none"
                  >
                    {/* key=bubble → mỗi lần đổi nội dung remount <span>, chạy micro-fade 0.18s mượt */}
                    <motion.span
                      key={bubble}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      style={{ display: 'inline-block' }}
                    >
                      {bubble}
                    </motion.span>
                  </Text>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </Box>
  )
}

export default CornerRin
