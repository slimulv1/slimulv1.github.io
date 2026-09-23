import { Box, Flex, Text } from '@chakra-ui/react'
import { useInterfaceLang } from '../../lib/interface-lang'
import { UI } from '../../lib/interface-labels'
import FujiDusk from './fuji-dusk'

// Chân trang: dải blue hour Yuru Camp△ (Phú Sĩ tuyết + trăng sao + lều lửa
// trại) — neo thị giác cuối trang; bên dưới là pill "biển tên trại".
// Dải thuần trang trí (aria-hidden, không text) nên không ảnh hưởng bất
// biến hình học en≡ja — cả 2 ngôn ngữ cùng độ cao cố định.
const Footer = () => {
  const { lang } = useInterfaceLang()
  return (
    <Box align="center" mt={10} pb={2}>
      <Box
        w="100%"
        maxW="container.md"
        borderRadius="card-big"
        overflow="hidden"
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.4), 0 14px 26px -18px rgba(120,90,40,0.35)"
      >
        <FujiDusk variant="footer" h={{ base: '120px', md: '170px' }} />
      </Box>

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