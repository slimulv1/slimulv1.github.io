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
// Bubble "Rin xem chung" dùng chung (Projects / Discord / On the web — xem lib/rin-peek.js)
import { rinPeek, rinClear } from '../../lib/rin-peek'
// Ngôn ngữ giao diện xoay vòng 15s + từ điển text/timeAgo (vi/en/ja)
import { useInterfaceLang } from '../../lib/interface-lang'
import { UI, timeAgo } from '../../lib/interface-labels'

const mono =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'M PLUS Rounded 1c', monospace"

// "push X trước" — thời gian tương đối theo ngôn ngữ giao diện
// (dùng chung timeAgo từ lib/interface-labels.js, khớp vòng xoay 15s)

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

const ProjectCard = ({ repo, index = 0 }) => {
  const bg = 'camp.card'
  const border = 'camp.line'
  const nameColor = 'camp.text'
  const descColor = 'camp.muted'
  // muted phải đủ contrast ở cỡ 12px (AA ≥ 4.5:1)
  const mutedColor = 'camp.muted'
  const pathColor = 'camp.muted'
  const arrowColor = 'camp.text'
  // Bóng clay + highlight mép trên; hover border chuyển teal (nhận diện)
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 14px 28px -18px rgba(120,90,40,0.4), 0 3px 8px -4px rgba(120,90,40,0.16)',
    'inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 28px -18px rgba(0,0,0,0.6), 0 3px 8px -4px rgba(0,0,0,0.3)'
  )
  const hoverBorder = 'camp.teal'
  // "push X trước" tính client-side để không bị đóng băng lúc build.
  // Live data (quét profile) không có pushedAt → không hiện dòng này.
  // timeAgo theo ngôn ngữ giao diện đang xoay vòng → recompute khi lang đổi.
  const { lang } = useInterfaceLang()
  const [pushedLabel, setPushedLabel] = useState(null)
  useEffect(() => {
    if (repo.pushedAt) setPushedLabel(timeAgo(lang, repo.pushedAt))
    else setPushedLabel(null)
  }, [repo.pushedAt, lang])

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
        onMouseEnter={() => rinPeek(repo.name)}
        onMouseLeave={rinClear}
        // Mobile: touch không sinh mouseenter → bubble peek qua touchstart
        // (tap) để tính năng cũng chạy trên điện thoại; touchmove/touchcancel
        // xoá nếu user chỉ vuốt cuộn (tránh bubble giả khi lướt trang).
        onTouchStart={() => rinPeek(repo.name)}
        onTouchMove={rinClear}
        onTouchCancel={rinClear}
        // Keyboard: focus/blur cũng bật/tắt bubble peek (trước đây chỉ hover/touch)
        onFocus={() => rinPeek(repo.name)}
        onBlur={rinClear}
      >
        <Flex
          role="group"
          direction="column"
          gap={3}
          p={5}
          borderRadius="card"
          borderWidth="1.5px"
          borderStyle="solid"
          borderColor={border}
          bg={bg}
          boxShadow={cardShadow}
          h="100%"
          transition="border-color 0.2s, transform 0.2s, box-shadow 0.2s"
          _hover={{
            borderColor: hoverBorder,
            transform: 'translateY(-3px)',
            boxShadow:
              '0 0 0 1.5px rgba(115, 218, 202, 0.25), 0 18px 34px -18px rgba(115, 218, 202, 0.35), 0 3px 8px -4px rgba(120,90,40,0.16)'
          }}
          _focusWithin={{
            borderColor: hoverBorder,
            boxShadow: '0 0 0 1.5px rgba(115, 218, 202, 0.3)'
          }}
        >
          {/* Header: số trạm dọc đường + prompt + star + mũi tên */}
          <Flex justify="space-between" align="center" gap={2}>
            <Flex align="center" gap={2} minW={0} flex="1">
              {/* Số trạm (rally checkpoint) — vòng tròn nét đứt; không đổi
                  theo ngôn ngữ nên an toàn với bất biến en≡ja */}
              <Box
                flexShrink={0}
                w="24px"
                h="24px"
                borderRadius="full"
                border="1.5px dashed"
                borderColor="camp.ember"
                color="camp.emberText"
                fontFamily={mono}
                fontSize="10px"
                fontWeight={800}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                title={`camp site ${index + 1}`}
              >
                {String(index + 1).padStart(2, '0')}
              </Box>
              <Text
                fontFamily={mono}
                fontSize="sm"
                fontWeight="bold"
                color={nameColor}
                noOfLines={1}
                minW={0}
              >
                <Text as="span" color={pathColor} mr={1} fontWeight="normal">
                  △ ~/
                </Text>
                {repo.name}
              </Text>
            </Flex>
            <Flex align="center" gap={2.5} flexShrink={0}>
              {repo.stars > 0 && (
                <Flex
                  align="center"
                  gap={1}
                  color={mutedColor}
                  title={UI.stars[lang]}
                >
                  <IoStar size="12" aria-hidden="true" focusable="false" />
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
                <IoArrowForward size={14} aria-hidden="true" focusable="false" />
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
  const { lang } = useInterfaceLang()
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
    <>
      {/* Nhãn hành trình: tem "outdoor activity record" (tên sổ trong bộ:
          野外活動記録) giữa hai đường chấm — các repo như trạm dọc đường */}
      <Flex alignItems="center" columnGap={3} mb={5} userSelect="none">
        <Box flex="1" minW={0} h={0} borderTop="1.5px dashed" borderColor="camp.lineStrong" />
        <Flex
          as="span"
          alignItems="center"
          columnGap={2}
          px={3}
          py={0.5}
          borderRadius="full"
          border="1.5px dashed"
          borderColor="camp.ember"
          bg="camp.emberSoft"
          color="camp.emberText"
          fontFamily={mono}
          fontSize="xs"
          fontWeight={800}
          letterSpacing="0.06em"
          whiteSpace="nowrap"
          flexShrink={0}
          transform="rotate(-1.2deg)"
        >
          <Text as="span" aria-hidden="true">
            ⊿
          </Text>
          <Text as="span">{UI.routeTitle[lang]}</Text>
        </Flex>
        <Box flex="1" minW={0} h={0} borderTop="1.5px dashed" borderColor="camp.lineStrong" />
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {list.map((repo, i) => (
          <ProjectCard key={repo.name} repo={repo} index={i} />
        ))}
      </SimpleGrid>
    </>
  )
}

export default Projects
