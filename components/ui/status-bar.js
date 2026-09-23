import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  visuallyHiddenStyle
} from '@chakra-ui/react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  useDiscordPresence,
  DISCORD_USER_ID
} from '../../lib/use-discord-presence'
import { DiscordBadges } from './discord-badges'
// Bubble "Rin xem chung" dùng chung (xem lib/rin-peek.js)
import { rinPeek, rinClear } from '../../lib/rin-peek'
// Ngôn ngữ giao diện xoay vòng 10s + từ điển text (en/ja)
import { useInterfaceLang } from '../../lib/interface-lang'
import { UI } from '../../lib/interface-labels'

// Trạng thái: nhãn theo 2 thứ tiếng, đổi theo vòng quay giao diện 10s;
// màu dot giữ theo Discord chuẩn. Export để status-dot dùng chung.
export const STATUS = {
  online: {
    labels: { en: 'Online', ja: 'オンライン' },
    color: '#73daca'
  },
  idle: {
    labels: { en: 'Idle', ja: '退席中' },
    color: '#faa61a'
  },
  dnd: {
    labels: { en: 'Do not disturb', ja: '取り込み中' },
    color: '#f04747'
  },
  offline: {
    labels: { en: 'Offline', ja: 'オフライン' },
    color: '#9b9ba5'
  }
}

// Màu viền avatar theo trạng thái (Discord colors chuẩn)
const AVATAR_COLOR = {
  online: '#3BA55B',
  idle: '#FAA61A',
  dnd: '#F04747',
  offline: '#747F8D'
}

