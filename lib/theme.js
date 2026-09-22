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
// thưa hơn system font (Latin) — nhìn như giao diện bị "thu nhỏ". Bù lại bằng
// cách tăng toàn bộ thang cỡ chữ thêm 1px để tiếng Nhật cân bằng với EN/VI.
// Lưu ý: ngoài token fontSizes (+1px), body cũng cần +1px để chữ kế thừa
// (thẻ <p> thuần, bài intro…) được đẩy lên, không lỡ sót.
const JA_FONT_SIZES = {
  xs: '13px',
  sm: '15px',
  md: '17px',
  lg: '19px',
  xl: '21px',
  '2xl': '25px',
  '3xl': '31px',
  '4xl': '37px',
  '5xl': '49px',
  '6xl': '61px',
  '7xl': '73px',
  '8xl': '97px',
  '9xl': '129px'
}

const jaTheme = extendTheme(theme, {
  fontSizes: JA_FONT_SIZES,
  styles: {
    global: props => ({
      body: {
        bg: mode('#f0e7db', '#1a1b26')(props),
        fontSize: '17px'
      }
    })
  },
  components: {
    Heading: {
      variants: {
        'section-title': {
          ...components.Heading.variants['section-title'],
          fontSize: 21
        }
      }
    }
  }
})

export default theme
export { jaTheme }
