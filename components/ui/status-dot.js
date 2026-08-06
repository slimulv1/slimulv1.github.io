import { Box, useColorModeValue } from '@chakra-ui/react'
import {
  useDiscordPresence,
  DISCORD_USER_ID
} from '../../lib/use-discord-presence'
import { DiscordDot } from './status-bar'

const STATUS_LABEL = {
  online: 'Trực tuyến',
  idle: 'Chờ chút',
  dnd: 'Không làm phiền',
  offline: 'Ngoại tuyến'
}

const STATUS_COLOR = {
  online: '#73daca',
  idle: '#faa61a',
  dnd: '#f04747',
  offline: '#9b9ba5'
}

const StatusDot = () => {
  const presence = useDiscordPresence(DISCORD_USER_ID)
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  if (!presence) return null

  const status = presence.discord_status || 'offline'
  const online = status === 'online'

  return (
    <Box
      px={2}
      py={1}
      borderRadius="full"
      bg={presence ? hoverBg : undefined}
      display="inline-flex"
      alignItems="center"
      title={STATUS_LABEL[status]}
      aria-label={`Discord: ${STATUS_LABEL[status]}`}
      cursor="default"
      userSelect="none"
    >
      <DiscordDot color={STATUS_COLOR[status] || STATUS_COLOR.offline} pulse={online} size={8} />
    </Box>
  )
}

export default StatusDot