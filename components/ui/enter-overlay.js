import { useEffect, useState } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInterfaceLang } from '../../lib/interface-lang'
import { UI } from '../../lib/interface-labels'

const mono =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace"

/**
 * Màn hình "click to enter": trang web hiện blur mờ phía sau, bấm ở
 * đâu cũng được — overlay tan đi, trang hiện rõ. Cú click này đồng thời
 * là user-gesture để trình duyệt mở khóa nhạc nền (xem BgMusic).
 */
const EnterOverlay = () => {
  const [entered, setEntered] = useState(false)
  // Text "bấm để vào" theo vòng quay ngôn ngữ giao diện (15s)
  const { lang } = useInterfaceLang()

  const veil = useColorModeValue(
    'rgba(240, 231, 219, 0.62)',
    'rgba(17, 18, 35, 0.62)'
  )
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  const pillBg = useColorModeValue('whiteAlpha.700', 'whiteAlpha.100')
  const pillBorder = useColorModeValue('blackAlpha.300', 'whiteAlpha.300')

  // Khóa cuộn trang trong khi overlay đang phủ
  useEffect(() => {
    if (entered) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [entered])

  const enter = () => setEntered(true)

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
            background: veil,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            cursor: 'pointer'
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={4}
          >
            {/* △ nổi — motif Yuru Camp của trang */}
            <motion.span
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{
                color: '#73daca',
                fontSize: 30,
                lineHeight: 1,
                textShadow: '0 0 16px rgba(115, 218, 202, 0.8)'
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
                border="1px solid"
                borderColor={pillBorder}
                bg={pillBg}
                px={7}
                py={3}
                borderRadius="full"
                css={{ backdropFilter: 'blur(10px)' }}
                transition="border-color 0.2s"
                _hover={{ borderColor: 'grassTeal' }}
              >
                <Text
                  fontFamily={mono}
                  fontSize={{ base: 'md', sm: 'lg' }}
                  letterSpacing="wider"
                  color={textColor}
                  userSelect="none"
                >
                  {UI.clickToEnter[lang]}
                </Text>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                  style={{ color: '#73daca', fontFamily: mono, fontSize: 18 }}
                  aria-hidden="true"
                >
                  ▍
                </motion.span>
              </Flex>
            </motion.div>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EnterOverlay
