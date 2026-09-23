import { useEffect, useState } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useInterfaceLang } from '../../lib/interface-lang'
import { UI } from '../../lib/interface-labels'
import { markEntered } from '../../lib/entered'

const mono =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'M PLUS Rounded 1c', monospace"

// Chòm sao trước cổng trại — tọa độ cố định, nhấp nháy theo delay riêng
const STARS = [
  { left: '12%', top: '18%', size: 3, delay: 0 },
  { left: '22%', top: '32%', size: 2, delay: 0.8 },
  { left: '33%', top: '14%', size: 2, delay: 1.4 },
  { left: '46%', top: '26%', size: 3, delay: 0.4 },
  { left: '58%', top: '12%', size: 2, delay: 1.1 },
  { left: '68%', top: '30%', size: 3, delay: 0.2 },
  { left: '79%', top: '16%', size: 2, delay: 1.6 },
  { left: '88%', top: '34%', size: 3, delay: 0.9 },
  { left: '16%', top: '58%', size: 2, delay: 1.9 },
  { left: '84%', top: '60%', size: 2, delay: 0.6 }
]

/**
 * Màn hình "click to enter": trang web hiện blur mờ phía sau, bấm ở
 * đâu cũng được — overlay tan đi, trang hiện rõ. Cú click này đồng thời
 * là user-gesture để trình duyệt mở khóa nhạc nền (xem BgMusic).
 * Bối cảnh = "cổng bãi trại lúc chạng vạng": chòm sao nhấp nháy + ánh lửa
 * vàng sau lều △.
 */
const EnterOverlay = () => {
  const [entered, setEntered] = useState(false)
  // Text "bấm để vào" theo vòng quay ngôn ngữ giao diện (10s)
  const { lang } = useInterfaceLang()
  // prefers-reduced-motion: tắt mọi nhấp nháy/trôi lặp vô hạn, giữ giao diện tĩnh
  const reduced = useReducedMotion()
  // Bối cảnh: dark = đêm trại (sao nhấp nháy); sáng = ban ngày (hạt nắng tĩnh)
  const isDark = useColorModeValue(false, true)

  const veil = useColorModeValue(
    'rgba(247, 239, 220, 0.8)',
    'rgba(20, 19, 29, 0.86)'
  )
  const textColor = 'camp.text'
  const pillBg = 'camp.card'
  const pillBorder = 'camp.lineStrong'

  // Khóa cuộn trang trong khi overlay đang phủ
  useEffect(() => {
    if (entered) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [entered])

  // Vào trại: mở khóa veil + bắn tín hiệu để dàn dựng choreography reveal
  // (hero, Section cascade, stamp chips — xem lib/entered.js) chạy đúng lúc
  // veil tan, thay vì chạy phía sau lớp mờ.
  const enter = () => {
    markEntered()
    setEntered(true)
  }

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          key="enter-overlay"
          role="button"
          tabIndex={0}
          aria-label="Click to enter"
          data-testid="enter-overlay"
          onClick={enter}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              enter()
            }
          }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: veil,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            cursor: 'pointer'
          }}
        >
          {/* Bầu trời phía sau: dark = 10 ngôi sao nhấp nháy (đêm trại);
              sáng = 4 hạt nắng dịu TĨNH (không có sao ban ngày) */}
          {(isDark ? STARS : STARS.slice(0, 4)).map((s, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              animate={
                isDark
                  ? reduced
                    ? { opacity: 0.55 }
                    : { opacity: [0.15, 0.9, 0.15] }
                  : { opacity: 0.4 }
              }
              transition={
                isDark
                  ? reduced
                    ? { duration: 0 }
                    : {
                        repeat: Infinity,
                        duration: 2.6,
                        delay: s.delay,
                        ease: 'easeInOut'
                      }
                  : { duration: 0 }
              }
              style={{
                position: 'absolute',
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                borderRadius: '50%',
                background: isDark
                  ? 'var(--chakra-colors-camp-ember)'
                  : 'rgba(255, 205, 130, 0.55)',
                boxShadow: isDark
                  ? '0 0 6px var(--chakra-colors-camp-ember)'
                  : '0 0 6px rgba(255, 205, 130, 0.4)'
              }}
            />
          ))}

          {/* Ánh sáng sau lều △ — dark: ánh lửa trại; sáng: làn nắng ban mai */}
          <Box
            position="absolute"
            left="50%"
            top="50%"
            w={['260px', '360px']}
            h={['260px', '360px']}
            transform="translate(-50%, -58%)"
            borderRadius="full"
            css={{
              background: isDark
                ? 'radial-gradient(closest-side, rgba(221,138,46,0.16), rgba(221,138,46,0.05) 55%, transparent 75%)'
                : 'radial-gradient(closest-side, rgba(255,222,150,0.16), rgba(255,222,150,0.05) 55%, transparent 75%)'
            }}
            aria-hidden="true"
          />

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={4}
            position="relative"
          >
            {/* △ nổi — motif Yuru Camp của trang (tĩnh khi reduced-motion) */}
            <motion.span
              animate={reduced ? { y: 0 } : { y: [0, -8, 0] }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
              }
              style={{
                color: 'var(--chakra-colors-camp-ember)',
                fontSize: 34,
                lineHeight: 1,
                textShadow:
                  '0 0 18px var(--chakra-colors-camp-ember), 0 0 44px rgba(221,138,46,0.5)'
              }}
              aria-hidden="true"
            >
              △
            </motion.span>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <Flex
                as="span"
                alignItems="center"
                columnGap={2}
                border="1.5px solid"
                borderColor={pillBorder}
                bg={pillBg}
                px={7}
                py={3}
                borderRadius="full"
                color={textColor}
                boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 14px 30px -14px rgba(120,90,40,0.4)"
                css={{ backdropFilter: 'blur(10px)' }}
                transition="border-color 0.2s"
                _hover={{ borderColor: 'camp.teal' }}
              >
                <Text
                  fontFamily={mono}
                  fontSize={{ base: 'md', sm: 'lg' }}
                  letterSpacing="wider"
                  userSelect="none"
                >
                  {UI.clickToEnter[lang]}
                </Text>
                <motion.span
                  animate={reduced ? { opacity: 1 } : { opacity: [1, 0, 1] }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { repeat: Infinity, duration: 1.1 }
                  }
                  style={{ color: 'var(--chakra-colors-camp-ember)', fontFamily: mono, fontSize: 18 }}
                  aria-hidden="true"
                >
                  ▍
                </motion.span>
              </Flex>
            </motion.div>

            <Text
              color={textColor}
              fontSize={{ base: 'xs', sm: 'sm' }}
              opacity={0.75}
              fontWeight={700}
              textAlign="center"
              userSelect="none"
            >
              {UI.gateHint[lang]}
            </Text>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EnterOverlay