import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

/**
 * DESIGN TOKENS — chủ đề "Campsite" (bãi cắm trại lúc hoàng hôn).
 * Light = chiều hè giấy ấm (cream + ánh teal/ember); Dark = đêm trại sao.
 * Tất cả component dùng semantic token `camp.*` thay vì hex rải rác.
 */
const semanticTokens = {
  colors: {
    camp: {
      // Nền trang
      sky: { default: '#f7efdc', _dark: '#16151f' },
      // Bề mặt card / sticker
      card: { default: '#fffaf0', _dark: '#21202c' },
      cardAlt: { default: '#f6ecd6', _dark: '#292633' },
      // Viền
      line: { default: '#e6d5b0', _dark: '#3a3747' },
      lineStrong: { default: '#d7c195', _dark: '#4c4859' },
      // Chữ
      text: { default: '#4b3f31', _dark: '#ece8dd' },
      // muted phải đủ contrast cho cỡ 12-13px (AA ≥ 4.5:1): #76664c = 4.86 vs giấy / 5.35 vs card
      muted: { default: '#76664c', _dark: '#a9a191' },
      // Teal — màu nhận diện Slimu (bầu trời / mái lều)
      teal: { default: '#188f7f', _dark: '#73daca' },
      tealSoft: { default: '#dcefe9', _dark: '#1d3837' },
      // Ember — ngọn lửa trại ấm
      ember: { default: '#dd8a2e', _dark: '#f2a541' },
      emberSoft: { default: '#f9e7cc', _dark: '#3a2c19' }
    }
  }
}

/**
 * Global styles dùng CHUNG cho cả theme en lẫn jaTheme — một nơi duy nhất
 * để bảo trì, tránh tình trạng cũ (jaTheme copy nguyên khối, dễ trôi khi
 * thêm thuộc tính mới). Khác biệt duy nhất giữa hai bản là trọng lượng nét
 * chữ: en dùng Nunito 600 (dày, bo tròn, đủ weight), ja dùng Kosugi Maru —
 * font đó CHỈ có weight 400, nên jaTheme trả về 400 để lấy đúng nét thật
 * (tránh trình duyệt tự bịa đậm).
 */
