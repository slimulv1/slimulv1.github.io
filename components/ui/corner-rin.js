import { useEffect, useRef, useState } from 'react'
import { Box, Text, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'
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
  h < 5 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'afternoon' : h < 22 ? 'evening' : 'night'

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
 */
const CornerRin = () => {
  const [bubble, setBubble] = useState(null)
  const controls = useAnimationControls()
  const idx = useRef(0)
  const slotRef = useRef(null)
  const bubbleTimer = useRef(null)
  const reduced = useRef(false)

  const imgH = useBreakpointValue({ base: 72, sm: 96, md: 128 })
  const inset = useBreakpointValue({ base: '8px', sm: '16px', md: '16px' })
  const bubbleBg = useColorModeValue('rgba(255, 255, 255, 0.92)', 'rgba(23, 25, 42, 0.92)')
  const bubbleBorder = useColorModeValue('rgba(0, 0, 0, 0.18)', 'rgba(255, 255, 255, 0.24)')
  const bubbleText = useColorModeValue('gray.800', 'whiteAlpha.900')
  const bubbleSheen = useColorModeValue(
    'linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0) 55%)',
    'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 55%)'
  )

  const showBubble = text => {
    setBubble(text)
    clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), 3000)
  }

  const greet = () => {
    // bounce — cùng keyframes nade-bounce của nadeshiko
    if (!reduced.current) {
      controls.start({
        y: [0, -14, 0, -5, 0],
        scale: [1, 1.06, 0.97, 1.02, 1],
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
    reduced.current =
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false
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

  return (
    <Box
      position="fixed"
      right={inset}
      bottom={inset}
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
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
          <img
            src="/images/rin.png"
            alt="Rin — Yuru Camp△"
            draggable={false}
            decoding="async"
            style={{ display: 'block', height: imgH, width: 'auto' }}
          />
          <AnimatePresence>
            {bubble && (
              <motion.div
                key="rin-bubble"
                initial={{ opacity: 0, scale: 0.5, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 12 }}
                transition={{ type: 'spring', stiffness: 340, damping: 26 }}
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
                  border="1px solid"
                  borderColor={bubbleBorder}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)"
                  px={4}
                  py={2.5}
                  whiteSpace="nowrap"
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
                  <Text fontSize="13.5px" lineHeight="1.35" fontWeight="semibold" color={bubbleText} userSelect="none">
                    {bubble}
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