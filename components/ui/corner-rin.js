import { useEffect, useRef, useState } from 'react'
import { Box, Text, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'

// Chuỗi chào tuần tự: chạy hết câu tiếng Việt → tiếng Anh → tiếng Nhật → quay lại Việt
const SEQUENCE = [
  // ——— tiếng Việt ———
  'Buổi sáng tốt lành', 'Trà sáng nhé?', 'Đi cắm trại thôi',
  'Chào buổi chiều', 'Thời tiết đẹp ghê', 'Nghỉ ngơi chút nào',
  'Buổi tối vui vẻ', 'Đốt lửa trại nha', 'Nghe nhạc nền đi ~',
  'Ngủ ngon nhé', 'Còn thức à?', 'Mai gặp lại nhé',
  // ——— tiếng Anh ———
  'Good morning!', 'A cup of tea?', "Let's go camping!",
  'Good afternoon!', 'The weather is so nice.', 'Take a little break.',
  'Good evening!', 'Campfire time.', 'Enjoy the background music ~',
  'Good night...', 'Still awake?', 'See you tomorrow!',
  // ——— tiếng Nhật ———
  'おはよう', 'お茶にする？', 'キャンプ行こう！',
  'こんにちは', '天気がいいね', 'ちょっと休もう',
  'こんばんは', '焚き火の時間だよ', '音楽を聴こう〜',
  'おやすみ...', 'まだ起きてるの？', 'また明日ね'
]

// Vị trí bắt đầu mỗi khung giờ (câu VI đầu tiên của slot) cho lần chào tự động
const SLOT_START = { morning: 0, afternoon: 3, evening: 6, night: 9 }

const slotOf = h =>
  h < 5 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'afternoon' : h < 22 ? 'evening' : 'night'

/**
 * Nhân vật góc: Rin (Yuru Camp△) cố định góc dưới-phải (theo vị trí rin.png
 * bên KabosuNeko), mang đúng hiệu ứng/chức năng của nadeshiko.png — hover
 * thấy tooltip "Say hi" trên đầu, click → bounce + speech bubble chào theo
 * chuỗi tuần tự: hết câu tiếng Việt → tiếng Anh → tiếng Nhật → quay lại Việt.
 */
const CornerRin = () => {
  const [bubble, setBubble] = useState(null)
  const controls = useAnimationControls()
  const idx = useRef(-1)
  const bubbleTimer = useRef(null)
  const reduced = useRef(false)

  const imgH = useBreakpointValue({ base: 72, sm: 96, md: 128 })
  const inset = useBreakpointValue({ base: '8px', sm: '16px', md: '16px' })
  const bubbleBg = useColorModeValue('whiteAlpha.900', 'rgba(23, 25, 42, 0.92)')
  const bubbleBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const bubbleText = useColorModeValue('gray.800', 'whiteAlpha.900')

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
    idx.current = (idx.current + 1) % SEQUENCE.length
    showBubble(SEQUENCE[idx.current])
  }

  useEffect(() => {
    reduced.current =
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false
    // tự chào 1 lần theo khung giờ, như nadeshiko (bắt đầu từ câu VI đầu slot)
    const t = setTimeout(() => {
      idx.current = SLOT_START[slotOf(new Date().getHours())]
      showBubble(SEQUENCE[idx.current])
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
      lineHeight={0}
      css={{
        '& button:focus-visible': {
          outline: '2px solid #73daca',
          outlineOffset: 4,
          borderRadius: 12
        },
        // tooltip "Say hi" trên đầu — đúng như nadeshiko bên KabosuNeko
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
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  right: 'calc(100% + 12px)',
                  bottom: '35%',
                  maxWidth: 240,
                  padding: '10px 16px',
                  borderRadius: 16,
                  background: bubbleBg,
                  border: '1px solid',
                  borderColor: bubbleBorder,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 31
                }}
              >
                <Text fontSize="13px" fontWeight="semibold" color={bubbleText} userSelect="none">
                  {bubble}
                </Text>
                {/* mũi tên trỏ về phía Rin */}
                <Box
                  position="absolute"
                  top="50%"
                  right="-7px"
                  transform="translateY(-50%)"
                  w={0}
                  h={0}
                  border="8px solid transparent"
                  borderLeft="8px solid"
                  borderLeftColor={bubbleBg}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </Box>
  )
}

export default CornerRin