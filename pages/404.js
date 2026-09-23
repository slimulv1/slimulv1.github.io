import NextLink from 'next/link'
import {
  Box,
  Heading,
  Text,
  Container,
  Button
} from '@chakra-ui/react'
import FujiDusk from '../components/ui/fuji-dusk'
// Ngôn ngữ giao diện xoay vòng 10s + từ điển text (en/ja)
import { useInterfaceLang } from '../lib/interface-lang'
import { UI } from '../lib/interface-labels'

// 404 theo chủ đề Yuru Camp△: "không có bãi trại ở đây" — dải blue hour
// (Phú Sĩ tuyết + trăng sao + lều lửa trại) + nút quay về lều. Text xoay
// vòng en ↔ ja cùng giao diện, không có tiếng Việt.
const NotFound = () => {
  const { lang } = useInterfaceLang()
  return (
    <Container centerContent pt={{ base: 4, md: 8 }}>
      <Box
        w="100%"
        maxW="container.md"
        borderRadius="card-big"
        overflow="hidden"
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.45), 0 16px 32px -20px rgba(120,90,40,0.4)"
      >
        <FujiDusk variant="footer" h={{ base: '150px', md: '210px' }} />
      </Box>

      <Box align="center" mt={8}>
        <Heading as="h1" variant="section-title">
          {UI.notFound.title[lang]}
        </Heading>
      </Box>

      <Text
        mt={6}
        color="camp.muted"
        fontSize={{ base: 'md', md: 'lg' }}
        maxW="md"
        textAlign="center"
      >
        {UI.notFound.body[lang]}
      </Text>

      <Box mt={8}>
        <Button
          as={NextLink}
          href="/"
          size="lg"
          bg="camp.card"
          color="camp.text"
          border="1.5px solid"
          borderColor="camp.lineStrong"
          boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 22px -14px rgba(140,90,30,0.35)"
          _hover={{
            borderColor: 'camp.teal',
            transform: 'translateY(-2px)',
            boxShadow: '0 0 0 1.5px rgba(115,218,202,0.25), 0 12px 24px -12px rgba(115,218,202,0.4)'
          }}
          _active={{ transform: 'translateY(0)' }}
        >
          <Box as="span" color="camp.ember" mr={2} aria-hidden="true">
            △
          </Box>
          {UI.notFound.back[lang]}
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound