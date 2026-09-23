import { motion, useReducedMotion } from 'framer-motion'
import { useEntered } from '../../lib/entered'

/**
 * StampTitle — bọc section-title chip lại để chip "ĐÓNG DẤU" xuất hiện
 * (giống 消印/ご当地スタンプ trong Yuru Camp△): spring overshoot + xoay nhẹ,
 * chạy ĐÚNG khi người dùng bấm qua màn che (useEntered).
 * prefers-reduced-motion → chỉ fade mềm, không scale/xoay.
 */
const StampTitle = ({ children, delay = 0 }) => {
  const reduced = useReducedMotion()
  const entered = useEntered()

  return (
    <motion.div
      style={{ display: 'inline-block', willChange: 'transform' }}
      initial={
        reduced ? { opacity: 0 } : { scale: 1.22, rotate: -2.5, opacity: 0 }
      }
      animate={
        entered
          ? reduced
            ? { opacity: 1 }
            : { scale: 1, rotate: 0, opacity: 1 }
          : reduced
            ? { opacity: 0 }
            : { scale: 1.22, rotate: -2.5, opacity: 0 }
      }
      transition={
        reduced
          ? { duration: 0 }
          : {
              type: 'spring',
              stiffness: 340,
              damping: 16,
              mass: 0.7,
              delay
            }
      }
    >
      {children}
    </motion.div>
  )
}

export default StampTitle