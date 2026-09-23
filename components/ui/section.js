import { motion, useReducedMotion } from 'framer-motion'
import { chakra, shouldForwardProp } from '@chakra-ui/react'
import { useEntered } from '../../lib/entered'

const StyledDiv = chakra(motion.div, {
  shouldForwardProp: prop => {
    return shouldForwardProp(prop) || prop === 'transition'
  }
})

/**
 * Section — entrance cascade cho từng khối. Chạy ĐÚNG lúc người dùng bấm
 * qua màn che EnterOverlay (useEntered), kèm delay để staggered:
 * trước đây các entrance chạy ở mount (ẩn sau veil — người dùng không thấy).
 * prefers-reduced-motion → chỉ còn fade mềm.
 * mb: khoảng cách dưới khối (mặc định 6; hero dùng mb={0}).
 */
const Section = ({ children, delay = 0, mb = 6 }) => {
  const reduced = useReducedMotion()
  const entered = useEntered()
  const hidden = reduced ? { opacity: 0 } : { y: 10, opacity: 0 }
  const show = { y: 0, opacity: 1 }

  return (
    <StyledDiv
      initial={hidden}
      animate={entered ? show : hidden}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      mb={mb}
    >
      {children}
    </StyledDiv>
  )
}

export default Section