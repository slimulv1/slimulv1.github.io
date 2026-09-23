import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import NavBar from '../ui/navbar'
import { Box, Container } from '@chakra-ui/react'
import Footer from '../ui/footer'
import VoxelDogLoader from '../three/voxel-dog-loader'
import TrailProgress from '../ui/trail-progress'
import ViewTransitionStyles from '../ui/view-transition-styles'
import { useInterfaceLang } from '../../lib/interface-lang'
import { initSmoothScroll, destroySmoothScroll } from '../../lib/smooth-scroll'

const LazyVoxelDog = dynamic(() => import('../three/voxel-dog'), {
  ssr: false,
  loading: () => <VoxelDogLoader />
})

// Tiêu đề trang theo chủ đề Yuru Camp△ — xoay vòng cùng ngôn ngữ giao diện.
// HTML tĩnh (SSR/SEO/share card) dùng bản en; hydration đổi document.title
// theo vòng quay en ↔ ja của trang (giống text + đồng hồ trong UI).
const PAGE_TITLE = {
  en: 'Slimu Neet · Laid-Back Camp△',
  ja: 'Slimu Neet · ゆるキャン△'
}

const Main = ({ children }) => {
  const { lang } = useInterfaceLang()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = PAGE_TITLE[lang] || PAGE_TITLE.en
    }
  }, [lang])

  // Cuộn mượt Lenis (tự bỏ khi prefers-reduced-motion) — sống qua mọi route
  useEffect(() => {
    if (typeof window === 'undefined') return
    initSmoothScroll()
    return () => destroySmoothScroll()
  }, [])

  return (
    <Box as="main" id="main" tabIndex={-1} pb={8}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Slimu Neet's home — a laid-back campsite on the web" />
        <meta name="author" content="Slimu Neet" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="twitter:title" content={PAGE_TITLE.en} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@slimu3620" />
        <meta name="twitter:creator" content="@slimu3620" />
        <meta name="twitter:image" content="/images/card-campsite.png" />
        <meta property="og:site_name" content="Slimu Neet" />
        <meta name="og:title" content={PAGE_TITLE.en} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/card-campsite.png" />
        <title>{PAGE_TITLE.en}</title>
      </Head>

      {/* CSS cho View Transitions API khi đổi ngày ⇄ đêm trại */}
      <ViewTransitionStyles />

      {/* Skip link: bàn phím / screen reader nhảy thẳng tới nội dung, bỏ qua
          navbar pill + logo + đồng hồ + nút theme. Ẩn bằng clip-path (không
          dùng display:none vì sẽ mất khả năng focus), hiện khi :focus-visible. */}
      <Box
        as="a"
        href="#main"
        position="fixed"
        top={3}
        left={3}
        zIndex={60}
        px={4}
        py={2}
        borderRadius="full"
        bg="camp.card"
        color="camp.text"
        fontWeight={800}
        fontSize="sm"
        border="2px solid"
        borderColor="camp.teal"
        boxShadow="0 10px 28px -12px rgba(0,0,0,0.5)"
        css={{
          // Ẩn khỏi layout + khỏi tab-order khi chưa focus
          clipPath: 'inset(50%)',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          '&:focus-visible, &:focus': {
            clipPath: 'inset(0)',
            width: 'auto',
            height: 'auto',
            overflow: 'visible'
          }
        }}
      >
        Skip to content
      </Box>

      {/* Thanh "con đường mòn" tiến độ cuộn — ẩn khi prefers-reduced-motion */}
      <TrailProgress />

      <NavBar />

      <Container maxW="container.md" pt={{ base: 20, sm: 14 }}>
        <LazyVoxelDog />

        {children}

        <Footer />
      </Container>
    </Box>
  )
}

export default Main
