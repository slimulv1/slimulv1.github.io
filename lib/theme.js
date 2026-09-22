import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const styles = {
  global: props => ({
    body: {
      bg: mode('#f0e7db', '#1a1b26')(props)
    }
  })
}

const components = {
  Heading: {
    variants: {
      'section-title': {
        textDecoration: 'underline',
        fontSize: 20,
        textUnderlineOffset: 6,
        textDecorationColor: '#565f89',
        textDecorationThickness: 4,
        marginTop: 3,
        marginBottom: 4
      }
    }
  },
  Link: {
    baseStyle: props => ({
      color: mode('#3d7aed', '#7aa2f7')(props),
      textUnderlineOffset: 3
    })
  }
}

// Font: Latin giữ system stack (nhanh, quen mắt); M PLUS Rounded 1c đặt SAU
// nên chỉ được dùng cho glyph mà system font không có — tức chữ Nhật (kana/kanji)
// và tiếng Việt dấu nặng khi cần — đồng bộ với heading, đẹp trên mọi máy.
const fonts = {
  heading: "'M PLUS Rounded 1c', sans-serif",
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'M PLUS Rounded 1c', 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif",
  mono: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'M PLUS Rounded 1c', monospace"
}

const colors = {
  grassTeal: '#73daca'
}

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: true
}

const theme = extendTheme({ config, styles, components, fonts, colors })
export default theme
