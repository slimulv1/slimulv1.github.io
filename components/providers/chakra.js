import { ChakraProvider, localStorageManager } from '@chakra-ui/react'
import { useInterfaceLang } from '../../lib/interface-lang'
import theme, { jaTheme } from '../../lib/theme'

// Chọn theme theo ngôn ngữ: khi tiếng Nhật, dùng jaTheme (toàn bộ thang cỡ chữ
// +1px) để bù glyph M PLUS Rounded 1c nhạt/thưa — giao diện không bị "thu nhỏ".
export default function Chakra({ children }) {
  const { lang } = useInterfaceLang()
  return (
    <ChakraProvider
      theme={lang === 'ja' ? jaTheme : theme}
      colorModeManager={localStorageManager}
    >
      {children}
    </ChakraProvider>
  )
}