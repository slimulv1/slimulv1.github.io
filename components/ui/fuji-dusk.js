import { Box } from '@chakra-ui/react'

/**
 * FujiDusk — dải "blue hour" chủ đề Yuru Camp△ (tham khảo key visual chính
 * thức: "hoàng hôn có trăng, lửa trại rực, núi Phú Sĩ tuyết phủ phía sau").
 *
 * Thành phần: gradient chạng vạng (indigo → teal → ember), trăng + sao,
 * núi Phú Sĩ tuyết phủ, thông silhouette; variant "footer" thêm lều △ +
 * ánh lửa trại ở tiền cảnh.
 *
 * Thuần trang trí: aria-hidden, không chứa text → không ảnh hưởng bất biến
 * hình học en≡ja (luôn được đặt trong wrapper tương đối, ảnh nền tuyệt đối).
 *
 * Props: variant = 'hero' | 'footer'; mọi prop khác đổ xuống <svg> (h, opacity...).
 */
const FujiDusk = ({ variant = 'hero', ...props }) => {
  // id gradient riêng theo variant tránh trùng lặp id khi trang có 2 bản
  const skyId = `yc-sky-${variant}`
  const showTent = variant === 'footer'
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
          <stop offset="0%" stopColor="#3f5a7a" />
          <stop offset="42%" stopColor="#6f94a8" />
          <stop offset="72%" stopColor="#d7975f" />
          <stop offset="100%" stopColor="#e2915c" />
        </linearGradient>
      </defs>
      <rect width="800" height="320" fill={`url(#${skyId})`} />
      {/* Trăng + hào quang mềm */}
      <circle cx="128" cy="66" r="34" fill="#f7e6bb" opacity="0.16" />
      <circle cx="128" cy="66" r="26" fill="#f7e6bb" opacity="0.92" />
      {/* Sao */}
      <g fill="#fff8e8">
        <circle cx="56" cy="120" r="2.2" />
        <circle cx="206" cy="92" r="1.7" />
        <circle cx="296" cy="150" r="2.0" />
        <circle cx="628" cy="70" r="2.0" />
        <circle cx="712" cy="118" r="1.6" />
        <circle cx="80" cy="196" r="1.6" opacity="0.8" />
        <circle cx="360" cy="196" r="1.7" />
        <circle cx="512" cy="128" r="1.5" opacity="0.7" />
      </g>
      {/* Núi Phú Sĩ — đường cong mềm, đỉnh tuyết trắng */}
      <path
        d="M316 320 Q430 318 452 96 Q472 56 500 34 Q528 56 548 96 Q570 318 684 320 Z"
        fill="#2e2b3a"
      />
      <path
        d="M458 92 Q474 52 500 34 Q526 52 542 92 Q520 72 500 62 Q480 72 458 92 Z"
        fill="#f2efe3"
      />
      {/* Thông silhouette hai bên */}
      <g fill="#2e2b3a">
        <path d="M70 320 L108 252 L146 320 Z" />
        <path d="M132 320 L162 270 L192 320 Z" />
        <path d="M180 320 L202 284 L224 320 Z" />
        <path d="M646 320 L668 254 L690 320 Z" />
        <path d="M682 320 L702 276 L722 320 Z" />
      </g>
      {showTent && (
        <g>
          {/* Lều △ tiền cảnh */}
          <path d="M318 320 L372 236 L426 320 Z" fill="#26242f" />
          <path d="M372 236 L372 320" stroke="#26242f" strokeWidth="2" />
          {/* Ánh lửa trại phủ quanh lều */}
          <circle cx="372" cy="300" r="30" fill="#f2a541" opacity="0.30" />
          <circle cx="372" cy="318" r="38" fill="#f2a541" opacity="0.16" />
        </g>
      )}
    </Box>
  )
}

export default FujiDusk