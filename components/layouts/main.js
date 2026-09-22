import Head from 'next/head'
import dynamic from 'next/dynamic'
import NavBar from '../ui/navbar'
import { Box, Container } from '@chakra-ui/react'
import Footer from '../ui/footer'
import VoxelDogLoader from '../three/voxel-dog-loader'

const LazyVoxelDog = dynamic(() => import('../three/voxel-dog'), {
  ssr: false,
  loading: () => <VoxelDogLoader />
})

const Main = ({ children }) => {
  return (
    <Box as="main" pb={8}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Slimu Neet's homepage" />
        <meta name="author" content="Slimu Neet" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="twitter:title" content="Slimu Neet" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@slimu3620" />
        <meta name="twitter:creator" content="@slimu3620" />
        <meta name="twitter:image" content="/images/yurucamp.png" />
        <meta property="og:site_name" content="Slimu Neet" />
        <meta name="og:title" content="Slimu Neet" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/yurucamp.png" />
        <title>Slimu Neet - Homepage</title>
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