const buildGlobalStyles = props => ({
  html: {
    // Dành sẵn vùng cho thanh cuộn dọc: khi thanh cuộn (kiểu classic trên
    // Windows/macOS) xuất hiện hay biến mất, chiều ngang layout KHÔNG đổi —
    // các khung (Discord status, project card, container) không bao giờ bị
    // co hẹp theo sự thay đổi chiều cao trang giữa en/ja.
    overflowY: 'scroll',
    scrollbarGutter: 'stable',
    // Navbar pill cố định (~64px + safe-area) → khi có anchor/in-page scroll
    // sau này, nội dung dừng ở vị trí không bị pill che mất.
    scrollPaddingTop: '104px',
    // Khai báo color-scheme theo đúng theme đang hoạt động → native control
    // và scrollbar Firefox vẽ đúng palette light/dark (WebKit đã có bộ
    // pseudo-element riêng phía dưới).
    colorScheme: mode('light', 'dark')(props)
  },
  // Cuộn mượt CHỈ khi người dùng không yêu cầu giảm chuyển động
  '@media (prefers-reduced-motion: no-preference)': {
    html: {
      scrollBehavior: 'smooth'
    }
  },
  body: {
    backgroundColor: mode('#f7efdc', '#16151f')(props),
    // Nền giấy có 2 bối cảnh theo theme:
    //  - light = "bãi trại ban ngày": chấm giấy + vàng nắng dịu (thay cho ám
    //    hoàng hôn) + ánh hồ teal phía hồ.
    //  - dark  = "đêm trại": chấm giấy lấp lánh + ánh lửa trại + teal bầu trời.
    backgroundImage: mode(
      `radial-gradient(1px 1px at 22px 30px, rgba(125,98,58,0.10) 1px, transparent 0),
       radial-gradient(1px 1px at 72px 88px, rgba(125,98,58,0.07) 1px, transparent 0),
       radial-gradient(1200px 560px at 82% -8%, rgba(255,201,120,0.18), transparent 62%),
       radial-gradient(1000px 520px at 6% 18%, rgba(63,150,140,0.16), transparent 62%)`,
      `radial-gradient(1px 1px at 24px 32px, rgba(255,255,255,0.14) 1px, transparent 0),
       radial-gradient(1px 1px at 92px 118px, rgba(255,255,255,0.10) 1px, transparent 0),
       radial-gradient(1.5px 1.5px at 168px 64px, rgba(242,165,65,0.30) 1.5px, transparent 0),
       radial-gradient(1200px 560px at 82% -8%, rgba(242,140,54,0.13), transparent 62%),
       radial-gradient(1000px 520px at 6% 18%, rgba(63,140,160,0.18), transparent 62%)`
    )(props),
    // Nền "fixed" đẹp trên desktop nhưng rất tốn repaint trên mobile
    // (iOS Safari bỏ/giật; Android Chrome vẽ lại gradient mỗi frame cuộn)
    // → mặc định scroll, chỉ giữ fixed từ cỡ md trở lên (media query dưới).
    backgroundAttachment: 'scroll',
    // Nét chữ càng sắc (đặc biệt kana/kanji cỡ nhỏ của Kosugi Maru trên macOS)
    WebkitFontSmoothing: 'antialiased',
    // Không để "góa phụ" một từ ở cuối dòng trong đoạn văn — progressive
    // enhancement: trình duyệt chưa hỗ trợ text-wrap sẽ bỏ qua im lặng.
    textWrap: 'pretty',
    // An toàn 320px: token/URL dài bất thường xuống dòng thay vì tràn ngang
    overflowWrap: 'break-word',
    // en dùng Nunito 600 (dày, bo tròn mềm, nhiều weight sẵn có);
    // riêng ja dùng Kosugi Maru — font đó CHỈ có weight 400 nên jaTheme
    // (bên dưới) set lại 400 để nét thật sạch, tránh browser tự bịa đậm.
    fontWeight: 600
  },
  // Chỉ desktop (md ≥ 48em) mới giữ nền đứng yên khi cuộn
  '@media (min-width: 48em)': {
    body: {
      backgroundAttachment: 'fixed'
    }
  },
  // Vùng đèn sau chú chó voxel 3D — light: nắng ban mai dịu; dark: lửa trại
  '.voxel-dog': {
    borderRadius: '50% / 40%',
    backgroundImage: mode(
      `radial-gradient(closest-side at 50% 58%, rgba(255,214,150,0.16), rgba(255,214,150,0.05) 55%, transparent 74%),
       radial-gradient(closest-side at 50% 84%, rgba(63,150,140,0.12), transparent 70%)`,
      `radial-gradient(closest-side at 50% 58%, rgba(242,165,65,0.18), rgba(242,165,65,0.06) 55%, transparent 74%),
       radial-gradient(closest-side at 50% 84%, rgba(115,218,202,0.10), transparent 70%)`
    )(props)
  },
  '::selection': {
    background: mode('rgba(24,143,127,0.22)', 'rgba(115,218,202,0.30)')(props)
  },
  // Ring focus toàn cục theo màu nhận diện — dùng :where() (specificity 0)
  // nên rule riêng của từng component (vd corner-rin) luôn thắng nếu cần.
  ':where(a, button, input, select, textarea, summary, [tabindex]):focus-visible': {
    outline: '2px solid',
    outlineColor: mode(
      'rgba(24,143,127,0.9)',
      'rgba(115,218,202,0.95)'
    )(props),
    outlineOffset: 2,
    borderRadius: '4px'
  },
  '*::-webkit-scrollbar': {
    width: '10px',
    height: '10px'
  },
  '*::-webkit-scrollbar-track': {
    background: 'transparent'
  },
  '*::-webkit-scrollbar-thumb': {
    background: mode('rgba(199,177,128,0.5)', 'rgba(76,72,89,0.85)')(props),
    borderRadius: '8px',
    border: '2px solid transparent',
    backgroundClip: 'padding-box'
  },
  '*::-webkit-scrollbar-thumb:hover': {
    background: mode('rgba(177,153,100,0.7)', 'rgba(96,91,109,0.95)')(props)
  },
  // Scrollbar Firefox: WebKit pseudo-element ở trên không có hiệu lực ở FF,
  // phải dùng cặp thuộc tính scrollbar-width/color (Chromium mới cũng ngầm
  // hiểu, nhưng sẽ bị pseudo-element WebKit chi phối — không xung đột).
  '*': {
    scrollbarWidth: 'thin',
    scrollbarColor: mode(
      'rgba(199,177,128,0.55) rgba(247,239,220,0.35)',
      'rgba(76,72,89,0.9) rgba(22,21,31,0.45)'
    )(props)
  }
})