// Nhịp pulse "đang online" — giữ animation vô hạn chỉ khi người dùng
// không yêu cầu prefers-reduced-motion (nếu reduce: tĩnh, dot vẫn hiển thị).
export const DiscordDot = ({ color, pulse = false, size = 10 }) => {
  const reduced = useReducedMotion()
  const active = pulse && !reduced
  return (
    <motion.span
      animate={active ? { scale: [1, 1.4, 1] } : { scale: 1 }}
      transition={
        active
          ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          : { duration: 0.2 }
      }
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}`,
        marginRight: 6,
        flexShrink: 0,
        verticalAlign: 'middle'
      }}
    />
  )
}

/**
 * CampScene — icon SVG 22px phản ánh trạng thái
 * Discord qua motif Yuru Camp△ (giữ màu dot chuẩn Discord riêng bên cạnh):
 *   online  → lửa trại + than hồng bốc lên (béng lửa chập chờn)
 *   idle    → lều + đèn lồng ấm (ánh sáng hít thở chậm)
 *   dnd     → ấm trà đang sôi + hơi nước ("đang bận — trà đang ủ")
 *   offline → lều tối + trăng lưỡi liềm (đang ngủ — giữ im lặng)
 * Thuần trang trí (aria-hidden, không text) + transform/opacity only + tôn
 * trọng prefers-reduced-motion → không ảnh hưởng bất biến hình học en≡ja.
 */
const CampScene = ({ status }) => {
  const reduced = useReducedMotion()
  const ember = useColorModeValue('#dd8a2e', '#f2a541')
  const emberHot = useColorModeValue('#f5a93f', '#ffcf6b')
  const ink = useColorModeValue('#4b3f31', '#ece8dd')
  const teal = useColorModeValue('#188f7f', '#73daca')
  const grey = '#9b9ba5'

  const still = { duration: 0 }
  const base = {
    width: 22,
    height: 22,
    display: 'block',
    pointerEvents: 'none'
  }

  if (status === 'online') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={base}>
        <motion.g
          animate={reduced ? { opacity: 1 } : { opacity: [1, 0.74, 1] }}
          transition={
            reduced
              ? still
              : { repeat: Infinity, duration: 2.3, ease: 'easeInOut' }
          }
        >
          <circle cx="12" cy="13.6" r="6.6" fill={ember} opacity="0.14" />
          <path
            d="M12 3.2 C13.9 6.3 15.8 8.6 15.8 11.9 A3.8 3.8 0 0 1 8.2 11.9 C8.2 8.6 10.1 6.3 12 3.2 Z"
            fill={ember}
          />
          <path
            d="M12 9 C12.9 10.4 13.8 11.3 13.8 12.8 A1.8 1.8 0 0 1 10.2 12.8 C10.2 11.3 11.1 10.4 12 9 Z"
            fill={emberHot}
          />
        </motion.g>
        <motion.circle
          cx="9.4"
          cy="7.4"
          r="1.1"
          fill={emberHot}
          animate={reduced ? { opacity: 0.85 } : { opacity: [0, 0.95, 0] }}
          transition={
            reduced
              ? still
              : { repeat: Infinity, duration: 1.9, delay: 0.7, ease: 'easeOut' }
          }
        />
        <path d="M6.8 17.6 L17.2 15.4" stroke={ink} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
        <path d="M6.8 15.4 L17.2 17.6" stroke={ink} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      </svg>
    )
  }

  if (status === 'idle') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={base}>
        <path
          d="M5 15.4 L12 6.6 L19 15.4 Z"
          fill="none"
          stroke={ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <path d="M12 6.6 L12 15.4" stroke={ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
        <motion.circle
          cx="12"
          cy="15"
          r="2.5"
          fill={ember}
          animate={reduced ? { opacity: 0.7 } : { opacity: [0.45, 0.95, 0.45] }}
          transition={
            reduced
              ? still
              : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
          }
        />
      </svg>
    )
  }

  if (status === 'dnd') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={base}>
        <g
          fill="none"
          stroke={teal}
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.85"
        >
          <motion.path
            d="M9.2 7.4 q1.1 -1.5 0 -2.8"
            animate={reduced ? { opacity: 0.75 } : { opacity: [0, 0.9, 0] }}
            transition={
              reduced
                ? still
                : { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }
            }
          />
          <motion.path
            d="M12.6 8.4 q1.1 -1.5 0 -2.9"
            animate={reduced ? { opacity: 0.75 } : { opacity: [0, 0.9, 0] }}
            transition={
              reduced
                ? still
                : {
                    repeat: Infinity,
                    duration: 2.4,
                    delay: 1.15,
                    ease: 'easeInOut'
                  }
            }
          />
          <path d="M8.6 15.6 A3.4 3.4 0 0 1 15.4 15.6 Z" fill={teal} opacity="0.9" />
          <path d="M15.4 13.7 L17.9 12.2" />
          <path d="M12.4 12.6 V11.6 a1.3 1.3 0 0 1 2.6 0" />
        </g>
      </svg>
    )
  }

  // offline
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={base}>
      <path
        d="M14.6 6.2 A5.6 5.6 0 1 0 17.8 14.4 A4.3 4.3 0 0 1 14.6 6.2 Z"
        fill={grey}
      />
      <circle cx="7" cy="7.8" r="1" fill={grey} opacity="0.75" />
      <path
        d="M8.6 16.4 L12.2 11.8 L15.8 16.4 Z"
        fill="none"
        stroke={ink}
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  )
}

/**
 * CampHalo — "hào quang bãi trại": trang trí chuyển động mượt QUANH viền avatar,
 * phản ánh trạng thái Discord bằng cùng ngôn ngữ motif với CampScene:
 *   online  → lửa trại: quầng hơi ấm hít thở + 3 tia lửa ember bay quanh viền
 *   idle    → đèn lồng: 2 vòng sóng ánh sáng lan ra dịu dàng khỏi viền
 *   dnd     → ấm trà sôi: hơi nước teal bốc lên từ đỉnh avatar
 *   offline → đang ngủ: 1 ngôi sao lấp lánh thật chậm, êm ái
 * Thuần trang trí (aria-hidden), absolute → không đụng bố cục (giữ bất biến
 * en≡ja); transform/opacity-only + tôn trọng prefers-reduced-motion (tĩnh,
 * nét trang trí vẫn hiện).
 */
const CampHalo = ({ status }) => {
  const reduced = useReducedMotion()
  const ember = useColorModeValue('#dd8a2e', '#f2a541')
  const emberSoft = useColorModeValue('#f4a23f', '#ffcf6b')
  const teal = useColorModeValue('#188f7f', '#73daca')
  const grey = '#9b9ba5'
  const still = { duration: 0 }

  if (status === 'online') {
    return (
      <>
        {/* Hơi ấm lửa trại — quầng hít thở quanh avatar */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ember}30 0%, transparent 64%)`,
            pointerEvents: 'none'
          }}
          animate={reduced ? { opacity: 0.6 } : { opacity: [0.5, 0.95, 0.5] }}
          transition={
            reduced ? still : { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }
          }
        />
        {/* 3 tia lửa ember bay vòng quanh viền (mỗi tia 1 quỹ đạo riêng) */}
        {[0, 120, 240].map(baseDeg => (
          <motion.span
            key={baseDeg}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            animate={reduced ? { rotate: baseDeg } : { rotate: baseDeg + 360 }}
            transition={
              reduced ? still : { repeat: Infinity, duration: 9, ease: 'linear' }
            }
          >
            <motion.span
              style={{
                position: 'absolute',
                top: -3,
                left: '50%',
                width: 6,
                height: 6,
                marginLeft: -3,
                borderRadius: '50%',
                background: emberSoft,
                boxShadow: `0 0 6px ${ember}, 0 0 12px ${emberSoft}`
              }}
              animate={reduced ? { opacity: 0.9 } : { opacity: [0.45, 1, 0.45] }}
              transition={
                reduced
                  ? still
                  : {
                      repeat: Infinity,
                      duration: 1.7,
                      ease: 'easeInOut',
                      delay: (baseDeg / 120) * 0.4
                    }
              }
            />
          </motion.span>
        ))}
      </>
    )
  }

  if (status === 'idle') {
    return (
      <>
        {/* Ánh đèn lồng hít thở chậm */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ember}24 0%, transparent 62%)`,
            pointerEvents: 'none'
          }}
          animate={reduced ? { opacity: 0.5 } : { opacity: [0.4, 0.8, 0.4] }}
          transition={
            reduced ? still : { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
          }
        />
        {/* 2 vòng sóng lan ra khỏi viền như ánh đèn lay động */}
        {[0, 1].map(i => (
          <motion.span
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1.5px solid',
              borderColor: ember,
              pointerEvents: 'none'
            }}
            animate={
              reduced ? { opacity: 0.28, scale: 1 } : { opacity: [0.5, 0], scale: [1, 1.38] }
            }
            transition={
              reduced ? still : { repeat: Infinity, duration: 2.4, ease: 'easeOut', delay: i * 1.1 }
            }
          />
        ))}
      </>
    )
  }

  if (status === 'dnd') {
    return (
      <>
        {/* Teal nhẹ — ấm nước đang sôi */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${teal}1f 0%, transparent 60%)`,
            pointerEvents: 'none'
          }}
          animate={reduced ? { opacity: 0.4 } : { opacity: [0.3, 0.7, 0.3] }}
          transition={
            reduced ? still : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
          }
        />
        {/* Hơi nước bốc lên đỉnh avatar */}
        <Box
          position="absolute"
          top={-4}
          left="50%"
          marginLeft={-8}
          w="16px"
          h="14px"
          pointerEvents="none"
          aria-hidden="true"
        >
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none" focusable="false">
            <motion.path
              d="M4 13 Q4.8 9.5 4 5"
              stroke={teal}
              strokeWidth="1.8"
              strokeLinecap="round"
              animate={reduced ? { opacity: 0.7 } : { opacity: [0, 0.85, 0] }}
              transition={
                reduced ? still : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
              }
            />
            <motion.path
              d="M9 13 Q9.9 8.6 9 3.6"
              stroke={teal}
              strokeWidth="1.8"
              strokeLinecap="round"
              animate={reduced ? { opacity: 0.7 } : { opacity: [0, 0.85, 0] }}
              transition={
                reduced
                  ? still
                  : { repeat: Infinity, duration: 2.2, delay: 1.1, ease: 'easeInOut' }
              }
            />
          </svg>
        </Box>
      </>
    )
  }

  // offline — ngủ yên: ngôi sao lấp lánh thật dịu, không ồn ào
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: -3,
        right: -4,
        pointerEvents: 'none'
      }}
      animate={reduced ? { opacity: 0.6 } : { opacity: [0.3, 0.8, 0.3] }}
      transition={reduced ? still : { repeat: Infinity, duration: 5, ease: 'easeInOut' }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path
          d="M6 1.5 C6.7 4 7.9 5.2 10.4 5.9 C7.9 6.6 6.7 7.8 6 10.3 C5.3 7.8 4.1 6.6 1.6 5.9 C4.1 5.2 5.3 4 6 1.5 Z"
          fill={grey}
        />
      </svg>
    </motion.div>
  )
}

