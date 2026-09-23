import { ChakraProvider, localStorageManager } from '@chakra-ui/react'
import { useInterfaceLang } from '../../lib/interface-lang'
import theme, { jaTheme } from '../../lib/theme'

// Chọn theme theo ngôn ngữ: khi tiếng Nhật, dùng jaTheme — font-weight 500 cho
// body (bù nét glyph M PLUS Rounded 1c nhạt/thưa) mà GIỮ NGUYÊN cỡ chữ, nên
// hình học các khung không đổi khi xoay en ↔ ja.
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