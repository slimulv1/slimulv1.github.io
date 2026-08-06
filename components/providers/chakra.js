import { ChakraProvider, localStorageManager } from '@chakra-ui/react'
import theme from '../../lib/theme'

export default function Chakra({ children }) {
  return (
    <ChakraProvider theme={theme} colorModeManager={localStorageManager}>
      {children}
    </ChakraProvider>
  )
}
