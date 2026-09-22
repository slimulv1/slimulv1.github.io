import { Box } from '@chakra-ui/react'
import { useInterfaceLang } from '../../lib/interface-lang'
import { UI } from '../../lib/interface-labels'

const Footer = () => {
  const { lang } = useInterfaceLang()
  return (
    <Box align="center" opacity={0.4} fontSize="sm">
      &copy; {new Date().getFullYear()} Slimu Neet. {UI.footerRights[lang]}
    </Box>
  )
}

export default Footer
