import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
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

export const DiscordDot = ({ color, pulse = false, size = 10 }) => (
  <motion.span
    animate={pulse ? { scale: [1, 1.4, 1] } : { scale: 1 }}
    transition={
      pulse
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
  const presence = useDiscordPresence(DISCORD_USER_ID)
  const bg = useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')
  const muted = useColorModeValue('gray.600', 'whiteAlpha.700')
  const pillBg = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const pillBorder = useColorModeValue('blackAlpha.300', 'whiteAlpha.300')
  // Ngôn ngữ theo vòng quay chung của giao diện (10s): Anh ↔ Nhật
  const { lang } = useInterfaceLang()

  if (!presence) {
    return (
      <Box
        borderRadius="lg"
        mb={6}
        p={3}
        textAlign="center"
        bg={bg}
        css={{ backdropFilter: 'blur(10px)' }}
      >
        <Text fontSize="sm" opacity={0.8}>
          {UI.connecting[lang]}
        </Text>
      </Box>
    )
  }

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

  return (
    <Box
      borderRadius="lg"
      mb={6}
      p={3}
      bg={bg}
      css={{ backdropFilter: 'blur(10px)' }}
      // Hover/touch → Rin hiện bubble 「@username」 (giống card project).
      onMouseEnter={() => rinPeek(subName || name)}
      onMouseLeave={rinClear}
      onTouchStart={() => rinPeek(subName || name)}
      onTouchMove={rinClear}
      onTouchCancel={rinClear}
    >
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
          {avatar ? (
            <Box
              as="img"
              src={avatar}
              alt="Discord avatar"
              w="48px"
              h="48px"
              borderRadius="full"
              border="2px solid"
              borderColor={avatarColor}
              objectFit="cover"
              flexShrink={0}
            />
          ) : (
            <Box
              w="48px"
              h="48px"
              borderRadius="full"
              border="2px solid"
              borderColor={avatarColor}
              bg="whiteAlpha.200"
              flexShrink={0}
            />
          )}
          <Box lineHeight="1.15">
            <Flex
              alignItems="center"
              columnGap={2}
              flexWrap="wrap"
              justifyContent={{ base: 'center', sm: 'flex-start' }}
            >
              <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
                {name}
              </Text>
              <DiscordBadges publicFlags={user.public_flags} />
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
                  <Box
                    as="img"
                    src="/images/badge-clan.png"
                    alt=""
                    w="16px"
                    h="16px"
                    flexShrink={0}
                    css={{ display: 'inline-block' }}
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
              <Text fontSize="xs" opacity={0.7}>
                {subName}
              </Text>
            ) : null}
          </Box>
        </Flex>

        {/* BÊN PHẢI: trạng thái + đang làm gì */}
        <Flex
          alignItems="center"
          justifyContent={{ base: 'center', sm: 'flex-end' }}
          flex="1"
          columnGap={3}
          flexWrap="wrap"
        >
          <Text fontSize="sm" fontWeight="medium" whiteSpace="nowrap">
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
          {activity ? (
            <Flex alignItems="center" columnGap={2}>
              {activity.art ? (
                <Box
                  as="img"
                  src={activity.art}
                  alt="Album art"
                  w="40px"
                  h="40px"
                  borderRadius="md"
                  objectFit="cover"
                  flexShrink={0}
                />
              ) : null}
              <Box textAlign="left" lineHeight="1.15">
                <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight="medium">
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
            <Text fontSize="xs" color={muted}>
              {online ? UI.readyToChat[lang] : UI.takingRest[lang]}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}

export default StatusBar
