import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import NavBar from '../ui/navbar'
import { Box, Container } from '@chakra-ui/react'
import Footer from '../ui/footer'
import VoxelDogLoader from '../three/voxel-dog-loader'
import { useInterfaceLang } from '../../lib/interface-lang'

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

  return (
    <Box as="main" pb={8}>
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
        <meta name="twitter:image" content="/images/yurucamp.png" />
        <meta property="og:site_name" content="Slimu Neet" />
        <meta name="og:title" content={PAGE_TITLE.en} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/yurucamp.png" />
        <title>{PAGE_TITLE.en}</title>
      </Head>

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
