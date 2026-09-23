import { Box, Flex, Text } from '@chakra-ui/react'
import { useInterfaceLang } from '../../lib/interface-lang'
import { UI } from '../../lib/interface-labels'

// Chân trang kiểu "biển tên trại": pill nhỏ mềm với △ + © + quyền
const Footer = () => {
  const { lang } = useInterfaceLang()
  return (
    <Box align="center" mt={10} pb={2}>
      <Flex
        as="span"
        display="inline-flex"
        alignItems="center"
        columnGap={2}
        px={4}
        py={1.5}
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