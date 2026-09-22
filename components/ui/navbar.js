import Logo from './logo'
import {
  Container,
  Box,
  Heading,
  Flex,
  useColorModeValue
} from '@chakra-ui/react'
import ThemeToggleButton from './theme-toggle-button'
import VnClock from './vn-clock'
import StatusDot from './status-dot'

const Navbar = props => {
  return (
    <Box
      position="fixed"
      as="nav"
      w="100%"
      bg={useColorModeValue('#ffffff40', '#1a1b2680')}
      css={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        // iOS notch/dynamic island: đẩy nội dung nav xuống dưới "tai thỏ"
        paddingTop: 'env(safe-area-inset-top)'
      }}
      zIndex={2}
      {...props}
    >
      <Container
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        maxW="container.md"
        px={{ base: 2, sm: 4 }}
        py={{ base: 1, sm: 2 }}
        flexWrap="wrap"
        columnGap={2}
        rowGap={1}
      >
        <Flex alignItems="center" flexShrink={1} minWidth={0}>
          <Heading
            as="h1"
            size="lg"
            letterSpacing="tighter"
            whiteSpace="nowrap"
          >
            <Logo />
          </Heading>
        </Flex>

        <Flex alignItems="center" columnGap={2} flexShrink={0}>
          <StatusDot />
          <VnClock />
          <ThemeToggleButton />
        </Flex>
      </Container>
    </Box>
  )
}

export default Navbar