const styles = {
  global: props => buildGlobalStyles(props)
}

const components = {
  Heading: {
    baseStyle: {
      fontWeight: 800
    },
    variants: {
      // Hero "Slimu Neet"
      'page-title': {
        fontSize: { base: '27px', md: '33px' },
        fontWeight: 800,
        letterSpacing: '-0.01em',
        lineHeight: 1.15,
        color: 'camp.text'
      },
      // Sticker chip cho từng phần — bản cá tính của section heading
      'section-title': {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        fontSize: '21px',
        fontWeight: 800,
        lineHeight: 1.35,
        px: 4,
        py: 1,
        borderRadius: 'full',
        bg: 'camp.tealSoft',
        color: 'camp.text',
        // Viền nét đứt + con dấu tròn sau chữ → tem sưu tầm (stamp rally —
        // motif đặc trưng nhất của merchandise Yuru Camp△: ご当地スタンプ)
        borderWidth: '2px',
        borderStyle: 'dashed',
        borderColor: 'camp.lineStrong',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 18px -8px rgba(120,90,40,0.45)',
        marginTop: 2,
        marginBottom: 6,
        // △ lều nhỏ trước tiêu đề — motif xuyên suốt (flex item nên gap tự áp)
        _before: {
          content: '"△"',
          color: 'camp.ember',
          fontSize: '17px',
          lineHeight: 1
        },
        // Con dấu tròn nét đứt sau tiêu đề — như 消印 (khắc bưu chính) trên tem
        _after: {
          content: '""',
          width: '15px',
          height: '15px',
          borderRadius: 'full',
          border: '2px dashed',
          borderColor: 'camp.ember',
          marginLeft: '4px',
          opacity: 0.9
        },
        _dark: {
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.07), 0 6px 18px -8px rgba(0,0,0,0.6)'
        }
      }
    }
  },
  Link: {
    baseStyle: props => ({
      color: mode('#188f7f', '#77d7c8')(props),
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

// Bo góc sticker/card cho cả hệ thống
const radii = {
  card: '20px',
  'card-big': '26px'
}

const colors = {
  grassTeal: '#73daca'
}

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: true
}

const theme = extendTheme({
  config,
  styles,
  components,
  fonts,
  fontSizes,
  radii,
  colors,
  semanticTokens
})

// Bản tiếng Nhật: Kosugi Maru (font maru cho kana/kanji trong fonts.body) CHỈ
// có đúng 1 trọng lượng nét (400). Theme gốc set body 600 + heading 800 (Nunito
// cho en) — nếu giữ thì chữ Nhật bị trình duyệt tự bịa nét đậm (faux bold),
// nhòe ở cỡ nhỏ → jaTheme set lại 400 cho cả body lẫn heading để dùng đúng nét
// thật của Kosugi Maru. Global styles dùng chung buildGlobalStyles() — chỗ duy
// nhất cần sửa là trọng lượng nét trên body.
// jaTheme vẫn giữ export để provider xoay theme theo ngôn ngữ.
const jaTheme = extendTheme(theme, {
  styles: {
    global: props => ({
      ...buildGlobalStyles(props),
      body: {
        ...buildGlobalStyles(props).body,
        fontWeight: 400
      }
    })
  },
  components: {
    Heading: {
      baseStyle: {
        fontWeight: 400
      }
    }
  }
})

export default theme
export { jaTheme }