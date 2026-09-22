import {
  Link,
  Container,
  Heading,
  Box,
  Button,
  List,
  ListItem
} from '@chakra-ui/react'
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
// Ngôn ngữ giao diện xoay vòng 15s + từ điển text (vi/en/ja)
import { useInterfaceLang } from '../lib/interface-lang'
import { UI } from '../lib/interface-labels'

// BUILD TIME: kéo danh sách project từ GitHub để dựng khung SSR ban đầu.
// Phần live phía client tự quét lại phần pin khi load trang (xem lib/live-pinned.js).
// Tên + tagline giữ tĩnh theo thiết kế — không sync theo GitHub.
export async function getStaticProps() {
  const github = await fetchGitHubData()
  return { props: { github } }
}

// Link "On the web": hover/touch → Rin hiện bubble 「@handle」 (tương tự card project).
// Markup Button giữ y nguyên — chỉ thêm handler peek/clear cho desktop + mobile.
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
    >
      <Button variant="ghost" colorScheme="teal" leftIcon={<Icon />}>
        {label}
      </Button>
    </Link>
  </ListItem>
)

const Home = ({ github }) => {
  // Ngôn ngữ theo vòng xoay chung của giao diện (15s): Việt → Anh → Nhật
  const { lang } = useInterfaceLang()
  return (
    <Layout>
      <Container>
        <StatusBar />

        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Slimu Neet
            </Heading>
            <p>{UI.intro[lang]}</p>
          </Box>
          <Box
            flexShrink={0}
            mt={{ base: 4, md: 0 }}
            ml={{ md: 6 }}
            textAlign="center"
          >
            <Box
              borderColor="whiteAlpha.800"
              borderWidth={2}
              borderStyle="solid"
              w="100px"
              h="100px"
              display="inline-block"
              borderRadius="full"
              overflow="hidden"
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

        <Section delay={0.1}>
          <Heading as="h3" variant="section-title">
            I ♥
          </Heading>
          <Paragraph>{UI.marryBed[lang]}</Paragraph>
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
          <List>
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
