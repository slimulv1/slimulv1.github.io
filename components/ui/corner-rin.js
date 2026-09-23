import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Text,
  useBreakpointValue,
  useColorModeValue,
  visuallyHiddenStyle
} from '@chakra-ui/react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { slotOf } from '../../lib/interface-lang'

// Lời chào theo khung giờ trong ngày, mỗi khung 2 ngôn ngữ × 3 câu
// (giao diện chỉ còn en ↔ ja — đã xóa tiếng Việt)
const GREETINGS = {
  morning: {
    en: ['Good morning!', 'A cup of tea?', "Let's go camping!"],
    ja: ['おはよう', 'お茶にする？', 'キャンプ行こう！']
  },
  afternoon: {
    en: ['Good afternoon!', 'The weather is so nice.', 'Take a little break.'],
    ja: ['こんにちは', '天気がいいね', 'ちょっと休もう']
  },
  evening: {
    en: ['Good evening!', 'Campfire time.', 'Enjoy the background music ~'],
    ja: ['こんばんは', '焚き火の時間だよ', '音楽を聴こう〜']
  },
  night: {
    en: ['Good night...', 'Still awake?', 'See you tomorrow!'],
    ja: ['おやすみ...', 'まだ起きてるの？', 'また明日ね']
  }
}

// Diện mạo nút Rin theo NGÔN NGỮ GIAO DIỆN đang hiển thị (xoay vòng en↔ja 10s) —
// trước đây mặc định cứng tiếng Anh dù mọi text khác đều xoay.
const SAYHI = { en: 'Say hi', ja: '声をかけて' }
const TALK_LABEL = { en: 'Talk to Rin', ja: 'リンと話す' }

// Kích thước thật của rin.png (199×300) → đặt width/height attr để trình duyệt
// dự trữ tỷ lệ, tránh CLS khi ảnh load (guidelines: img cần kích thước rõ ràng).
const RIN_W = 199
const RIN_H = 300

/**
 * Nhân vật góc: Rin (Yuru Camp△) cố định góc dưới-phải — hover/focus-visible
 * thấy tooltip "Say hi" trên đầu, click → bounce + speech bubble chào theo
 * khung giờ trong ngày, bấm liên tục xoay trong 3 câu của NGÔN NGỮ ĐANG
 * HIỂN THỊ; đổi ngôn ngữ giao diện → vòng xoay reset từ đầu theo ngôn ngữ mới.
 * Rin có idle-float nhẹ ("thở") và entrance mượt khi load; mọi chuyển động
 * tôn trọng prefers-reduced-motion (kể cả bubble: chỉ fade, không spring).
 *
 * Ngoài ra lắng nghe sự kiện hover (CustomEvent rin:peek / rin:clear) từ Projects,
 * vùng Discord và các link "On the web": hover/chạm/focus → bubble hiện nội dung đó
 * (「...」), rời chuột / vuốt / blur → ẩn ngay.
 *
 * Cấu trúc HTML đã sửa cho ĐÚNG content model: nút là <button> chỉ chứa
 * <span>+<img> (phrasing content — trước đây div lồng trong button là sai spec,
 * gây nhiễu accessibility tree). Bubble + langNote là anh chị em của nút trong
 * wrapper position:relative → bubble không còn bị "lắc" theo bounce của Rin.
 *
 * Live region ẩn (aria-live=polite): chỉ thông báo cho screen reader khi người
 * dùng BẤM nút chủ động — không khi xoay ngôn ngữ 10s / hover peek (tránh ồn).
 *
 * Lắng nghe "rin:lang" { name, lang } (provider giao diện xoay vòng 10s):
 * hiện tên ngôn ngữ viết bằng chính ngôn ngữ đó trên đầu Rin (giống tooltip
 * "Say hi") + đồng bộ langRef và uiLang (tooltip/aria-label en/ja).
 * Cùng thời điểm nghe "rin:greet" { lang, slot }: Rin TỰ hiện câu chào mới theo
 * ngôn ngữ vừa chuyển — NHƯNG nhường nếu có peek hover đang hiển thị.
 */
