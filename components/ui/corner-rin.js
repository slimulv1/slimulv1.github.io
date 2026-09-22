import { useEffect, useRef, useState } from 'react'
import { Box, Text, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'

const GREETINGS = {
  morning: ['Buổi sáng tốt lành', 'Trà sáng nhé?', 'Đi cắm trại thôi'],
  afternoon: ['Chào buổi chiều', 'Thời tiết đẹp ghê', 'Nghỉ ngơi chút nào'],
  evening: ['Buổi tối vui vẻ', 'Đốt lửa trại nha', 'Nghe nhạc nền đi ~'],
  night: ['Ngủ ngon nhé', 'Còn thức à?', 'Mai gặp lại nhé']
}

/**
 * Nhân vật góc: Rin (Yuru Camp△) cố định góc dưới-phải (theo vị trí rin.png
 * bên KabosuNeko), mang đúng hiệu ứng/chức năng của nadeshiko.png — click →
 * bounce + speech bubble chào theo giờ trong ngày, tự chào 1 lần sau khi load.
 */
const CornerRin = () => {
  const [bubble, setBubble] = useState(null)
  const controls = useAnimationControls()
  const bubbleTimer = useRef(null)
  const reduced = useRef(false)

  const imgH = useBreakpointValue({ base: 72, sm: 96, md: 128 })
  const inset = useBreakpointValue({ base: '8px', sm: '16px', md: '16px' })
  const bubbleBg = useColorModeValue('whiteAlpha.900', 'rgba(23, 25, 42, 0.92)')
  const bubbleBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const bubbleText = useColorModeValue('gray.800', 'whiteAlpha.900')

  const slotOf = h =>
    h < 5 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'afternoon' : h < 22 ? 'evening' : 'night'

  const greet = () => {
    // bounce — cùng keyframes nade-bounce của nadeshiko
    if (!reduced.current) {
      controls.start({
        y: [0, -14, 0, -5, 0],
        scale: [1, 1.06, 0.97, 1.02, 1],
        transition: { duration: 0.55, ease: 'easeInOut' }
      })
    }
    const lines = GREETINGS[slotOf(new Date().getHours())]
    setBubble(lines[Math.floor(Math.random() * lines.length)])
    clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), 3000)
  }

  useEffect(() => {
    reduced.current =
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false
    const t = setTimeout(greet, 500) // tự chào 1 lần, như nadeshiko
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
          aria-label="Nói chuyện với Rin"
          title="Say hi, Rin!"
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