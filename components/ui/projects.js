import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  useColorModeValue,
  Link
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { IoStar, IoArrowForward } from 'react-icons/io5'
// Snapshot thủ công — chỉ dùng làm fallback khi GitHub không có dữ liệu (xem lib/github-data.js)
import pinnedRepos from '../../lib/pinned-repos.json'
// Live: tự quét phần pin trên profile github không cần token/rebuild (xem lib/live-pinned.js)
import { fetchLivePinned } from '../../lib/live-pinned'

const mono =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace"

// "push X trước" — thời gian tương đối bằng tiếng Việt
const timeAgo = dateStr => {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 0) return 'vừa xong'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  const hours = Math.floor(mins / 60)
  if (hours < 1) return `${mins} phút trước`
  const days = Math.floor(hours / 24)
  if (days < 1) return `${hours} giờ trước`
  const weeks = Math.floor(days / 7)
  if (weeks < 1) return `${days} ngày trước`
  const months = Math.floor(days / 30)
  if (months < 1) return `${weeks} tuần trước`
  const years = Math.floor(days / 365)
  if (years < 1) return `${months} tháng trước`
  return `${years} năm trước`
}

// ANIMATION: mỗi card tự điều khiển (initial/whileInView riêng) chứ không thừa hưởng từ container.
// Lý do: danh sách live có thể thêm card MỚI vào sau khi container đã chạy whileInView xong (once:true)
// → card mount muộn kẹt ở hidden. With per-card trigger, card mới tự animate khi vào view.
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' }
  })
}

// Hover card → nhờ Rin "xem chung": bubble của Rin hiện tên project (CustomEvent,
// CornerRin ở góc trang lắng nghe; chỉ thêm handler, không đổi markup/animation card).
const peekRepo = name =>
  window.dispatchEvent(
    new CustomEvent('rin:peek', { detail: String(name || '') })
  )
const peekClear = () => window.dispatchEvent(new CustomEvent('rin:clear'))