const CornerRin = () => {
  const [bubble, setBubble] = useState(null)
  // Thông báo tên ngôn ngữ trên đầu Rin khi giao diện xoay vòng (sự kiện rin:lang)
  const [langNote, setLangNote] = useState(null)
  const langTimer = useRef(null)
  // Render-reactive (không phải ref): idle-float/entrance/sparkle/bubble quyết
  // định theo prefers-reduced-motion ngay ở render, không bị chờ mount.
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const controls = useAnimationControls()
  const idx = useRef(0)
  const bubbleTimer = useRef(null)
  // Đồng bộ bằng sự kiện (không context): langRef = ngôn ngữ đang hiển thị;
  // lastLang/lastSlot = nhóm câu của lần chào gần nhất → biết khi nào reset xoay.
  const langRef = useRef('en')
  const lastLang = useRef(null)
  const lastSlot = useRef(null)
  // Ngôn ngữ giao diện hiện tại (re-render) — đồng bộ chữ trên tooltip + aria-label
  const [uiLang, setUiLang] = useState('en')
  // Peek hover/focus đang hiển thị → lời chào TỰ ĐỘNG nhường chỗ (không chop
  // bubble người dùng đang chủ động xem); bấm nút Rin vẫn ưu tiên.
  const peekRef = useRef(false)
  // Live region cho screen reader: chỉ đọc khi người dùng BẤM chủ động.
  const [announce, setAnnounce] = useState('')
  const [annIdx, setAnnIdx] = useState(0)
  // Entrance chạy sau mount 1 frame: server và client hydrate cùng render
  // opacity 0 (khớp style) → setMounted(true) mới animate — tránh React
  // hydration mismatch warning khi framer lỡ animate giữa SSR và hydrate.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const imgH = useBreakpointValue({ base: 72, sm: 96, md: 128 })
  const inset = useBreakpointValue({ base: '8px', sm: '16px', md: '16px' })
  // Text bubble: base cho wrap (mobile, tên repo dài xuống dòng); sm+ ép 1 dòng.
  // Truncation đặt trên CHÍNH <span> (text-overflow chỉ chạy trên inline content
  // thật — nếu đặt ở Box chứa inline-block child, ellipsis không vẽ).
  const wrapBubble = useBreakpointValue({ base: true, sm: false, md: false })
  const bubbleBg = useColorModeValue(
    'rgba(255, 252, 247, 0.88)', // light: sữa ấm trong suốt → blur(10px) hiện rõ, hòa nền cream #f0e7db
    'rgba(23, 25, 42, 0.92)'
  )
  const bubbleBorder = useColorModeValue(
    'rgba(0, 0, 0, 0.5)',
    'rgba(255, 255, 255, 0.55)'
  )
  // Light: double-outline manga — [viền ink 2px] + [gap trắng 3px] + [viền ngoài ink 6px] + bóng mềm.
  // Dark: giữ nguyên ring màu thân + bóng cũ.
  const bubbleShadow = useColorModeValue(
    '0 0 0 3px rgba(255,255,255,0.95), 0 0 0 6px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.7)',
    '0 0 0 3px rgba(23,25,42,0.92), 0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)'
  )
  const bubbleText = useColorModeValue('#3d342a', 'whiteAlpha.900')
  const bubbleSheen = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0) 60%)',
    'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 55%)'
  )
  // Bubble không bao giờ tràn màn hình: cap theo viewport (min() — công nghệ CSS
  // hiện đại) + ngắt từ dài (overflow-wrap:anywhere) ở base, ellipsis từ sm.
  const bubbleMaxW = {
    base: 'min(240px, calc(100vw - 96px))',
    sm: 'min(240px, calc(100vw - 130px))',
    md: 'min(240px, calc(100vw - 150px))'
  }

  // ms mặc định 3000 — lời chào (greet/auto) giữ nguyên như cũ; riêng peek hover ngắn hơn
  const showBubble = (text, ms = 3000) => {
    setBubble(text)
    clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), ms)
  }

  // gLang/gSlot: bỏ trống → theo langRef + khung giờ hiện tại (bấm nút).
  // opts.random: tự chào chọn câu ngẫu nhiên; opts.bounce: mặc định có bounce.
  // opts.auto: lời chào TỰ ĐỘNG (load / xoay ngôn ngữ) — nhường nếu đang peek hover;
  // opts.announce: thông báo live-region (chỉ khi người dùng BẤM chủ động).
  const greet = (gLang, gSlot, opts = {}) => {
    const { random = false, bounce = true, auto = false, announce = false } = opts
    // bounce — cùng keyframes nade-bounce của nadeshiko, thêm xoay nhẹ cho "bồng bềnh"
    if (bounce && !reduced) {
      controls.start({
        y: [0, -14, 0, -5, 0],
        scale: [1, 1.06, 0.97, 1.02, 1],
        rotate: [0, -3, 2, 0],
        transition: { duration: 0.55, ease: 'easeInOut' }
      })
    }
    // Đang có peek hover/focus → lời chào tự động NHƯỜNG (không chop nội dung
    // người dùng đang xem). Bấm nút vẫn thắng — người dùng chủ động muốn nghe Rin.
    if (auto && peekRef.current) return
    const lang = typeof gLang === 'string' ? gLang : langRef.current
    const slot = gSlot || slotOf(new Date().getHours())
    const list = GREETINGS[slot][lang]
    // đổi ngôn ngữ hoặc sang khung giờ mới → reset từ câu đầu của nhóm mới;
    // ngược lại xoay tiếp trong 3 câu của cùng ngôn ngữ + khung giờ.
    if (lastLang.current !== lang || lastSlot.current !== slot) {
      lastLang.current = lang
      lastSlot.current = slot
      idx.current = random ? Math.floor(Math.random() * list.length) : 0
    } else {
      idx.current = (idx.current + 1) % list.length
    }
    showBubble(list[idx.current])
    // Live region: remount theo annIdx (key) → kể cả khi câu lặp lại text cũ,
    // screen reader vẫn đọc (aria-live chỉ đọc khi có thay đổi/region mới).
    if (announce) {
      setAnnounce(list[idx.current])
      setAnnIdx(n => n + 1)
    }
  }

  useEffect(() => {
    // Tự chào 1 lần khi load: ngẫu nhiên một câu EN trong khung giờ hiện tại
    // (giao diện mặc định EN — như nadeshiko). auto → nhường peek đang hiển thị.
    const t = setTimeout(() => {
      greet('en', slotOf(new Date().getHours()), {
        random: true,
        bounce: false,
        auto: true
      })
    }, 500)
    return () => {
      clearTimeout(t)
      clearTimeout(bubbleTimer.current)
      controls.stop()
    }
  }, [])

  // Lắng nghe hover/focus từ Projects + On-the-web + status-card: bubble hiện nội
  // dung; rời chuột / blur / vuốt → ẩn ngay. peekRef nhớ trạng thái đang xem.
  useEffect(() => {
    const onPeek = e => {
      const name = e && e.detail
      if (name) {
        peekRef.current = true
        showBubble(`「${name}」`, 2500)
      }
    }
    const onClear = () => {
      peekRef.current = false
      clearTimeout(bubbleTimer.current)
      setBubble(null)
    }
    window.addEventListener('rin:peek', onPeek)
    window.addEventListener('rin:clear', onClear)
    return () => {
      window.removeEventListener('rin:peek', onPeek)
      window.removeEventListener('rin:clear', onClear)
      clearTimeout(bubbleTimer.current)
    }
  }, [])

  // Giao diện xoay ngôn ngữ (provider bắn "rin:lang" { name, lang }): hiện tên
  // ngôn ngữ (viết bằng chính ngôn ngữ đó) trên đầu Rin, giống tooltip "Say hi",
  // tự ẩn sau ~2.2s — không đụng bubble chào. Đồng thời ghi langRef (ngôn ngữ
  // chào) + uiLang (re-render: tooltip/aria-label theo ngôn ngữ đang hiển thị).
  useEffect(() => {
    const onLang = e => {
      const d = e && e.detail
      if (!d) return
      if (d.lang) {
        langRef.current = d.lang
        setUiLang(d.lang)
      }
      setLangNote(d.name)
      clearTimeout(langTimer.current)
      langTimer.current = setTimeout(() => setLangNote(null), 2200)
    }
    window.addEventListener('rin:lang', onLang)
    return () => {
      window.removeEventListener('rin:lang', onLang)
      clearTimeout(langTimer.current)
    }
  }, [])

  // Cùng thời điểm đổi ngôn ngữ, provider bắn "rin:greet" { lang, slot }:
  // Rin TỰ hiện câu chào mới theo ngôn ngữ vừa chuyển (không bounce — nhẹ nhàng
  // như lúc tự chào khi load; auto → nhường peek đang hover) → bubble luôn đồng
  // bộ với giao diện nhưng không bao giờ chop nội dung người dùng đang xem.
  useEffect(() => {
    const onGreet = e => {
      const d = e && e.detail
      if (!d || !d.lang || !GREETINGS[d.slot]) return
      greet(d.lang, d.slot, { random: true, bounce: false, auto: true })
    }
    window.addEventListener('rin:greet', onGreet)
    return () => window.removeEventListener('rin:greet', onGreet)
  }, [])

  return (
    <Box
      position="fixed"
      right={inset}
      bottom={`calc(${inset} + env(safe-area-inset-bottom))`}
      zIndex={30}
      css={{
        '& button:focus-visible': {
          outline: '2px solid #73daca',
          outlineOffset: 4,
          borderRadius: 12
        },
        // tooltip "Say hi" hiện trên đầu khi hover
        '& [data-tooltip]::before': {
          content: 'attr(data-tooltip)',
          marginBottom: '8px',
          padding: '6px 12px',
          borderRadius: 10,
          background: bubbleBg,
          color: bubbleText,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(8px)',
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s ease, transform 0.2s ease, visibility 0.2s',
          pointerEvents: 'none',
          zIndex: 34
        },
        '& [data-tooltip]::after': {
          content: "''",
          marginBottom: '-2px',
          border: '5px solid transparent',
          borderTopColor: bubbleBg,
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(8px)',
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s ease, transform 0.2s ease, visibility 0.2s',
          pointerEvents: 'none',
          zIndex: 34
        },
        // hiện khi hover HOẶC focus bàn phím (focus-visible) — trước đây hover-only
        '& [data-tooltip]:hover::before, & [data-tooltip]:hover::after, & [data-tooltip]:focus-visible::before, & [data-tooltip]:focus-visible::after': {
          opacity: 1,
          visibility: 'visible',
          transform: 'translateX(-50%) translateY(0)'
        }
      }}
    >
      {/* Live region ẩn — THÔNG BÁO khi người dùng BẤM nút chủ động (không xoay
          ngôn ngữ 10s / hover peek → tránh ồn lặp mãi cho screen reader). */}
      <Box key={annIdx} as="span" aria-live="polite" __css={visuallyHiddenStyle}>
        {announce}
      </Box>
      <motion.div
        initial={
          reduced || mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
        }
        animate={
          reduced
            ? { opacity: 1, y: 0 }
            : mounted
              ? {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: 'easeOut' }
                }
              : { opacity: 0, y: 24 }
        }
        whileHover={
          reduced
            ? undefined
            : { y: -6, transition: { type: 'spring', stiffness: 220, damping: 16 } }
        }
        // Wrapper định vị — bubble + langNote là ANH EM của nút (không nằm trong
        // <button>: div lồng trong button sai content model HTML).
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <motion.button
          animate={controls}
          type="button"
          data-tooltip={SAYHI[uiLang]}
          aria-label={TALK_LABEL[uiLang]}
          onClick={() => greet(undefined, undefined, { announce: true })}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              greet(undefined, undefined, { announce: true })
            }
          }}
          whileTap={
            reduced
              ? undefined
              : { scale: 0.98, transition: { type: 'spring', stiffness: 220, damping: 16 } }
          }
          style={{
            position: 'relative',
            padding: 0,
            border: 0,
            background: 'none',
            cursor: 'pointer',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            // chống double-tap-zoom delay trên mobile
            touchAction: 'manipulation'
          }}
        >
          {/* idle-float: Rin "thở" nhẹ liên tục; lớp riêng quanh img nên không
              xung đột với bounce (controls trên button) hay hover/tap.
              Dùng <span> (phrasing content) để button hợp lệ HTML. */}
          <motion.span
            animate={reduced ? { y: 0 } : { y: [0, -3, 0] }}
            transition={
              reduced
                ? undefined
                : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ display: 'block', willChange: 'transform' }}
          >
            <img
              src="/images/rin.png"
              alt="Rin — Yuru Camp△"
              draggable={false}
              decoding="async"
              // width/height thật (199×300) → dự trữ tỷ lệ, tránh CLS góc trang
              width={RIN_W}
              height={RIN_H}
              style={{ display: 'block', height: imgH, width: 'auto' }}
            />
          </motion.span>
        </motion.button>
        <AnimatePresence>
          {bubble && (
            <motion.div
              id="rin-bubble"
              key="rin-bubble"
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 14, rotate: -5 }
              }
              animate={
                reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, rotate: 0 }
              }
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0.1, ease: 'easeOut' } }
                  : { opacity: 0, scale: 0.94, y: 6, rotate: 0, transition: { duration: 0.16, ease: 'easeOut' } }
              }
              transition={
                reduced
                  ? { duration: 0.12, ease: 'easeOut' }
                  : { type: 'spring', stiffness: 380, damping: 30 }
              }
              style={{
                position: 'absolute',
                right: 'calc(100% + 14px)',
                bottom: '35%',
                transformOrigin: 'right center',
                pointerEvents: 'none',
                zIndex: 31
              }}
            >
              <Box
                position="relative"
                maxW={bubbleMaxW}
                borderRadius="18px 18px 18px 6px"
                bg={bubbleBg}
                border="2px solid"
                borderColor={bubbleBorder}
                backdropFilter="blur(10px)"
                boxShadow={bubbleShadow}
                px={4}
                py={2.5}
                // Mobile hẹp: cho wrap + ngắt từ dài; từ sm giữ nowrap + ellipsis
                // (isTruncated trên Text) — bubble không bao giờ vỡ màn hình.
                whiteSpace={{ base: 'normal', sm: 'nowrap', md: 'nowrap' }}
                // aria-hidden: nội dung bubble là đồ họa; nút (aria-label) + live
                // region ẩn đảm nhiệm phần thông báo cho screen reader (tránh đọc đúp).
                aria-hidden="true"
                css={{
                  // đuôi bong bóng: lớp viền
                  '&::before': {
                    content: "''",
                    position: 'absolute',
                    right: '-12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderTop: '9px solid transparent',
                    borderBottom: '9px solid transparent',
                    borderLeft: `12px solid ${bubbleBorder}`,
                    zIndex: -10
                  },
                  // đuôi bong bóng: lớp lõi (cùng màu thân, tạo viền cho đuôi)
                  '&::after': {
                    content: "''",
                    position: 'absolute',
                    right: '-9px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderTop: '7.5px solid transparent',
                    borderBottom: '7.5px solid transparent',
                    borderLeft: `10px solid ${bubbleBg}`,
                    zIndex: -10
                  }
                }}
              >
                {/* highlight mềm phía trên thân bubble */}
                <Box
                  position="absolute"
                  inset={0}
                  borderRadius="inherit"
                  background={bubbleSheen}
                  pointerEvents="none"
                />
                {/* kirakira ✦ — chấm sao anime góc bubble, pop theo bubble (decor, không chặn click) */}
                {!reduced && (
                  <motion.span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: -11,
                      right: -7,
                      fontSize: 15,
                      lineHeight: 1,
                      color: '#f0bc4e',
                      pointerEvents: 'none',
                      zIndex: 32
                    }}
                    initial={{ scale: 0, rotate: -40, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 16,
                      delay: 0.06
                    }}
                  >
                    ✦
                  </motion.span>
                )}
                <Text
                  fontSize="13.5px"
                  lineHeight="1.35"
                  fontWeight="semibold"
                  color={bubbleText}
                  userSelect="none"
                >
                  {/* key=bubble → mỗi lần đổi nội dung remount <span>, chạy micro-fade 0.18s mượt;
                      reduced → không dịch chuyển, chỉ hiện.
                      Base (mobile): inline-block + maxWidth 100% + overflow-wrap:anywhere
                        (overflowWrap phải đặt TRÊN span — text nằm trong formatting
                        context của span, đặt ở <p> không ngấm vào inline-block → token
                        dài vẫn tràn màn hình).
                      sm+: block + nowrap + ellipsis → 1 dòng, không tràn. */}
                  <motion.span
                    key={bubble}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 3 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.18, ease: 'easeOut' }
                    }
                    style={
                      wrapBubble
                        ? {
                            display: 'inline-block',
                            maxWidth: '100%',
                            // break-word (KHÔNG phải anywhere): anywhere làm min-content
                            // co về 1 ký tự → bubble shrink-wrap sụp ~50px, token dài vỡ
                            // trăm dòng; break-word chỉ ngắt khi cần → giữ co giãn tự nhiên
                            overflowWrap: 'break-word'
                          }
                        : {
                            display: 'block',
                            maxWidth: '100%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                    }
                  >
                    {bubble}
                  </motion.span>
                </Text>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Thông báo ngôn ngữ khi giao diện xoay vòng — nằm trên đầu Rin,
            style giống tooltip "Say hi" (bubble nhỏ + mũi chĩa xuống Rin) */}
        <AnimatePresence>
          {langNote && (
            <motion.div
              id="rin-lang-note"
              key="rin-lang-note"
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, x: '-50%', y: 10, scale: 0.85 }
              }
              animate={
                reduced ? { opacity: 1 } : { opacity: 1, x: '-50%', y: 0, scale: 1 }
              }
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0.1, ease: 'easeOut' } }
                  : { opacity: 0, x: '-50%', y: 6, scale: 0.9, transition: { duration: 0.18, ease: 'easeOut' } }
              }
              transition={
                reduced
                  ? { duration: 0.12, ease: 'easeOut' }
                  : { type: 'spring', stiffness: 380, damping: 28 }
              }
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 10px)',
                left: '50%',
                transformOrigin: 'bottom center',
                pointerEvents: 'none',
                zIndex: 33,
                whiteSpace: 'nowrap'
              }}
            >
              <Box
                position="relative"
                px={3}
                py={1.5}
                borderRadius={10}
                bg={bubbleBg}
                color={bubbleText}
                border="1.5px solid"
                borderColor={bubbleBorder}
                backdropFilter="blur(10px)"
                boxShadow="0 4px 12px rgba(0,0,0,0.25)"
                fontSize="12px"
                fontWeight={700}
                textShadow="0 1px 0 rgba(255,255,255,0.25)"
                aria-hidden="true"
                css={{
                  // mũi nhọn chĩa xuống đầu Rin
                  '&::after': {
                    content: "''",
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    border: '6px solid transparent',
                    borderTopColor: bubbleBg
                  }
                }}
              >
                {langNote}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Box>
  )
}

export default CornerRin