const getActivityText = (presence, lang) => {
  if (!presence) return null

  const spotify = presence.spotify && presence.listening_to_spotify
  const game = presence.activities?.find(a => a.type === 0)
  const custom = presence.activities?.find(a => a.type === 4)

  if (spotify) {
    return {
      icon: '🎵',
      text: `${UI.listening[lang]} ${spotify.song} - ${spotify.artist}`,
      sub: spotify.album,
      art: spotify.album_art_url
    }
  }
  if (game) {
    return {
      icon: '🎮',
      text: `${UI.playing[lang]} ${game.name}`,
      sub: game.details || game.state || null
    }
  }
  if (custom && custom.state) {
    return { icon: '✨', text: custom.state }
  }
  return null
}

const StatusBar = () => {
  const reduced = useReducedMotion()
  const presence = useDiscordPresence(DISCORD_USER_ID)
  // Token camp.*: bề mặt giấy card, chữ mờ, pill phụ — thay cho hex rải rác.
  const bg = 'camp.card'
  const muted = 'camp.muted'
  const pillBg = 'camp.cardAlt'
  const pillBorder = 'camp.line'
  // Bóng clay hai lớp: highlight mép trên + đổ bóng mềm xuống dưới
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 16px 32px -20px rgba(120,90,40,0.42), 0 4px 10px -6px rgba(120,90,40,0.18)',
    'inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 32px -20px rgba(0,0,0,0.6), 0 4px 10px -6px rgba(0,0,0,0.35)'
  )
  // Bóng hover "nhấc sticker lên" — chỉ transform/opacity, gated reduced-motion
  const hoverShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.7), 0 24px 46px -22px rgba(120,90,40,0.5), 0 6px 14px -6px rgba(120,90,40,0.24)',
    'inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 46px -22px rgba(0,0,0,0.65), 0 6px 14px -6px rgba(0,0,0,0.4)'
  )
  // Dải băng dính scrapbook góc card (nét quen thuộc của artbook Yuru Camp△)
  const tapeColor = useColorModeValue('rgba(24,143,127,0.20)', 'rgba(115,218,202,0.12)')
  const tapeEdge = useColorModeValue('rgba(24,143,127,0.10)', 'rgba(115,218,202,0.06)')
  // Ngôn ngữ theo vòng quay chung của giao diện (10s): Anh ↔ Nhật
  const { lang } = useInterfaceLang()

  // Điểm chung của cả 2 khung (connecting / đã nạp): nền giấy + bóng clay
  const sheet = {
    borderRadius: 'card',
    px: 4,
    py: 4,
    bg,
    border: '1.5px solid',
    borderColor: pillBorder,
    boxShadow: cardShadow,
    position: 'relative',
    css: {
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.22s ease, box-shadow 0.28s ease'
    }
  }

  // Dải băng dính — hoàn toàn trang trí, không chiếm layout
  const tape = (
    <Box
      position="absolute"
      top="-8px"
      left="20px"
      w="46px"
      h="13px"
      borderRadius="2px"
      transform="rotate(-4deg)"
      bg={tapeColor}
      boxShadow="0 1px 2px rgba(0,0,0,0.10)"
      pointerEvents="none"
      aria-hidden="true"
      zIndex={1}
      css={{
        backgroundImage: `linear-gradient(90deg, transparent 0%, ${tapeEdge} 28%, transparent 100%)`
      }}
    />
  )

  // Khuôn ra-vào của từng "màn" (connecting ↔ card): opacity+y, không layout
  const enter = reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
  const leave = reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }
  const fade = { duration: 0.22, ease: 'easeOut' }

  return (
    <AnimatePresence mode="wait">
      {!presence ? (
        <motion.div key="connecting" initial={enter} animate={{ opacity: 1, y: 0 }} exit={leave} transition={fade}>
          <Box {...sheet} mb={6} textAlign="center" _hover={reduced ? undefined : { transform: 'translateY(-2px)', boxShadow: hoverShadow }}>
            {tape}
            <Flex alignItems="center" justifyContent="center" columnGap={2}>
              {/* Lều bé "đang dựng" — spring một lần, không lặp */}
              <motion.svg
                initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 15 }}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M4.5 15.6 L12 6.4 L19.5 15.6 Z"
                  fill="none"
                  stroke="var(--chakra-colors-camp-ember, #dd8a2e)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                <path d="M12 6.4 L12 15.6" stroke="var(--chakra-colors-camp-ember, #dd8a2e)" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
              </motion.svg>
              <Text fontSize="sm" opacity={0.8}>
                {UI.connecting[lang]}
              </Text>
            </Flex>
          </Box>
        </motion.div>
      ) : (
        <motion.div key="card" initial={enter} animate={{ opacity: 1, y: 0 }} exit={leave} transition={fade}>
          <StatusPresent
            presence={presence}
            lang={lang}
            sheet={sheet}
            tape={tape}
            hoverShadow={hoverShadow}
            reduced={reduced}
            muted={muted}
            pillBg={pillBg}
            pillBorder={pillBorder}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Card đã nạp presence — tách riêng để StatusBar gọn; status thay đổi real-time
// (lên/xuống líne) làm nhấp nháy ring + viền qua CSS transition 0.4s.
const StatusPresent = ({
  presence,
  lang,
  sheet,
  tape,
  hoverShadow,
  reduced,
  muted,
  pillBg,
  pillBorder
}) => {
  const status = STATUS[presence.discord_status] || STATUS.offline
  const avatarColor =
    AVATAR_COLOR[presence.discord_status] || AVATAR_COLOR.offline
  const activity = getActivityText(presence, lang)
  const online = presence.discord_status === 'online'
  const user = presence.discord_user || {}
  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : null
  const guild = user.primary_guild
  const name =
    user.display_name || user.global_name || user.username || 'Discord'
  const subName = user.username ? `@${user.username}` : ''

  // Live region: chỉ THÔNG BÁO khi trạng thái Discord ĐỔI THẬT (lên máy ↔ đi
  // ngủ ↔ offline...), không đọc lại mỗi 10s khi vòng quay ngôn ngữ remount
  // label (tránh ồn cho screen reader). Text ẩn thị giác, aria-live=polite.
  const prevStatus = useRef(presence.discord_status)
  const [announce, setAnnounce] = useState('')
  useEffect(() => {
    if (prevStatus.current === presence.discord_status) return
    prevStatus.current = presence.discord_status
    setAnnounce(`Discord: ${status.labels[lang]}`)
  }, [presence.discord_status, status.labels[lang]])

  return (
    <Box
      {...sheet}
      mb={6}
      _hover={reduced ? undefined : { transform: 'translateY(-2px)', boxShadow: hoverShadow }}
      // Hover/touch → Rin hiện bubble 「@username」 (giống card project).
      onMouseEnter={() => rinPeek(subName || name)}
      onMouseLeave={rinClear}
      onTouchStart={() => rinPeek(subName || name)}
      onTouchMove={rinClear}
      onTouchCancel={rinClear}
    >
      {tape}
      {/* Live region ẩn — đọc khi status Discord đổi thật (không theo vòng quay ngôn ngữ) */}
      <Box as="span" aria-live="polite" __css={visuallyHiddenStyle}>
        {announce}
      </Box>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        rowGap={2}
        columnGap={4}
        textAlign={{ base: 'center', sm: 'left' }}
      >
        {/* BÊN TRÁI: avatar + tên */}
        <Flex alignItems="center" columnGap={3}>
          {/* Hào quang bãi trại — trang trí chuyển động quanh viền avatar,
              crossfade theo status (absolute → không layout shift) */}
          <Box position="relative" flexShrink={0} w="52px" h="52px">
            <Box
              position="absolute"
              top="-6px"
              right="-6px"
              bottom="-6px"
              left="-6px"
              pointerEvents="none"
              aria-hidden="true"
              zIndex={0}
            >
              <AnimatePresence mode="sync" initial={false}>
                <motion.span
                  key={presence.discord_status || 'offline'}
                  style={{ position: 'absolute', inset: 0 }}
                  initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? { opacity: 1 } : { opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
                >
                  <CampHalo status={presence.discord_status || 'offline'} />
                </motion.span>
              </AnimatePresence>
            </Box>
            {avatar ? (
              <img
                src={avatar}
                alt="Discord avatar"
                // width/height gốc (64×64 từ ?size=64) → trình duyệt reserve
                // đúng khung trước khi ảnh tải xong (chống CLS). Dùng <img> gốc
                // vì Chakra Box sẽ nuốt width/height thành CSS, không sinh attribute.
                width="64"
                height="64"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  border: `3px solid ${avatarColor}`,
                  boxShadow: `0 0 0 3px ${avatarColor}26, 0 0 18px ${avatarColor}33`,
                  objectFit: 'cover',
                  // Status đổi real-time → màu nhẫn + quầng trượt mượt 0.4s
                  transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
                }}
              />
            ) : (
              <Box
                position="relative"
                zIndex={1}
                w="52px"
                h="52px"
                borderRadius="full"
                border="3px solid"
                borderColor={avatarColor}
                boxShadow={`0 0 0 3px ${avatarColor}26`}
                bg="camp.tealSoft"
                css={{
                  transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
                }}
              />
            )}
          </Box>
          <Box lineHeight="1.15">
            <Flex
              alignItems="center"
              columnGap={2}
              flexWrap="wrap"
              justifyContent={{ base: 'center', sm: 'flex-start' }}
            >
              <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }} color="camp.text">
                {name}
              </Text>
              {/* Huy hiệu Discord đóng khung "thẻ tem sưu tầm" (viền nét đứt) —
                  motif stamp rally; độ cao không đổi theo ngôn ngữ → an toàn en≡ja */}
              {user.public_flags ? (
                <Flex
                  as="span"
                  alignItems="center"
                  px={1.5}
                  py="2px"
                  borderRadius="full"
                  border="1.5px dashed"
                  borderColor="camp.lineStrong"
                  bg={pillBg}
                  title="Collected trail stamps"
                >
                  <DiscordBadges publicFlags={user.public_flags} />
                </Flex>
              ) : null}
              {guild && guild.identity_enabled ? (
                <Flex
                  alignItems="center"
                  columnGap={1}
                  title={`Server profile: ${guild.tag}`}
                  px={1.5}
                  py="1px"
                  borderRadius="full"
                  bg={pillBg}
                  border="1px solid"
                  borderColor={pillBorder}
                >
                  <img
                    src="/images/badge-clan.png"
                    alt=""
                    // width/height gốc (32×32) → reserve khung, chống CLS
                    width="32"
                    height="32"
                    style={{ width: 16, height: 16, flexShrink: 0, display: 'inline-block' }}
                  />
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    opacity={0.9}
                    whiteSpace="nowrap"
                  >
                    {guild.tag}
                  </Text>
                </Flex>
              ) : null}
              </Flex>
            {subName ? (
              <Text fontSize="xs" opacity={0.75} color="camp.muted">
                {subName}
              </Text>
            ) : null}
          </Box>
        </Flex>

        {/* BÊN PHẢI: trạng thái + đang làm gì
            Mobile: xuống hàng riêng (felx 1 0 100%) để en/ja cùng cấu trúc —
            nếu không, "オンライン" (nowrap) không vừa cạnh cột trái → chỉ ja
            bị đẩy xuống → lệch chiều cao card giữa 2 ngôn ngữ (bất biến en≡ja). */}
        <Flex
          alignItems="center"
          justifyContent={{ base: 'center', sm: 'flex-end' }}
          flex={{ base: '1 0 100%', sm: '1' }}
          columnGap={3}
          flexWrap="wrap"
        >
          <Flex alignItems="center" columnGap={2} whiteSpace="nowrap">
            {/* Scene crossfade trong khung 22px cố định
                (absolute → không đổi layout khi đổi status) */}
            <Box as="span" position="relative" display="inline-flex" w="22px" h="22px" flexShrink={0} aria-hidden="true">
              <AnimatePresence mode="sync" initial={false}>
                <motion.span
                  key={presence.discord_status || 'offline'}
                  style={{ position: 'absolute', inset: 0 }}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 1 } : { opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
                >
                  <CampScene status={presence.discord_status || 'offline'} />
                </motion.span>
              </AnimatePresence>
            </Box>
            <Text fontSize="sm" fontWeight="medium" color="camp.text">
              <DiscordDot color={status.color} pulse={online} />
              {/* key=label → đổi ngôn ngữ theo vòng quay 10s, remount span chạy micro-fade 0.25s mượt */}
              <motion.span
                key={status.labels[lang]}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ display: 'inline-block' }}
              >
                {status.labels[lang]}
              </motion.span>
            </Text>
          </Flex>
          {/* Activity/nghỉ ngơi — crossfade khi đổi bài hát/game/trạng thái */}
          <AnimatePresence mode="wait" initial={false}>
            {activity ? (
              <Flex
                key={activity.text}
                as={motion.div}
                alignItems="center"
                columnGap={2}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, y: -3 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {activity.art ? (
                  <Box
                    as="img"
                    src={activity.art}
                    alt="Album art"
                    w="40px"
                    h="40px"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="camp.line"
                    objectFit="cover"
                    flexShrink={0}
                  />
                ) : null}
                <Box textAlign="left" lineHeight="1.15">
                  <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight="medium" color="camp.text">
                    {activity.icon} {activity.text}
                  </Text>
                  {activity.sub ? (
                    <Text fontSize="xs" color={muted}>
                      {activity.sub}
                    </Text>
                  ) : null}
                </Box>
              </Flex>
            ) : (
              <Text
                key="rest"
                as={motion.p}
                fontSize="xs"
                color={muted}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, y: -3 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {online ? UI.readyToChat[lang] : UI.takingRest[lang]}
              </Text>
            )}
          </AnimatePresence>
        </Flex>
      </Flex>
    </Box>
  )
}

export default StatusBar