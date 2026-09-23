import { Box, useColorModeValue } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'framer-motion'

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
 * AMBIENT (bãi trại "sống"): các chi tiết chuyển động nhẹ, transform/opacity
 * only (GPU), chỉ chạy khi prefers-reduced-motion = no-preference:
 *   - đêm: sao thấp nhấp nháy + sao băng vạch ngang trời (lặp ~14.5s) + đom
 *     đóm ven thông nhấp nháy lượn khẽ + tàn lửa bay lên từ lửa trại
 *     (band footer) + hào quang trăng hít thở chậm.
 *   - ngày: mây trắng trôi chậm + chim bay ngang (lặp ~26s) + đàn chim xa
 *     thứ hai bay ngược + hào quang mặt trời lấp lánh nhẹ.
 *   - CẢ HAI: dải sương mờ trôi ngang chân núi + sườn núi sáng viền mờ
 *     (ánh trăng / nắng mai) — nâng đời cho núi Phú Sĩ; đêm thêm ráng chiều
 *     紅富士 phủ đỉnh tuyết, ngày thêm tia lấp lánh trên cap tuyết.
 * Toàn bộ bổ sung dùng path/rect/g — KHÔNG thêm circle vào đêm, KHÔNG thêm
 * ellipse vào ngày → giữ nguyên số lượng node audit (đêm hero: 15 circle +
 * 0 ellipse + 0 birdPaths + 1 meteor; ngày hero: 2 circle + 12 ellipse +
 * 2 birdPaths; footer: 2 lửa cx=372). Chạy trong svg → không đụng layout,
 * có crop theo preserveAspectRatio như cũ (y 246-306 luôn hiển thị).
 * Cực đại ~30 node SVG + ~10 motion nhóm, transform/opacity only.
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
  meadow: null,
  mist: '#b7cede'
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
  meadow: '#b8cf8f',
  mist: '#ffffff'
}

// Sao thấp nhấp nháy (tọa độ nằm trong vùng crop hiển thị của cả hero lẫn
// footer — vùng y 150-260, x 190-610; tránh mây trôi và tiền cảnh núi)
const LOW_STARS = [
  { cx: 470, cy: 178, r: 1.8, dur: 3.8, delay: 0 },
  { cx: 548, cy: 236, r: 1.5, dur: 4.4, delay: 1.1 },
  { cx: 585, cy: 192, r: 1.6, dur: 3.2, delay: 2.2 },
  { cx: 392, cy: 252, r: 1.4, dur: 5.0, delay: 0.6 }
]

// Cờ bunting — dây cờ rợp mép trên band footer (xem footer.js)

