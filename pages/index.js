import {
  Link,
  Container,
  Heading,
  Box,
  Text,
  List,
  ListItem,
  useColorModeValue
} from '@chakra-ui/react'
import { motion, useReducedMotion } from 'framer-motion'
import Layout from '../components/layouts/home'
import Section from '../components/ui/section'
import Projects from '../components/ui/projects'
import BgMusic from '../components/ui/bg-music'
import EnterOverlay from '../components/ui/enter-overlay'
import FujiDusk from '../components/ui/fuji-dusk'
import CornerRin from '../components/ui/corner-rin'
import StatusBar from '../components/ui/status-bar'
import { IoLogoTwitter, IoLogoInstagram, IoLogoGithub } from 'react-icons/io5'
import { FaSteam } from 'react-icons/fa6'
import Image from 'next/image'
import { fetchGitHubData } from '../lib/github-data'
import { rinPeek, rinClear } from '../lib/rin-peek'
// Ngôn ngữ giao diện xoay vòng 10s + từ điển text (en/ja)
import { useInterfaceLang } from '../lib/interface-lang'
import { UI } from '../lib/interface-labels'

// BUILD TIME: kéo danh sách project từ GitHub để dựng khung SSR ban đầu.
// Phần live phía client tự quét lại phần pin khi load trang (xem lib/live-pinned.js).
// Tên + tagline giữ tĩnh theo thiết kế — không sync theo GitHub.
export async function getStaticProps() {
  const github = await fetchGitHubData()
  return { props: { github } }
}

// Link "On the web": chip pill "thẻ tên móc vào dây trại" — hover/touch → Rin
// hiện bubble 「@handle」 (tương tự card project). Markup giữ handler peek/clear.
const WebLink = ({ href, icon: Icon, label }) => (
  <ListItem>
    <Link
      href={href}
      target="_blank"
      onMouseEnter={() => rinPeek(label)}
      onMouseLeave={rinClear}
      onTouchStart={() => rinPeek(label)}
      onTouchMove={rinClear}
      onTouchCancel={rinClear}
      display="inline-flex"
      alignItems="center"
      columnGap={2.5}
      px={4}
      py={2.5}
      borderRadius="full"
      border="1.5px solid"
      borderColor="camp.line"
      bg="camp.card"
      color="camp.text"
      fontWeight={700}
      fontSize="sm"
      boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 8px 18px -10px rgba(120,90,40,0.35)"
      transition="all 0.2s"
      _hover={{
        borderColor: 'camp.teal',
        transform: 'translateY(-2px)',
        boxShadow:
          '0 0 0 1.5px rgba(115,218,202,0.25), 0 12px 24px -12px rgba(115,218,202,0.4)',
        textDecoration: 'none'
      }}
    >
      <Box as="span" display="inline-flex" color="camp.ember">
        <Icon size={18} />
      </Box>
      {label}
    </Link>
  </ListItem>
)

// Vòng nhẫn gradient lều→lửa quanh avatar + △ trôi nhẹ — màu từ semantic token

// Đom đóm / pháo hoa lửa trại quanh sticky-note — chỉ chạy khi không giảm
// chuyển động (prefers-reduced-motion), thuần trang trí aria-hidden, không
// ảnh hưởng layout (position absolute trong note có transform).
const FIREFLIES = [
  { pos: { top: '-9px', left: '12%' }, size: 6, delay: 0, dur: 3.2 },
  { pos: { top: '26%', right: '-9px' }, size: 7, delay: 1.2, dur: 4.1 },
  { pos: { bottom: '-10px', left: '26%' }, size: 5, delay: 2.0, dur: 3.0 },
  { pos: { top: '52%', left: '-11px' }, size: 5, delay: 0.5, dur: 4.4 }
]

