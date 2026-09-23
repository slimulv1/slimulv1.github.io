import { Box, Flex } from '@chakra-ui/react'

const FLAGS = [
  { bit: 1 << 0, icon: '🛡️', bg: '#5865F2', title: 'Discord Staff' },
  { bit: 1 << 1, icon: '🤝', bg: '#5865F2', title: 'Partner' },
  { bit: 1 << 2, icon: '🎉', bg: '#F47B67', title: 'HypeSquad Events' },
  { bit: 1 << 3, icon: '🐛', bg: '#5865F2', title: 'Bug Hunter (Level 1)' },
  { bit: 1 << 6, img: '/images/badge-bravery.webp', title: 'HypeSquad Bravery' },
  { bit: 1 << 7, icon: '💡', bg: '#F2C744', title: 'HypeSquad Brilliance' },
  { bit: 1 << 8, icon: '⚖️', bg: '#3BA55D', title: 'HypeSquad Balance' },
  { bit: 1 << 9, icon: '⭐', bg: '#5865F2', title: 'Early Supporter' },
  { bit: 1 << 14, icon: '🐛', bg: '#FAA61A', title: 'Bug Hunter (Level 2)' },
  { bit: 1 << 17, icon: '✓', bg: '#5865F2', title: 'Verified Bot Developer' },
  { bit: 1 << 18, icon: '🛡️', bg: '#3BA55D', title: 'Certified Moderator' },
  { bit: 1 << 22, icon: '⚡', bg: '#5865F2', title: 'Active Developer' }
]

export const DiscordBadges = ({ publicFlags }) => {
  if (!publicFlags) return null

  const shown = FLAGS.filter(f => (publicFlags & f.bit) !== 0)
  if (!shown.length) return null

  return (
    <Flex columnGap="2px" alignItems="center">
      {shown.map(f =>
        f.img ? (
          <img
            key={f.bit}
            src={f.img}
            title={f.title}
            alt={f.title}
            // width/height gốc (256×256) → reserve khung, chống CLS
            width="256"
            height="256"
            style={{
              width: 16,
              height: 16,
              flexShrink: 0,
              userSelect: 'none',
              display: 'inline-block'
            }}
          />
        ) : (
          <Box
            key={f.bit}
            as="span"
            title={f.title}
            w="16px"
            h="16px"
            borderRadius="full"
            bg={f.bg}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            fontSize="9px"
            lineHeight="1"
            flexShrink="0"
            css={{ userSelect: 'none' }}
          >
            {f.icon}
          </Box>
        )
      )}
    </Flex>
  )
}