const FujiDusk = ({ variant = 'hero', ...props }) => {
  // id gradient riêng theo variant tránh trùng lặp id khi trang có 2 bản
  const skyId = `yc-sky-${variant}`
  const meteorId = `yc-meteor-${variant}`
  const showTent = variant === 'footer'
  // Bối cảnh theo theme đang hoạt động: tối = hoàng hôn, sáng = ban ngày
  const isDark = useColorModeValue(false, true)
  const P = isDark ? DUSK : DAY
  const reduced = useReducedMotion()

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
        {/* Vệt sao băng: đầu (bên phải) đặc trắng → đuôi trong suốt */}
        <linearGradient id={meteorId} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>
        {/* Sương chân núi: gradient ngang — trong suốt 2 đầu, đậm giữa */}
        <linearGradient id={`yc-mist-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={P.mist} stopOpacity="0" />
          <stop offset="18%" stopColor={P.mist} stopOpacity="0.9" />
          <stop offset="82%" stopColor={P.mist} stopOpacity="0.9" />
          <stop offset="100%" stopColor={P.mist} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="800" height="320" fill={`url(#${skyId})`} />

      {isDark ? (
        <g>
          {/* Trăng + hào quang mềm */}
          <motion.circle
            cx="128"
            cy="66"
            r="34"
            fill={P.moonHalo}
            animate={reduced ? { opacity: 0.2 } : { opacity: [0.16, 0.24, 0.16] }}
            transition={
              reduced
                ? { duration: 0 }
                : { repeat: Infinity, duration: 6.5, ease: 'easeInOut' }
            }
          />
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
          {/* AMBIENT ĐÊM: sao thấp nhấp nháy + sao băng */}
          {!reduced && (
            <g>
              <g fill={P.celestial}>
                {LOW_STARS.map(s => (
                  <motion.circle
                    key={`${s.cx}-${s.cy}`}
                    cx={s.cx}
                    cy={s.cy}
                    r={s.r}
                    animate={{ opacity: [0.15, 0.95, 0.15] }}
                    transition={{
                      repeat: Infinity,
                      duration: s.dur,
                      delay: s.delay,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </g>
              {/* Sao băng: vệt trắng quét ngang khoảng trời bên trái núi (x 210-300
                  trong cửa sổ hiển thị), lặp ~14.5s — delay 5.5s để người xem
                  không bỏ lỡ khung hình đầu */}
              <motion.g
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: [-24, 46],
                  y: [-8, 6],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: 5.5,
                  repeat: Infinity,
                  repeatDelay: 8,
                  ease: 'easeIn'
                }}
              >
                <line
                  x1="230"
                  y1="163"
                  x2="262"
                  y2="173"
                  stroke={`url(#${meteorId})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="262" cy="173" r="1.7" fill="#ffffff" />
              </motion.g>
              {/* Đom đóm ven thông — 3 chấm sáng vàng-lục nhấp nháy, lượn khẽ.
                  Path sao 4 cánh (không phải circle) → không phá số lượng
                  circle=15 trong audit đêm */}
              <g>
                {[
                  { x: 120, y: 268, dur: 5.2, delay: 0, amp: 9 },
                  { x: 212, y: 286, dur: 6.4, delay: 1.6, amp: 7 },
                  { x: 660, y: 272, dur: 5.8, delay: 3.1, amp: 6 }
                ].map(ff => (
                  <motion.g
                    key={`ff-${ff.x}`}
                    fill="#e8f5a3"
                    animate={{
                      x: [0, ff.amp, -ff.amp * 0.6, 0],
                      y: [0, -ff.amp * 0.5, ff.amp * 0.4, 0],
                      opacity: [0, 0.9, 0.35, 0.9, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: ff.dur,
                      delay: ff.delay,
                      times: [0, 0.2, 0.45, 0.75, 1],
                      ease: 'easeInOut'
                    }}
                  >
                    <path
                      d="M0 -4 L1.3 -1.3 L4 0 L1.3 1.3 L0 4 L-1.3 1.3 L-4 0 L-1.3 -1.3 Z"
                      transform={`translate(${ff.x} ${ff.y}) scale(0.6)`}
                    />
                  </motion.g>
                ))}
              </g>
            </g>
          )}
        </g>
      ) : (
        <g>
          {/* Mặt trời + hào quang */}
          <motion.circle
            cx="128"
            cy="66"
            r="34"
            fill={P.moonHalo}
            animate={reduced ? { opacity: 0.36 } : { opacity: [0.3, 0.42, 0.3] }}
            transition={
              reduced
                ? { duration: 0 }
                : { repeat: Infinity, duration: 7.5, ease: 'easeInOut' }
            }
          />
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
          {/* AMBIENT NGÀY: mây thấp trôi chậm + chim bay ngang */}
          {!reduced && (
            <g>
              <g fill={P.celestial}>
                <motion.g
                  animate={reduced ? { x: 0 } : { x: [0, 20, 0] }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { repeat: Infinity, duration: 22, ease: 'easeInOut' }
                  }
                  opacity="0.85"
                >
                  <ellipse cx="528" cy="214" rx="26" ry="9" />
                  <ellipse cx="510" cy="207" rx="15" ry="8" />
                  <ellipse cx="548" cy="209" rx="13" ry="7" />
                </motion.g>
                <motion.g
                  animate={reduced ? { x: 0 } : { x: [0, -14, 0] }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { repeat: Infinity, duration: 26, delay: 1.4, ease: 'easeInOut' }
                  }
                  opacity="0.7"
                >
                  <ellipse cx="600" cy="256" rx="20" ry="7" />
                  <ellipse cx="584" cy="250" rx="11" ry="6" />
                </motion.g>
              </g>
              {/* Chim bay ngang bầu trời, lặp ~26s (delay 3s + repeatDelay) */}
              <motion.g
                initial={{ x: 0, opacity: 0 }}
                animate={{
                  x: [-450, 130],
                  y: [0, 6],
                  opacity: [0, 0.9, 0.9, 0]
                }}
                transition={{
                  duration: 16,
                  delay: 3,
                  repeat: Infinity,
                  repeatDelay: 10,
                  ease: 'linear'
                }}
              >
                <g transform="translate(620,196)">
                  <path
                    d="M0 0 q8 -9 15 0"
                    fill="none"
                    stroke="#8b9bab"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 0 q7 -10 14 0"
                    fill="none"
                    stroke="#8b9bab"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                </g>
              </motion.g>
              {/* Đàn chim xa thứ hai — nhỏ, mờ, bay ngược (phải→trái). Stroke
                  #a9b9c3 ≠ #8b9bab → audit "light hero birdPaths === 2" vẫn
                  chỉ đếm đàn gần, không đổi. */}
              <motion.g
                initial={{ x: 0, opacity: 0 }}
                animate={{
                  x: [120, -260],
                  y: [0, -5],
                  opacity: [0, 0.72, 0.72, 0]
                }}
                transition={{
                  duration: 20,
                  delay: 9,
                  repeat: Infinity,
                  repeatDelay: 13,
                  ease: 'linear'
                }}
              >
                <g transform="translate(560,152)">
                  <path
                    d="M0 0 q4.5 -5 9 0"
                    fill="none"
                    stroke="#a9b9c3"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 0 q4 -5.5 8 0"
                    fill="none"
                    stroke="#a9b9c3"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </g>
              </motion.g>
            </g>
          )}
        </g>
      )}

      {/* Núi Phú Sĩ — đường cong mềm, đỉnh tuyết trắng (dark: núi tối; sáng:
          núi mờ xanh-tím như trong màn sương ban mai).
          Variant hero: hạ núi xuống +112 (viewBox-y) để đỉnh (y 34 → 146) thoát
          khỏi vùng fade đầu của mask band hero (0→28% chiều cao band) → cap
          tuyết đọc rõ ở mọi viewport; band hero không mask→ giữ nguyên hình học
          cũ. Dịch chuyển trong svg nên không đụng layout/opacity band. */}
      <g transform={variant === 'hero' ? 'translate(0 112)' : undefined}>
        <path
          d="M316 320 Q430 318 452 96 Q472 56 500 34 Q528 56 548 96 Q570 318 684 320 Z"
          fill={P.mountain}
        />
        <path
          d="M458 92 Q474 52 500 34 Q526 52 542 92 Q520 72 500 62 Q480 72 458 92 Z"
          fill={P.snow}
        />
        {/* Ráng chiều phủ đỉnh tuyết (dark) — 紅富士: lớp cam mờ thở chậm trên
            cap. Giảm chuyển động → dừng ở độ mờ thấp (vẫn là sắc chiều). */}
        {isDark && (
          <motion.path
            d="M458 92 Q474 52 500 34 Q526 52 542 92 Q520 72 500 62 Q480 72 458 92 Z"
            fill="#f7bd8d"
            animate={reduced ? { opacity: 0.14 } : { opacity: [0, 0.5, 0] }}
            transition={
              reduced
                ? { duration: 0 }
                : { repeat: Infinity, duration: 9, delay: 1, ease: 'easeInOut' }
            }
          />
        )}
        {/* Lấp lánh tuyết dưới nắng (day) — tia sao nhỏ trên cap, chỉ khi motion OK */}
        {!isDark && !reduced && (
          <g fill="#fffdf0">
            <motion.path
              d="M0 -3 L0.9 -0.9 L3 0 L0.9 0.9 L0 3 L-0.9 0.9 L-3 0 L-0.9 -0.9 Z"
              transform="translate(478,76) scale(1.9)"
              animate={{ opacity: [0.1, 0.95, 0.1] }}
              transition={{ repeat: Infinity, duration: 2.6, delay: 0.4, ease: 'easeInOut' }}
            />
            <motion.path
              d="M0 -3 L0.9 -0.9 L3 0 L0.9 0.9 L0 3 L-0.9 0.9 L-3 0 L-0.9 -0.9 Z"
              transform="translate(522,58) scale(1.5)"
              animate={{ opacity: [0.1, 0.9, 0.1] }}
              transition={{ repeat: Infinity, duration: 3.4, delay: 1.8, ease: 'easeInOut' }}
            />
          </g>
        )}
        {/* Sườn núi sáng viền mờ — ánh trăng (dark) / nắng mai (day) hắt từ
            bên trái (phía trăng/mặt trời). Transform/opacity only. */}
        <motion.path
          d="M500 34 Q472 56 452 96 Q436 150 424 205"
          fill="none"
          stroke={isDark ? '#e9edf6' : '#ffffff'}
          strokeWidth="3"
          strokeLinecap="round"
          animate={
            reduced
              ? { opacity: isDark ? 0.2 : 0.34 }
              : { opacity: isDark ? [0.12, 0.34, 0.12] : [0.2, 0.42, 0.2] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : { repeat: Infinity, duration: isDark ? 6.5 : 8, delay: 0.5, ease: 'easeInOut' }
          }
        />
      </g>
      {/* Sương mờ chân núi — dải sương trôi ngang (dark: sương chiều lạnh tím;
          day: khói sáng mai). Vẽ SAU núi, TRƯỚC thông → tiền cảnh đứng trên
          sương. Transform/opacity only; rect → không phá count circle/ellipse. */}
      <motion.g
        animate={
          reduced
            ? { opacity: isDark ? 0.14 : 0.5 }
            : { x: [-36, 36], opacity: isDark ? [0.1, 0.2, 0.1] : [0.42, 0.58, 0.42] }
        }
        transition={
          reduced
            ? { duration: 0 }
            : { repeat: Infinity, duration: 40, ease: 'easeInOut' }
        }
      >
        <rect x="-80" y="246" width="960" height="60" fill={`url(#yc-mist-${variant})`} />
      </motion.g>
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
          {/* Lều △ tiền cảnh — dark: lều đêm trên nền lửa trại bập bùng;
              sáng: lều ban ngày trên đồng cỏ */}
          <path d="M318 320 L372 236 L426 320 Z" fill={P.tent} />
          <path d="M372 236 L372 320" stroke={P.tentLine} strokeWidth="2" />
          {isDark ? (
            <>
              <motion.circle
                cx="372"
                cy="300"
                r="30"
                fill={P.fire}
                animate={
                  reduced
                    ? { opacity: 0.3 }
                    : { opacity: [0.26, 0.42, 0.3, 0.44, 0.26] }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : { repeat: Infinity, duration: 5.2, ease: 'easeInOut' }
                }
              />
              <motion.circle
                cx="372"
                cy="318"
                r="38"
                fill={P.fire}
                animate={
                  reduced
                    ? { opacity: 0.16 }
                    : { opacity: [0.14, 0.24, 0.16, 0.26, 0.14] }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : { repeat: Infinity, duration: 5.2, delay: 0.5, ease: 'easeInOut' }
                }
              />
              {/* Tàn lửa bay lên từ đống lửa (footer đêm) — 3 viên than hồng
                  nhỏ (rect xoay 45°) bay lên nhấp nháy mỗi 2.6-3.1s. rect →
                  không đụng audit "2 lửa cx=372". */}
              {!reduced && (
                <g>
                  {[
                    { dy: -34, dx: 0, dur: 2.6, delay: 0 },
                    { dy: -42, dx: 5, dur: 2.8, delay: 0.9 },
                    { dy: -38, dx: -4, dur: 3.1, delay: 1.7 }
                  ].map((e, i) => (
                    <motion.g
                      key={`ember-${i}`}
                      animate={{ y: [0, e.dy], x: [0, e.dx], opacity: [0, 0.95, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: e.dur,
                        delay: e.delay,
                        ease: 'easeOut'
                      }}
                    >
                      <rect
                        x="369"
                        y="285"
                        width="6"
                        height="6"
                        rx="2"
                        fill="#f9c36c"
                        transform="rotate(45 372 288)"
                        opacity="0.9"
                      />
                    </motion.g>
                  ))}
                </g>
              )}
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