const Home = ({ github }) => {
  // Ngôn ngữ theo vòng xoay chung của giao diện (10s): Anh → Nhật
  const { lang } = useInterfaceLang()
  const reduced = useReducedMotion()
  return (
    <Layout>
      <Container>
        {/* Hero nằm trong wrapper tương đối để đặt blue-hour band SAU (z 0) */}
        <Box position="relative">
          <Box position="relative" zIndex={1}>
        <StatusBar />

        <Box display={{ md: 'flex' }} alignItems="center" columnGap={6}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Slimu Neet
            </Heading>
            <Text mt={3} color="camp.muted" fontSize={{ base: 'md', md: 'lg' }}>
              {UI.intro[lang]}
            </Text>
          </Box>
          <Box
            flexShrink={0}
            mt={{ base: 5, md: 0 }}
            textAlign="center"
            position="relative"
          >
            {/* △ motif lều trôi nhẹ cạnh avatar */}
            <Box
              as="span"
              position="absolute"
              top="-8px"
              left="-16px"
              color="camp.ember"
              fontSize="xl"
              lineHeight={1}
            >
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                style={{ display: 'inline-block' }}
              >
                △
              </motion.span>
            </Box>
            <Box
              p="4px"
              borderRadius="full"
              background="linear-gradient(135deg, var(--chakra-colors-camp-teal), var(--chakra-colors-camp-ember))"
              boxShadow="0 12px 28px -14px rgba(221,138,46,0.5)"
            >
              <Box
                border="3px solid"
                borderColor="camp.card"
                w="104px"
                h="104px"
                display="inline-block"
                borderRadius="full"
                overflow="hidden"
                bg="camp.card"
              >
                <Image
                  src="/images/yurucamp-avatar.png"
                  alt="Profile image"
                  width="100"
                  height="100"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
          </Box>

        {/* Blue-hour band sau hero — trang trí (aria-hidden): Phú Sĩ + trăng
            sao gọn bên PHẢI, vùng chữ bên trái được mask trong suốt để giữ
            contrast; độ cao cố định + không text → an toàn bất biến en≡ja */}
        <Box
          position="absolute"
          right={0}
          bottom={0}
          zIndex={0}
          width={{ base: '80%', md: '62%' }}
          height={{ base: '150px', md: '190px' }}
          pointerEvents="none"
          aria-hidden="true"
          opacity={useColorModeValue(0.55, 0.38)}
          css={{
            WebkitMaskImage:
              'linear-gradient(180deg, transparent 0%, #000 28%, #000 84%, transparent 100%)',
            maskImage:
              'linear-gradient(180deg, transparent 0%, #000 28%, #000 84%, transparent 100%)'
          }}
        >
          <FujiDusk variant="hero" />
        </Box>
        </Box>

        <Section delay={0.1}>
          <Heading as="h3" variant="section-title">
            I ♥
          </Heading>
          {/* Sticky-note giấy vàng: "marry your bed" */}
          <Box
            position="relative"
            bg="camp.emberSoft"
            border="1.5px solid"
            borderColor="camp.lineStrong"
            borderRadius="card"
            p={5}
            maxW="sm"
            color="camp.text"
            boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 22px -14px rgba(140,90,30,0.35)"
            transform="rotate(-0.6deg)"
          >
            {/* Băng keo washi mép trên — như trang sổ tay cắm trại */}
            <Box
              aria-hidden="true"
              position="absolute"
              top="-12px"
              left="50%"
              transform="translateX(-50%) rotate(-2deg)"
              w="96px"
              h="22px"
              borderRadius="5px"
              bg="camp.card"
              border="1px solid"
              borderColor="camp.lineStrong"
              boxShadow="0 2px 6px rgba(120,90,40,0.22)"
              zIndex={1}
              css={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(221,138,46,0.30) 0 7px, rgba(255,255,255,0.55) 7px 14px)'
              }}
            />
            {/* Đom đóm quanh ghi chú — chỉ khi không giảm chuyển động */}
            {!reduced &&
              FIREFLIES.map((f, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    ...f.pos,
                    width: f.size,
                    height: f.size,
                    borderRadius: '50%',
                    background: 'var(--chakra-colors-camp-ember)',
                    boxShadow: '0 0 8px var(--chakra-colors-camp-ember)',
                    pointerEvents: 'none'
                  }}
                  animate={{ y: [0, -6, 0], opacity: [0.25, 0.9, 0.25] }}
                  transition={{
                    repeat: Infinity,
                    duration: f.dur,
                    delay: f.delay,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            {/* Spacer ẩn = bản en (dài nhất) giữ chiều cao note cố định
                  (Box Chakra mới nhận style props — bản Paragraph emotion không) */}
              <Box
                aria-hidden="true"
                visibility="hidden"
                sx={{ textAlign: 'justify', textIndent: '1em', hyphens: 'auto' }}
              >
                {UI.marryBed.en}
              </Box>
              {/* Bản text hiển thị đặt absolute trùng vùng chữ của spacer
                  (cùng padding top/left/right) → khung note bất biến en↔ja */}
              <Text
                position="absolute"
                top={5}
                left={5}
                right={5}
                sx={{ textAlign: 'justify', textIndent: '1em', hyphens: 'auto' }}
              >
                {UI.marryBed[lang]}
              </Text>
            </Box>
        </Section>

        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            {UI.projects[lang]}
          </Heading>
          <Projects repos={github.projects} />
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            {UI.onTheWeb[lang]}
          </Heading>
          <List
            display="flex"
            flexWrap="wrap"
            columnGap={3}
            rowGap={3}
            styleType="none"
          >
            <WebLink
              href="https://github.com/slimulv1/"
              icon={IoLogoGithub}
              label="@slimulv1"
            />
            <WebLink
              href="https://x.com/slimu3620"
              icon={IoLogoTwitter}
              label="@slimu3620"
            />
            <WebLink
              href="https://www.instagram.com/29.thg11_/"
              icon={IoLogoInstagram}
              label="@29.thg11_"
            />
            <WebLink
              href="https://steamcommunity.com/id/virusneet"
              icon={FaSteam}
              label="@virusneet"
            />
          </List>
        </Section>

        <BgMusic />
        <EnterOverlay />
        <CornerRin />
      </Container>
    </Layout>
  )
}

export default Home