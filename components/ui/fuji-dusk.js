import { Box, useColorModeValue } from '@chakra-ui/react'

/**
 * FujiDusk — dải cảnh núi Phú Sĩ chủ đề Yuru Camp△, CÓ 2 bối cảnh theo theme:
 *
 *  - Dark  = "blue hour" (tham khảo key visual chính thức: hoàng hôn có trăng,
 *            lửa trại rực, núi Phú Sĩ tuyết phủ phía sau).
 *  - Light = "ban ngày" tại bãi trại (giống ティザービジュアル＜朝＞ của anime:
 *            trời xanh mai, mây trắng, mặt trời, Phú Sĩ mờ trong nắng, thông xanh,
 *            lều trên đồng cỏ) — không còn trăng/sao/lửa trại "giữa trưa".
 *
 * Cùng một hình học (viewBox 0 0 800 320) cho cả 2 bối cảnh → độ cao band và
 * bố cục không đổi; chỉ đổi màu/chi tiết. Thuần trang trí: aria-hidden, không
 * chứa text → không ảnh hưởng bất biến hình học en≡ja.
 *
 * Props: variant = 'hero' | 'footer'; mọi prop khác đổ xuống <svg> (h, opacity...).
 */
const DUSK = {
  sky: ['#3f5a7a', '#6f94a8', '#d7975f', '#e2915c'],
  moonHalo: '#f7e6bb',
  moon: '#f7e6bb',
  celestial: '#fff8e8', // sao
  mountain: '#2e2b3a',
  snow: '#f2efe3',
  pine: '#2e2b3a',
  tent: '#26242f',
  tentLine: '#26242f',
  fire: '#f2a541',
  meadow: null
}

const DAY = {
  sky: ['#9fd0ef', '#c3e2f5', '#e6f3fa', '#f4e6c4'],
  moonHalo: '#fff6d8',
  moon: '#fff4c9',
  celestial: '#ffffff', // mây
  mountain: '#94accb',
  snow: '#ffffff',
  pine: '#4d7a5e',
  tent: '#6f8072',
  tentLine: '#5d6f63',
  fire: '#f9d47a',
  meadow: '#b8cf8f'
}

const FujiDusk = ({ variant = 'hero', ...props }) => {
  // id gradient riêng theo variant tránh trùng lặp id khi trang có 2 bản
  const skyId = `yc-sky-${variant}`
  const showTent = variant === 'footer'
  // Bối cảnh theo theme đang hoạt động: tối = hoàng hôn, sáng = ban ngày
  const isDark = useColorModeValue(false, true)
  const P = isDark ? DUSK : DAY

  return (
    <Box
      as="svg"
      viewBox="0 0 800 320"
      preserveAspectRatio="xMidYMax slice"
      width="100%"
      display="block"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.sky[0]} />
          <stop offset="42%" stopColor={P.sky[1]} />
          <stop offset="72%" stopColor={P.sky[2]} />
          <stop offset="100%" stopColor={P.sky[3]} />
        </linearGradient>
      </defs>
      <rect width="800" height="320" fill={`url(#${skyId})`} />

      {isDark ? (
        <g>
          {/* Trăng + hào quang mềm */}
          <circle cx="128" cy="66" r="34" fill={P.moonHalo} opacity="0.16" />
          <circle cx="128" cy="66" r="26" fill={P.moon} opacity="0.92" />
          {/* Sao */}
          <g fill={P.celestial}>
            <circle cx="56" cy="120" r="2.2" />
            <circle cx="206" cy="92" r="1.7" />
            <circle cx="296" cy="150" r="2.0" />
            <circle cx="628" cy="70" r="2.0" />
            <circle cx="712" cy="118" r="1.6" />
            <circle cx="80" cy="196" r="1.6" opacity="0.8" />
            <circle cx="360" cy="196" r="1.7" />
            <circle cx="512" cy="128" r="1.5" opacity="0.7" />
          </g>
        </g>
      ) : (
        <g>
          {/* Mặt trời + hào quang */}
          <circle cx="128" cy="66" r="34" fill={P.moonHalo} opacity="0.30" />
          <circle cx="128" cy="66" r="24" fill={P.moon} opacity="0.95" />
          {/* Mây trắng ban ngày (thế chỗ các sao) */}
          <g fill={P.celestial}>
            <g opacity="0.94">
              <ellipse cx="206" cy="92" rx="27" ry="10" />
              <ellipse cx="187" cy="85" rx="16" ry="9" />
              <ellipse cx="225" cy="87" rx="14" ry="8" />
            </g>
            <g opacity="0.80">
              <ellipse cx="628" cy="70" rx="22" ry="8" />
              <ellipse cx="645" cy="65" rx="13" ry="7" />
            </g>
            <g opacity="0.87">
              <ellipse cx="80" cy="196" rx="20" ry="7" />
              <ellipse cx="95" cy="191" rx="12" ry="6" />
            </g>
          </g>
        </g>
      )}

      {/* Núi Phú Sĩ — đường cong mềm, đỉnh tuyết trắng (dark: núi tối; sáng:
          núi mờ xanh-tím như trong màn sương ban mai) */}
      <path
        d="M316 320 Q430 318 452 96 Q472 56 500 34 Q528 56 548 96 Q570 318 684 320 Z"
        fill={P.mountain}
      />
      <path
        d="M458 92 Q474 52 500 34 Q526 52 542 92 Q520 72 500 62 Q480 72 458 92 Z"
        fill={P.snow}
      />
      {/* Thông hai bên — dark: silhouette; sáng: rừng thông xanh */}
      <g fill={P.pine}>
        <path d="M70 320 L108 252 L146 320 Z" />
        <path d="M132 320 L162 270 L192 320 Z" />
        <path d="M180 320 L202 284 L224 320 Z" />
        <path d="M646 320 L668 254 L690 320 Z" />
        <path d="M682 320 L702 276 L722 320 Z" />
      </g>
      {showTent && (
        <g>
          {/* Lều △ tiền cảnh — dark: lều đêm trên nền lửa trại rực;
              sáng: lều ban ngày trên đồng cỏ */}
          <path d="M318 320 L372 236 L426 320 Z" fill={P.tent} />
          <path d="M372 236 L372 320" stroke={P.tentLine} strokeWidth="2" />
          {isDark ? (
            <>
              <circle cx="372" cy="300" r="30" fill={P.fire} opacity="0.30" />
              <circle cx="372" cy="318" r="38" fill={P.fire} opacity="0.16" />
            </>
          ) : (
            <ellipse cx="372" cy="314" rx="58" ry="12" fill={P.meadow} opacity="0.85" />
          )}
        </g>
      )}
    </Box>
  )
}

export default FujiDusk