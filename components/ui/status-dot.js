import { Box, useColorModeValue } from '@chakra-ui/react'
import {
  useDiscordPresence,
  DISCORD_USER_ID
} from '../../lib/use-discord-presence'
import { useInterfaceLang } from '../../lib/interface-lang'
import { DiscordDot, STATUS } from './status-bar'

const StatusDot = () => {
  const presence = useDiscordPresence(DISCORD_USER_ID)
  // Tooltip trạng thái theo ngôn ngữ giao diện đang xoay vòng (15s)
  const { lang } = useInterfaceLang()
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  if (!presence) return null

  const raw = presence.discord_status || 'offline'
  const status = STATUS[raw] || STATUS.offline
  const online = raw === 'online'

  return (
    <Box
      px={2}
      py={1}
      borderRadius="full"
      bg={presence ? hoverBg : undefined}
      display="inline-flex"
      alignItems="center"
      title={`Discord: ${status.labels[lang]}`}
      aria-label={`Discord: ${status.labels[lang]}`}
      cursor="default"
      userSelect="none"
    >
      <DiscordDot color={status.color} pulse={online} size={8} />
    </Box>
  )
}

export default StatusDot
