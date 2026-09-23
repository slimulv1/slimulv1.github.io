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

// Bản tiếng Nhật: glyph kana/kanji của M PLUS Rounded 1c cùng cỡ chữ nhạt và
// thưa hơn system font (Latin) — làm giao diện tiếng Nhật trông như bị "thu
// nhỏ". Trước đây bù bằng cách tăng toàn bộ cỡ chữ thêm 1px, nhưng hệ quả là
// mọi khung (Discord status, project card, section/container) ĐỔI KÍCH THƯỚC
// mỗi lần xoay ngôn ngữ. Giải pháp hiện tại: GIỮ NGUYÊN cỡ chữ và thang
// line-height (hình học tiếng Nhật khớp 100% tiếng Anh — không còn layout
// shift) và bù bằng font-weight 500 cho body — nét glyph M PLUS đậm hơn, đầy
// như system font, mà không đụng vào bố cục khung nào.
const jaTheme = extendTheme(theme, {
  styles: {
    global: props => ({
      body: {
        bg: mode('#f0e7db', '#1a1b26')(props),
        fontWeight: 500
      }
    })
  }
})

export default theme
export { jaTheme }
