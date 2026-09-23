import Logo from './logo'
import {
  Container,
  Box,
  Flex,
  Heading,
  useColorModeValue
} from '@chakra-ui/react'
import ThemeToggleButton from './theme-toggle-button'
import VnClock from './vn-clock'
import StatusDot from './status-dot'

const Navbar = props => {
  // Pill nổi kiểu "bảng tên trại": nền card ấm + viền cát + bóng mềm,
  // nền trang vẫn lướt qua được vùng trong suốt (pointer-events none bên ngoài).
  const pillBg = useColorModeValue('rgba(255, 250, 240, 0.8)', 'rgba(33, 32, 44, 0.8)')
  const pillBorder = useColorModeValue(
    'rgba(215, 193, 149, 0.65)',
    'rgba(76, 72, 89, 0.65)'
  )
  const pillShadow = useColorModeValue(
    '0 10px 28px -14px rgba(120, 90, 40, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
    '0 10px 28px -14px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255,255,255,0.06)'
  )

  return (
    <Box
      position="fixed"
      as="nav"
      w="100%"
      zIndex={2}
      css={{
        // iOS notch/dynamic island: đẩy nội dung nav xuống dưới "tai thỏ"
        paddingTop: 'env(safe-area-inset-top)',
        pointerEvents: 'none'
      }}
      {...props}
    >
      <Container
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        maxW="container.md"
        px={{ base: 2, sm: 3 }}
        py={{ base: 2, sm: 2.5 }}
        mt={{ base: 2, sm: 3 }}
        bg={pillBg}
        border="1px solid"
        borderColor={pillBorder}
        borderRadius="full"
        boxShadow={pillShadow}
        css={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          pointerEvents: 'auto'
        }}
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