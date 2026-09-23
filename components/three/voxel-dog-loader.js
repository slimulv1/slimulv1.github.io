import { forwardRef } from 'react'
import { Box, Spinner } from '@chakra-ui/react'

export const DogSpinner = () => (
  <Spinner
    size="xl"
    position="absolute"
    left="50%"
    top="50%"
    ml="calc(0px - var(--spinner-size) / 2)"
    mt="calc(0px - var(--spinner-size))"
  />
)

/**
 * DogFallback — trạng thái dự phòng khi model 3D không tải được (mạng bị
 * chặn, thiếu WebGL, file hỏng...).
 *
 * Trước đây lỗi này để lại spinner quay vô hạn + canvas trắng 640×640: trông
 * như trang bị treo. Nay vẫn giữ ĐÚNG khung container (không dịch layout) nhưng
 * hiện dấu lều △ — dùng lại đúng asset `/images/logo.png` của navbar thay vì
 * vẽ SVG thú bằng tay (bản vẽ tay bị đọc nhầm thành MÈO: tai nhọn + đuôi mỏng).
 * △ cũng là motif xuyên suốt site (mọi section title đều có △, lều trại trong
 * dải banner) nên trạng thái lỗi vẫn giữ đúng ngôn ngữ thị giác. Chỉ là ảnh tĩnh
 * — không tốn GPU, không ảnh hưởng đường chạy bình thường (chỉ khi `failed`).
 */
export const DogFallback = () => (
  <Box
    position="absolute"
    left="50%"
    top="46%"
    transform="translate(-50%, -50%)"
    textAlign="center"
    aria-hidden="true"
  >
    <img
      src="/images/logo.png"
      alt=""
      width="128"
      height="128"
      style={{ width: 140, height: 140, opacity: 0.55 }}
    />
  </Box>
)

export const DogContainer = forwardRef(({ children }, ref) => (
  <Box
    ref={ref}
    className="voxel-dog"
    m="auto"
    mt={['-20px', '-60px', '-120px']}
    mb={['-40px', '-140px', '-200px']}
    w={[280, 480, 640]}
    h={[280, 480, 640]}
    position="relative"
  >
    {children}
  </Box>
))

const Loader = () => {
  return (
    <DogContainer>
      <DogSpinner />
    </DogContainer>
  )
}

export default Loader
