import { Box, Flex, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'framer-motion'
import { useInterfaceLang } from '../../lib/interface-lang'
import { UI } from '../../lib/interface-labels'
import FujiDusk from './fuji-dusk'

// Dây cờ bunting: 7 lá cờ △ đan ember/teal rợp mép trên band — motif lễ hội
// bãi trại; mỗi lá vẫy nhẹ theo delay riêng (reduced → tĩnh). Thuần trang trí.
const FLAGS = [
  { x: 8, c: 'camp-ember', delay: 0 },
  { x: 22, c: 'camp-teal', delay: 0.6 },
  { x: 36, c: 'camp-ember', delay: 1.2 },
  { x: 50, c: 'camp-teal', delay: 0.3 },
  { x: 64, c: 'camp-ember', delay: 1.5 },
  { x: 78, c: 'camp-teal', delay: 0.9 },
  { x: 92, c: 'camp-ember', delay: 2.0 }
]

// Chân trang: dải blue hour Yuru Camp△ (Phú Sĩ tuyết + trăng sao + lều lửa
// trại) — neo thị giác cuối trang; bên dưới là pill "biển tên trại".
// Dải thuần trang trí (aria-hidden, không text) nên không ảnh hưởng bất
// biến hình học en≡ja — cả 2 ngôn ngữ cùng độ cao cố định.
const Footer = () => {
  const { lang } = useInterfaceLang()
  // Fade-up nhẹ khi chân trang vào view (whileInView, once) — reduced →
  // hiện ngay không trượt
  const reduced = useReducedMotion()
  return (
    <Box align="center" mt={10} pb={2}>
      <motion.div
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
      <Box
        position="relative"
        w="100%"
        maxW="container.md"
        borderRadius="card-big"
        overflow="hidden"
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.4), 0 14px 26px -18px rgba(120,90,40,0.35)"
      >
        {/* Dây cờ bunting rợp mép trên: dải dây nét đứt + lá cờ △ vẫy nhẹ
            (framer spring-ish loop; reduced → đứng yên) */}
        <Box
          aria-hidden="true"
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="14px"
          zIndex={2}
          pointerEvents="none"
          css={{
            background:
              'repeating-linear-gradient(90deg, var(--chakra-colors-camp-lineStrong) 0 7px, transparent 7px 14px)',
            opacity: 0.5,
            WebkitMaskImage:
              'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
            maskImage:
              'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)'
          }}
        >
          {FLAGS.map(f => (
            <motion.span
              key={f.x}
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '3px',
                left: `${f.x}%`,
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: `11px solid var(--chakra-colors-${f.c})`,
                transformOrigin: '50% 0%',
                opacity: 0.85,
                willChange: 'transform'
              }}
              animate={reduced ? { rotate: 0 } : { rotate: [0, 4, -4, 0] }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { repeat: Infinity, duration: 4.4, delay: f.delay, ease: 'easeInOut' }
              }
            />
          ))}
        </Box>
        <FujiDusk variant="footer" h={{ base: '120px', md: '170px' }} />
      </Box>
      </motion.div>

      <Flex
        as="span"
        alignItems="center"
        columnGap={2}
        px={4}
        py={1.5}
        mt={5}
        borderRadius="full"
        border="1.5px solid"
        borderColor="camp.line"
        bg="camp.card"
        color="camp.muted"
        fontSize="sm"
        opacity={0.9}
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 14px -10px rgba(120,90,40,0.3)"
      >
        <Text as="span" color="camp.ember" aria-hidden="true">
          △
        </Text>
        <Text as="span">
          &copy; {new Date().getFullYear()} Slimu Neet. {UI.footerRights[lang]}
        </Text>
      </Flex>
    </Box>
  )
}

export default Footer