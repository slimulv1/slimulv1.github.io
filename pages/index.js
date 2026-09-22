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
import StatusBar from '../components/ui/status-bar'
import { IoLogoTwitter, IoLogoInstagram, IoLogoGithub } from 'react-icons/io5'
import { FaSteam } from 'react-icons/fa6'
import Image from 'next/image'

const Home = () => (
  <Layout>
    <Container>
      <StatusBar />

      <Box display={{ md: 'flex' }}>
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-title">
            Slimu Neet
          </Heading>
          <p>Chỉ là 1 người bình thường với sở thích và đam mê công nghệ</p>
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
        <Paragraph>
          Art, Music, đọc tiểu thuyết, Dựng các mô hình 3D, tìm hiểu về AI
        </Paragraph>
      </Section>

      <Section delay={0.2}>
        <Heading as="h3" variant="section-title">
          Projects
        </Heading>
        <Projects />
      </Section>

      <Section delay={0.3}>
        <Heading as="h3" variant="section-title">
          On the web
        </Heading>
        <List>
          <ListItem>
            <Link href="https://github.com/slimulv1/" target="_blank">
              <Button
                variant="ghost"
                colorScheme="teal"
                leftIcon={<IoLogoGithub />}
              >
                @slimulv1
              </Button>
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://x.com/slimu3620" target="_blank">
              <Button
                variant="ghost"
                colorScheme="teal"
                leftIcon={<IoLogoTwitter />}
              >
                @slimu3620
              </Button>
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://www.instagram.com/29.thg11_/" target="_blank">
              <Button
                variant="ghost"
                colorScheme="teal"
                leftIcon={<IoLogoInstagram />}
              >
                @29.thg11_
              </Button>
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://steamcommunity.com/id/virusneet" target="_blank">
              <Button
                variant="ghost"
                colorScheme="teal"
                leftIcon={<FaSteam />}
              >
                @virusneet
              </Button>
            </Link>
          </ListItem>
        </List>
      </Section>
    </Container>
  </Layout>
)

export default Home
