import { useEffect, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring
} from 'framer-motion'

/**
 * TrailProgress — thanh "con đường mòn" tiến độ cuộn trang: dải gradient
 * teal → ember dán sát mép trên (fixed), scaleX theo scroll (spring làm
 * dịu, không giật). Motif hành trình/stamp rally của Yuru Camp△.
 *
 * prefers-reduced-motion → không render gì cả (trang đã dễ chịu tĩnh).
 * Mount an toàn SSR: render null ở cả server lẫn client trước mount →
 * không hydration mismatch.
 */
const TrailProgress = () => {
  const [mounted, setMounted] = useState(false)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || reduced) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 90,
        transformOrigin: '0% 50%',
        willChange: 'transform',
        background:
          'linear-gradient(90deg, var(--chakra-colors-camp-teal), #73daca 45%, var(--chakra-colors-camp-ember))',
        opacity: 0.85,
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
      }}
    />
  )
}

export default TrailProgress