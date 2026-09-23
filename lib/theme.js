import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const styles = {
  global: props => ({
    html: {
      // Dành sẵn vùng cho thanh cuộn dọc: khi thanh cuộn (kiểu classic trên
      // Windows/macOS) xuất hiện hay biến mất, chiều ngang layout KHÔNG đổi —
      // các khung (Discord status, project card, container) không bao giờ bị
      // co hẹp theo sự thay đổi chiều cao trang giữa en/ja.
      overflowY: 'scroll',
      scrollbarGutter: 'stable'
    },
    body: {
      bg: mode('#f0e7db', '#1a1b26')(props),
      // 500 cho cả en và ja: M PLUS Rounded 1c dùng cho toàn bộ chữ (dày hơn),
      // đồng thời cân bằng với phần text có fontWeight 500 sẵn (status/thẻ)
      fontWeight: 500
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

// Font: Zen Maru Gothic đặt ĐẦU stack — font "maru" (bo tròn) đúng nghĩa, mềm
// hơn M PLUS Rounded 1c, dùng cho CẢ Latin lẫn kana/kanji → tiếng Anh và
// tiếng Nhật đồng bộ hoàn toàn về nét chữ (en "dày + mềm + bo tròn"). M PLUS
// Rounded 1c và system stack giữ phía sau làm fallback nếu webfont chưa tải.
const fonts = {
  heading: "'Zen Maru Gothic', sans-serif",
  body: "'Zen Maru Gothic', 'M PLUS Rounded 1c', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif",
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

// Bản tiếng Nhật: kể từ khi M PLUS Rounded 1c là font chính cho CẢ Latin lẫn
// kana (xem fonts.body) và body fontWeight 500 đã nằm trong theme gốc, hình học
// en và ja là MỘT — không còn hiện tượng chữ Nhật "nhạt/thưa" cần bù riêng.
// jaTheme vẫn giữ export để provider xoay theme theo ngôn ngữ, và là nơi duy
// nhất để tinh chỉnh riêng ja về sau nếu cần.
const jaTheme = extendTheme(theme, {
  styles: {
    global: props => ({
      html: {
        overflowY: 'scroll',
        scrollbarGutter: 'stable'
      },
      body: {
        bg: mode('#f0e7db', '#1a1b26')(props),
        fontWeight: 500
      }
    })
  }
})

export default theme
export { jaTheme }
