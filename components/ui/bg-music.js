import { useEffect, useRef, useState } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoMusicalNotes } from 'react-icons/io5'

const TRACK_SRC = '/music/loch-to-tabibito.flac'
const TRACK_NAME = 'Loch to Tabibito'

// Equalizer 3 vạch nhảy khi đang phát
const Equalizer = () => (
  <Box display="flex" alignItems="flex-end" gap="2.5px" h="18px">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        animate={{ height: ['6px', '16px', '9px', '6px'] }}
        transition={{
          repeat: Infinity,
          duration: 1.1,
          delay: i * 0.18,
          ease: 'easeInOut'
        }}
        style={{
          width: 3,
          borderRadius: 2,
          background: '#73daca',
          boxShadow: '0 0 6px rgba(115, 218, 202, 0.8)'
        }}
      />
    ))}
  </Box>
)

const BgMusic = () => {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)

  const bg = useColorModeValue('rgba(255,255,255,0.85)', 'rgba(255,255,255,0.10)')
  const border = useColorModeValue('rgba(0,0,0,0.18)', 'rgba(255,255,255,0.22)')
  const iconColor = useColorModeValue('#2d3748', '#a9b1d6')
  const idleShadow = useColorModeValue(
    '0 4px 14px rgba(0,0,0,0.15)',
    '0 4px 14px rgba(0,0,0,0.4)'
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.45
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => setError(true)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
    }
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      return
    }
    try {
      await audio.play()
    } catch {
      setError(true)
    }
  }

  return (
    <>
      {/* Nhạc nền: chỉ âm thanh, không hiển thị gì */}
      <audio ref={audioRef} src={TRACK_SRC} loop preload="metadata" />

      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        animate={{
          boxShadow: playing
            ? '0 0 18px rgba(115, 218, 202, 0.45)'
            : idleShadow
        }}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: `1px solid ${playing ? '#73daca' : border}`,
          background: bg,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: playing ? '#73daca' : iconColor,
          zIndex: 30,
          opacity: error ? 0.55 : 1,
          transition: 'border-color 0.2s'
        }}
        aria-label={
          playing
            ? `Tạm dừng nhạc nền (${TRACK_NAME})`
            : `Bật nhạc nền (${TRACK_NAME})`
        }
        title={error ? 'Nhạc không phát được' : `${TRACK_NAME} — nhạc nền`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {playing ? (
            <motion.span
              key="eq"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              <Equalizer />
            </motion.span>
          ) : (
            <motion.span
              key="note"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IoMusicalNotes size={20} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}

export default BgMusic