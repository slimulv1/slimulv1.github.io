import {
  Link,
  Container,
  Heading,
  Box,
  Text,
  List,
  ListItem
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import Paragraph from '../components/ui/paragraph'
import Layout from '../components/layouts/home'
import Section from '../components/ui/section'
import Projects from '../components/ui/projects'
import BgMusic from '../components/ui/bg-music'
import EnterOverlay from '../components/ui/enter-overlay'
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

const Home = ({ github }) => {
  // Ngôn ngữ theo vòng xoay chung của giao diện (10s): Anh → Nhật
  const { lang } = useInterfaceLang()
  return (
    <Layout>
      <Container>
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

        <Section delay={0.1}>
          <Heading as="h3" variant="section-title">
            I ♥
          </Heading>
          {/* Sticky-note giấy vàng: "marry your bed" */}
          <Box
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
            <Paragraph>{UI.marryBed[lang]}</Paragraph>
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