const ProjectCard = ({ repo, index = 0 }) => {
  const bg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.50')
  const border = useColorModeValue('blackAlpha.300', 'whiteAlpha.200')
  const nameColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  const descColor = useColorModeValue('gray.600', 'whiteAlpha.700')
  // muted phải đủ contrast ở cỡ 12px (AA ≥ 4.5:1)
  const mutedColor = useColorModeValue('gray.600', 'whiteAlpha.600')
  const pathColor = useColorModeValue('gray.500', 'gray.500')
  const arrowColor = useColorModeValue('gray.700', 'whiteAlpha.700')
  // hover ring hiển thị rõ ở cả 2 mode
  const hoverBorder = useColorModeValue('#2b6f6a', 'grassTeal')
  // "push X trước" tính client-side để không bị đóng băng lúc build.
  // Live data (quét profile) không có pushedAt → không hiện dòng này.
  const [pushedLabel, setPushedLabel] = useState(null)
  useEffect(() => {
    if (repo.pushedAt) setPushedLabel(timeAgo(repo.pushedAt))
    else setPushedLabel(null)
  }, [repo.pushedAt])

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      style={{ height: '100%' }}
    >
      <Link
        href={repo.url}
        isExternal
        display="block"
        h="100%"
        _hover={{ textDecoration: 'none' }}
        onMouseEnter={() => peekRepo(repo.name)}
        onMouseLeave={peekClear}
        // Mobile: touch không sinh mouseenter → bubble peek qua touchstart
        // (tap) để tính năng cũng chạy trên điện thoại; touchmove/touchcancel
        // xoá nếu user chỉ vuốt cuộn (tránh bubble giả khi lướt trang).
        onTouchStart={() => peekRepo(repo.name)}
        onTouchMove={peekClear}
        onTouchCancel={peekClear}
      >
        <Flex
          role="group"
          direction="column"
          gap={2.5}
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={border}
          bg={bg}
          boxShadow={useColorModeValue('0 1px 3px rgba(0,0,0,0.08)', 'none')}
          css={{ backdropFilter: 'blur(10px)' }}
          h="100%"
          transition="border-color 0.2s, transform 0.2s, box-shadow 0.2s"
          _hover={{
            borderColor: hoverBorder,
            transform: 'translateY(-2px)',
            boxShadow:
              '0 0 0 1px rgba(115, 218, 202, 0.35), 0 8px 24px -12px rgba(115, 218, 202, 0.25)'
          }}
          _focusWithin={{
            borderColor: hoverBorder,
            boxShadow: '0 0 0 1px rgba(115, 218, 202, 0.35)'
          }}
        >
          {/* Header: đường dẫn kiểu prompt + star + mũi tên */}
          <Flex justify="space-between" align="center" gap={2}>
            <Text
              fontFamily={mono}
              fontSize="sm"
              fontWeight="bold"
              color={nameColor}
              noOfLines={1}
            >
              <Text as="span" color={pathColor} mr={1} fontWeight="normal">
                ~/
              </Text>
              {repo.name}
            </Text>
            <Flex align="center" gap={2.5} flexShrink={0}>
              {repo.stars > 0 && (
                <Flex align="center" gap={1} color={mutedColor} title="Stars">
                  <IoStar size="12" aria-hidden="true" />
                  <Text fontSize="xs" fontFamily={mono}>
                    {repo.stars}
                  </Text>
                </Flex>
              )}
              <Box
                color={arrowColor}
                opacity={0.6}
                transition="opacity 0.2s, transform 0.2s"
                _groupHover={{ opacity: 1, transform: 'translateX(3px)' }}
                aria-hidden="true"
              >
                <IoArrowForward size={14} />
              </Box>
            </Flex>
          </Flex>

          {/* Mô tả */}
          <Text
            fontSize="sm"
            color={descColor}
            noOfLines={2}
            flex="1"
            lineHeight="1.5"
          >
            {repo.description}
          </Text>

          {/* Chân: ngôn ngữ + thời gian push */}
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={2} color={mutedColor}>
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg={repo.language.color}
                boxShadow={`0 0 6px ${repo.language.color}`}
                flexShrink={0}
              />
              <Text fontSize="xs" fontFamily={mono}>
                {repo.language.name}
              </Text>
            </Flex>
            <Text fontSize="xs" color={mutedColor} fontFamily={mono}>
              {pushedLabel ? `push ${pushedLabel}` : ''}
            </Text>
          </Flex>
        </Flex>
      </Link>
    </motion.div>
  )
}

// Chữ ký dữ liệu để so sánh: chỉ cập nhật state khi list THỰC SỰ đổi
// (tránh re-render + replay animation vô nghĩa mỗi lần poll)
const repoSignature = r =>
  [
    r.name,
    r.description,
    r.language && r.language.name,
    r.language && r.language.color,
    r.stars
  ].join('|')
const listsEqual = (a, b) =>
  a.length === b.length &&
  a.every((r, i) => repoSignature(r) === repoSignature(b[i]))

const Projects = ({ repos = pinnedRepos }) => {
  // Dữ liệu build (getStaticProps) giữ làm khung SSR/không-JS —
  // rồi lặng lẽ thay bằng dữ liệu pin mới nhất (lần load + định kỳ).
  const [list, setList] = useState(repos)
  useEffect(() => {
    let alive = true
    let inFlight = false

    const refresh = () => {
      if (inFlight || !alive) return
      inFlight = true
      fetchLivePinned()
        .then(live => {
          if (!alive || !live) return
          setList(prev => (listsEqual(prev, live) ? prev : live))
        })
        .catch(err => {
          console.warn('[projects] live refresh error:', err && err.message)
        })
        .finally(() => {
          inFlight = false
        })
    }

    refresh()
    // Tự quét lại định kỳ khi tab còn mở + ngay khi quay lại tab —
    // pin/unpin repo sẽ xuất hiện mà không cần reload trang.
    const interval = setInterval(refresh, 5 * 60 * 1000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)

    return () => {
      alive = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      {list.map((repo, i) => (
        <ProjectCard key={repo.name} repo={repo} index={i} />
      ))}
    </SimpleGrid>
  )
}

export default Projects
