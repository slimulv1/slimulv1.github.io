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
      // en dùng Nunito 600 (dày, bo tròn mềm, nhiều weight sẵn có);
      // riêng ja dùng Kosugi Maru — font đó CHỈ có weight 400 nên jaTheme
      // (bên dưới) set lại 400 để nét thật sạch, tránh browser tự bịa đậm.
      fontWeight: 600
    }
  })
}

const components = {
  Heading: {
    variants: {
      'section-title': {
        textDecoration: 'underline',
        fontSize: 21,
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

// Font tách theo ngôn ngữ, dùng CHUNG 1 stack cho cả theme:
//  - Latin (en) → Nunito: bo tròn mềm, đủ weight 400-800 → "dày" thoải mái.
//  - kana/kanji (ja) → Kosugi Maru: maru gothic bo tròn, monospaced (rộng đều)
//    dễ đọc ở cỡ nhỏ — nét tròn "mềm" hơn Zen Maru Gothic theo cảm nhận.
// Trình duyệt tự chọn glyph: ký tự Latin khớp Nunito (nằm trước), ký tự Nhật
// không có trong Nunito → rơi xuống Kosugi Maru. System stack giữ làm fallback.
const fonts = {
  heading: "'Nunito', 'Kosugi Maru', sans-serif",
  body: "'Nunito', 'Kosugi Maru', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif",
  mono: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'M PLUS Rounded 1c', monospace"
}

// Cỡ chữ nâng +1px so với mặc định Chakra (xs 12→13, sm 14→15, md 16→17,
// lg 18→19) — body text nhỉnh hơn một chút, các token còn lại giữ mặc định.
const fontSizes = {
  xs: '13px',
  sm: '15px',
  md: '17px',
  lg: '19px'
}

const colors = {
  grassTeal: '#73daca'
}

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: true
}

const theme = extendTheme({ config, styles, components, fonts, fontSizes, colors })

// Bản tiếng Nhật: Kosugi Maru (font maru cho kana/kanji trong fonts.body) CHỈ
// có đúng 1 trọng lượng nét (400). Theme gốc set body 600 (Nunito cho en) — nếu
// giữ 600 thì chữ Nhật bị trình duyệt tự bịa nét đậm (faux bold), nhòe ở cỡ
// nhỏ → jaTheme set lại 400 để dùng đúng nét thật của Kosugi Maru. jaTheme vẫn
// giữ export để provider xoay theme theo ngôn ngữ.
const jaTheme = extendTheme(theme, {
  styles: {
    global: props => ({
      html: {
        overflowY: 'scroll',
        scrollbarGutter: 'stable'
      },
      body: {
        bg: mode('#f0e7db', '#1a1b26')(props),
        fontWeight: 400
      }
    })
  }
})

export default theme
export { jaTheme }
